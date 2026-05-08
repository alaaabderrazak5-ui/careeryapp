
-- =========================================================
-- ROLES (data-driven)
-- =========================================================
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name app_role NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles readable by all" ON public.roles FOR SELECT USING (true);
CREATE POLICY "admins manage roles" ON public.roles FOR ALL
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.roles (name,label,description,permissions) VALUES
  ('student','Student','Discover careers and study paths','["profile:edit","jobs:view","advisor:use"]'::jsonb),
  ('job_seeker','Job Seeker','Find jobs and apply','["profile:edit","jobs:view","jobs:apply","advisor:use"]'::jsonb),
  ('employer','Employer','Post jobs and find candidates','["company:manage","jobs:manage","candidates:view"]'::jsonb),
  ('recruiter','Recruiter','Source and contact candidates','["candidates:view","candidates:contact","jobs:view"]'::jsonb),
  ('admin','Admin','Full platform access','["*"]'::jsonb);

CREATE POLICY "users can remove their own roles" ON public.user_roles FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role = ANY(_roles))
$$;
REVOKE EXECUTE ON FUNCTION public.has_any_role(uuid, app_role[]) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.name = ur.role
    WHERE ur.user_id = _user_id
      AND (r.permissions ? _permission OR r.permissions ? '*')
  )
$$;
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC, anon, authenticated;

-- =========================================================
-- PROFILE EXTENSIONS
-- =========================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS remote_preference text CHECK (remote_preference IN ('remote','hybrid','onsite','any')),
  ADD COLUMN IF NOT EXISTS salary_min integer,
  ADD COLUMN IF NOT EXISTS salary_max integer,
  ADD COLUMN IF NOT EXISTS salary_currency text DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS cv_url text,
  ADD COLUMN IF NOT EXISTS completion_pct integer NOT NULL DEFAULT 0;

CREATE POLICY "users can delete their own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- =========================================================
-- EDUCATION / EXPERIENCE / CERTIFICATIONS / etc.
-- =========================================================
CREATE TABLE public.education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution text NOT NULL, degree text, field text,
  start_date date, end_date date, is_current boolean DEFAULT false, description text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company text NOT NULL, title text NOT NULL, location text,
  work_mode text CHECK (work_mode IN ('remote','hybrid','onsite')),
  start_date date, end_date date, is_current boolean DEFAULT false, description text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL, issuer text, issued_at date, expires_at date, credential_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.user_languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language text NOT NULL,
  proficiency text CHECK (proficiency IN ('basic','conversational','fluent','native')),
  UNIQUE(user_id, language)
);
CREATE TABLE public.user_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interest text NOT NULL,
  UNIQUE(user_id, interest)
);
CREATE TABLE public.career_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal text NOT NULL, target_role text, timeline text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.portfolio_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL, url text NOT NULL, link_type text
);
CREATE TABLE public.study_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program text NOT NULL, school text,
  status text CHECK (status IN ('planning','in_progress','completed','paused')),
  target_career text, notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$ DECLARE t text; BEGIN
  FOR t IN SELECT unnest(ARRAY['education','experiences','certifications','user_languages','user_interests','career_goals','portfolio_links','study_paths']) LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('CREATE POLICY "public read" ON public.%I FOR SELECT USING (true);', t);
    EXECUTE format('CREATE POLICY "owner insert" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id);', t);
    EXECUTE format('CREATE POLICY "owner update" ON public.%I FOR UPDATE USING (auth.uid() = user_id);', t);
    EXECUTE format('CREATE POLICY "owner delete" ON public.%I FOR DELETE USING (auth.uid() = user_id);', t);
  END LOOP;
END $$;

-- =========================================================
-- SKILLS
-- =========================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE public.skill_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE, slug text NOT NULL UNIQUE, icon text
);
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE, slug text NOT NULL UNIQUE,
  category_id uuid REFERENCES public.skill_categories(id) ON DELETE SET NULL,
  is_custom boolean NOT NULL DEFAULT false,
  is_approved boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_skills_name_trgm ON public.skills USING gin (name gin_trgm_ops);

CREATE TABLE public.user_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  level smallint NOT NULL DEFAULT 3 CHECK (level BETWEEN 1 AND 5),
  years numeric(4,1) DEFAULT 0,
  UNIQUE(user_id, skill_id)
);

ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories public read" ON public.skill_categories FOR SELECT USING (true);
CREATE POLICY "admin manage categories" ON public.skill_categories FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "skills public read" ON public.skills FOR SELECT USING (is_approved OR created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "users can suggest skills" ON public.skills FOR INSERT WITH CHECK (auth.uid() = created_by AND is_custom = true);
CREATE POLICY "admin update skills" ON public.skills FOR UPDATE USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete skills" ON public.skills FOR DELETE USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "user_skills public read" ON public.user_skills FOR SELECT USING (true);
CREATE POLICY "user_skills owner insert" ON public.user_skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_skills owner update" ON public.user_skills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_skills owner delete" ON public.user_skills FOR DELETE USING (auth.uid() = user_id);

INSERT INTO public.skill_categories(name,slug,icon) VALUES
 ('Programming','programming','code'),('Design','design','palette'),
 ('Data','data','database'),('Marketing','marketing','megaphone'),
 ('Business','business','briefcase'),('Soft Skills','soft-skills','users'),
 ('Languages','languages','globe');

INSERT INTO public.skills(name,slug,category_id)
SELECT s.n, s.sl, c.id FROM (VALUES
 ('JavaScript','javascript','programming'),('TypeScript','typescript','programming'),
 ('React','react','programming'),('Node.js','nodejs','programming'),
 ('Python','python','programming'),('SQL','sql','data'),
 ('PostgreSQL','postgresql','data'),('Figma','figma','design'),
 ('UI Design','ui-design','design'),('UX Research','ux-research','design'),
 ('SEO','seo','marketing'),('Content Marketing','content-marketing','marketing'),
 ('Project Management','project-management','business'),('Communication','communication','soft-skills'),
 ('Leadership','leadership','soft-skills'),('English','english','languages'),
 ('French','french','languages'),('Spanish','spanish','languages')
) AS s(n,sl,cat)
JOIN public.skill_categories c ON c.slug = s.cat;

-- =========================================================
-- COMPANIES / JOBS / APPLICATIONS
-- =========================================================
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, slug text NOT NULL UNIQUE,
  logo_url text, website text, description text,
  size text, industry text, location text,
  verified boolean NOT NULL DEFAULT false,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_role text NOT NULL CHECK (member_role IN ('owner','recruiter','member')),
  UNIQUE(company_id,user_id)
);

CREATE OR REPLACE FUNCTION public.is_company_member(_uid uuid, _company uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(SELECT 1 FROM public.company_members WHERE user_id=_uid AND company_id=_company)
$$;
REVOKE EXECUTE ON FUNCTION public.is_company_member(uuid, uuid) FROM PUBLIC, anon, authenticated;

CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title text NOT NULL, description text NOT NULL,
  work_mode text CHECK (work_mode IN ('remote','hybrid','onsite')),
  location text, salary_min integer, salary_max integer, salary_currency text DEFAULT 'USD',
  experience_level text CHECK (experience_level IN ('intern','junior','mid','senior','lead','exec')),
  education_level text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','open','closed','archived')),
  expires_at timestamptz,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_company ON public.jobs(company_id);

CREATE TABLE public.job_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  weight smallint NOT NULL DEFAULT 1,
  is_required boolean NOT NULL DEFAULT false,
  min_level smallint DEFAULT 1 CHECK (min_level BETWEEN 1 AND 5),
  UNIQUE(job_id, skill_id)
);
CREATE TABLE public.job_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  tag text NOT NULL
);
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','reviewing','interview','offer','rejected','withdrawn')),
  cover_letter text, cv_url text, match_score numeric(5,2),
  applied_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(job_id, user_id)
);
CREATE TABLE public.saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(job_id,user_id)
);
CREATE TABLE public.saved_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(candidate_id, saved_by)
);
CREATE TABLE public.match_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  score numeric(5,2) NOT NULL, breakdown jsonb,
  computed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, job_id)
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "companies public read" ON public.companies FOR SELECT USING (true);
CREATE POLICY "owners create company" ON public.companies FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owners update company" ON public.companies FOR UPDATE USING (auth.uid() = owner_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "owners delete company" ON public.companies FOR DELETE USING (auth.uid() = owner_id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "members read" ON public.company_members FOR SELECT USING (true);
CREATE POLICY "owners manage members" ON public.company_members FOR ALL
  USING (EXISTS(SELECT 1 FROM public.companies c WHERE c.id=company_id AND c.owner_id=auth.uid()) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (EXISTS(SELECT 1 FROM public.companies c WHERE c.id=company_id AND c.owner_id=auth.uid()) OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "jobs read" ON public.jobs FOR SELECT USING (
  status = 'open' OR public.is_company_member(auth.uid(), company_id) OR public.has_role(auth.uid(),'admin')
);
CREATE POLICY "members create jobs" ON public.jobs FOR INSERT WITH CHECK (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "members update jobs" ON public.jobs FOR UPDATE USING (public.is_company_member(auth.uid(), company_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "members delete jobs" ON public.jobs FOR DELETE USING (public.is_company_member(auth.uid(), company_id) OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "job_skills read" ON public.job_skills FOR SELECT USING (true);
CREATE POLICY "job_skills write" ON public.job_skills FOR ALL
  USING (EXISTS(SELECT 1 FROM public.jobs j WHERE j.id=job_id AND public.is_company_member(auth.uid(),j.company_id)))
  WITH CHECK (EXISTS(SELECT 1 FROM public.jobs j WHERE j.id=job_id AND public.is_company_member(auth.uid(),j.company_id)));

CREATE POLICY "job_tags read" ON public.job_tags FOR SELECT USING (true);
CREATE POLICY "job_tags write" ON public.job_tags FOR ALL
  USING (EXISTS(SELECT 1 FROM public.jobs j WHERE j.id=job_id AND public.is_company_member(auth.uid(),j.company_id)))
  WITH CHECK (EXISTS(SELECT 1 FROM public.jobs j WHERE j.id=job_id AND public.is_company_member(auth.uid(),j.company_id)));

CREATE POLICY "applications read" ON public.applications FOR SELECT USING (
  auth.uid() = user_id 
  OR EXISTS(SELECT 1 FROM public.jobs j WHERE j.id = job_id AND public.is_company_member(auth.uid(), j.company_id))
  OR public.has_role(auth.uid(),'admin')
);
CREATE POLICY "applicant submits" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "applications update" ON public.applications FOR UPDATE USING (
  auth.uid() = user_id 
  OR EXISTS(SELECT 1 FROM public.jobs j WHERE j.id = job_id AND public.is_company_member(auth.uid(), j.company_id))
);
CREATE POLICY "applicant deletes" ON public.applications FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "saved_jobs owner all" ON public.saved_jobs FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
CREATE POLICY "saved_candidates owner all" ON public.saved_candidates FOR ALL USING (auth.uid()=saved_by) WITH CHECK (auth.uid()=saved_by);

CREATE POLICY "match_scores read" ON public.match_scores FOR SELECT USING (
  auth.uid()=user_id
  OR EXISTS(SELECT 1 FROM public.jobs j WHERE j.id=job_id AND public.is_company_member(auth.uid(), j.company_id))
  OR public.has_role(auth.uid(),'admin')
);
CREATE POLICY "match_scores admin write" ON public.match_scores FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- CMS
-- =========================================================
CREATE TABLE public.cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE, title text NOT NULL,
  meta_description text, is_published boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.cms_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES public.cms_pages(id) ON DELETE CASCADE,
  block_type text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_visible boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.cms_navigation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL CHECK (location IN ('navbar','footer')),
  label text NOT NULL, url text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true
);
CREATE TABLE public.cms_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_pages read" ON public.cms_pages FOR SELECT USING (is_published OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "cms_blocks read" ON public.cms_blocks FOR SELECT USING (is_visible OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "cms_nav read" ON public.cms_navigation FOR SELECT USING (is_visible OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "cms_settings read" ON public.cms_settings FOR SELECT USING (true);

CREATE POLICY "cms_pages admin all" ON public.cms_pages FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "cms_blocks admin all" ON public.cms_blocks FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "cms_nav admin all" ON public.cms_navigation FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "cms_settings admin all" ON public.cms_settings FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.cms_pages(slug,title,meta_description) VALUES
 ('home','CAREERY — AI-Powered Career & Recruitment','Discover your future career with AI-driven guidance, smart matching, and a complete recruitment ecosystem.');

INSERT INTO public.cms_blocks(page_id,block_type,position,content)
SELECT id,'hero',0, jsonb_build_object(
  'eyebrow','AI-Powered Career Ecosystem',
  'title','Find your future. Hire your future.',
  'subtitle','CAREERY connects students, job seekers and employers through intelligent matching, skill analysis and AI career guidance.',
  'primary_cta', jsonb_build_object('label','Get started','url','/auth'),
  'secondary_cta', jsonb_build_object('label','Explore jobs','url','/jobs')
) FROM public.cms_pages WHERE slug='home';

INSERT INTO public.cms_blocks(page_id,block_type,position,content)
SELECT id,'features',1, jsonb_build_object('items', jsonb_build_array(
  jsonb_build_object('icon','sparkles','title','AI Career Advisor','body','Personalized guidance powered by Gemini.'),
  jsonb_build_object('icon','target','title','Smart Matching','body','Compatibility scores between you and every opportunity.'),
  jsonb_build_object('icon','briefcase','title','Recruitment Suite','body','Post jobs, rank candidates, manage pipelines.'),
  jsonb_build_object('icon','graduation-cap','title','Study Paths','body','Discover the right learning journey to your dream role.')
)) FROM public.cms_pages WHERE slug='home';

INSERT INTO public.cms_blocks(page_id,block_type,position,content)
SELECT id,'stats',2, jsonb_build_object('items', jsonb_build_array(
  jsonb_build_object('label','Active members','source','users'),
  jsonb_build_object('label','Live jobs','source','jobs'),
  jsonb_build_object('label','Companies','source','companies'),
  jsonb_build_object('label','Skills tracked','source','skills')
)) FROM public.cms_pages WHERE slug='home';

INSERT INTO public.cms_blocks(page_id,block_type,position,content)
SELECT id,'faq',3, jsonb_build_object('items', jsonb_build_array(
  jsonb_build_object('q','Is CAREERY free for job seekers?','a','Yes — core features are free. Premium unlocks deeper AI insights.'),
  jsonb_build_object('q','Can I be both a student and a job seeker?','a','Absolutely. You can hold multiple roles and switch context anytime.'),
  jsonb_build_object('q','How does AI matching work?','a','We score every job against your profile across skills, experience, salary, location and goals.')
)) FROM public.cms_pages WHERE slug='home';

INSERT INTO public.cms_navigation(location,label,url,position) VALUES
 ('navbar','Jobs','/jobs',0),('navbar','For employers','/employers',1),('navbar','Pricing','/pricing',2),
 ('footer','About','/about',0),('footer','Privacy','/privacy',1),('footer','Terms','/terms',2);

INSERT INTO public.cms_settings(key,value) VALUES
 ('brand', '{"name":"CAREERY","tagline":"AI-Powered Career Ecosystem"}'::jsonb),
 ('logo_url','""'::jsonb),
 ('favicon_url','""'::jsonb),
 ('theme', '{"primary":"oklch(0.55 0.22 260)","accent":"oklch(0.85 0.18 95)","background":"oklch(0.99 0 0)"}'::jsonb);

DO $$ DECLARE t text; BEGIN
  FOR t IN SELECT unnest(ARRAY['education','experiences','companies','jobs','applications','cms_pages','cms_blocks','cms_settings']) LOOP
    EXECUTE format('CREATE TRIGGER %I_set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();', t, t);
  END LOOP;
END $$;

-- =========================================================
-- STORAGE BUCKETS
-- =========================================================
INSERT INTO storage.buckets(id,name,public) VALUES
 ('avatars','avatars',true),('cvs','cvs',false),
 ('company-logos','company-logos',true),('cms-media','cms-media',true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "avatars public read" ON storage.objects FOR SELECT USING (bucket_id='avatars');
CREATE POLICY "avatars owner write" ON storage.objects FOR INSERT WITH CHECK (bucket_id='avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars owner update" ON storage.objects FOR UPDATE USING (bucket_id='avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars owner delete" ON storage.objects FOR DELETE USING (bucket_id='avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "cvs owner read" ON storage.objects FOR SELECT USING (bucket_id='cvs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "cvs owner write" ON storage.objects FOR INSERT WITH CHECK (bucket_id='cvs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "cvs owner update" ON storage.objects FOR UPDATE USING (bucket_id='cvs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "cvs owner delete" ON storage.objects FOR DELETE USING (bucket_id='cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "logos public read" ON storage.objects FOR SELECT USING (bucket_id='company-logos');
CREATE POLICY "logos auth write" ON storage.objects FOR INSERT WITH CHECK (bucket_id='company-logos' AND auth.uid() IS NOT NULL);
CREATE POLICY "logos auth update" ON storage.objects FOR UPDATE USING (bucket_id='company-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "cms-media public read" ON storage.objects FOR SELECT USING (bucket_id='cms-media');
CREATE POLICY "cms-media admin write" ON storage.objects FOR INSERT WITH CHECK (bucket_id='cms-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "cms-media admin update" ON storage.objects FOR UPDATE USING (bucket_id='cms-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "cms-media admin delete" ON storage.objects FOR DELETE USING (bucket_id='cms-media' AND public.has_role(auth.uid(),'admin'));
