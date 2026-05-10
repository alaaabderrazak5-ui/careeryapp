
INSERT INTO public.user_roles (user_id, role)
VALUES ('f8f95dde-2a7c-4956-84f0-557961681546', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.career_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text,
  short_description text,
  why_match text,
  required_skills text[] DEFAULT '{}',
  roadmap jsonb DEFAULT '[]'::jsonb,
  certifications text[] DEFAULT '{}',
  future_opportunities text[] DEFAULT '{}',
  score_keywords jsonb DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.career_paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "career_paths public read" ON public.career_paths FOR SELECT USING (is_active OR has_role(auth.uid(),'admin'));
CREATE POLICY "career_paths admin all" ON public.career_paths FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER career_paths_updated BEFORE UPDATE ON public.career_paths FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position integer NOT NULL DEFAULT 0,
  question text NOT NULL,
  helper text,
  category text,
  is_multiselect boolean NOT NULL DEFAULT true,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz public read" ON public.quiz_questions FOR SELECT USING (is_active OR has_role(auth.uid(),'admin'));
CREATE POLICY "quiz admin all" ON public.quiz_questions FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER quiz_questions_updated BEFORE UPDATE ON public.quiz_questions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.cms_settings (key, value) VALUES
  ('branding', '{"site_name":"CAREERY","tagline":"AI-powered career & recruitment ecosystem","logo_url":null}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.cms_navigation (location, label, url, position, is_visible) VALUES
  ('navbar','Home','/',0,true),
  ('navbar','Job Seeker','/jobs',1,true),
  ('navbar','Students','/students',2,true),
  ('navbar','Employer','/employer',3,true),
  ('navbar','Recruiter','/recruiter',4,true),
  ('navbar','About','/about',5,true),
  ('navbar','Contact','/contact',6,true);

INSERT INTO public.quiz_questions (position, question, category, is_multiselect, options) VALUES
  (0,'Which activities energize you most?','interests',true,
   '[{"value":"build_software","label":"Building software & solving logic puzzles"},{"value":"design_visual","label":"Designing visual experiences"},{"value":"analyze_data","label":"Analyzing data and finding patterns"},{"value":"lead_people","label":"Leading and coordinating people"},{"value":"create_content","label":"Creating content & storytelling"},{"value":"help_others","label":"Helping & teaching others"}]'::jsonb),
  (1,'Which subjects fascinate you?','subjects',true,
   '[{"value":"ai_ml","label":"AI & Machine Learning"},{"value":"design","label":"Design & Creativity"},{"value":"business","label":"Business & Strategy"},{"value":"science","label":"Science & Research"},{"value":"finance","label":"Finance & Economics"},{"value":"health","label":"Health & Biology"}]'::jsonb),
  (2,'How do you prefer to work?','workstyle',true,
   '[{"value":"deep_focus","label":"Deep focus, solo problem-solving"},{"value":"collaborative","label":"Collaborative team work"},{"value":"client_facing","label":"Client-facing & communication"},{"value":"hands_on","label":"Hands-on building & prototyping"}]'::jsonb),
  (3,'Where do you see yourself in 5 years?','goals',true,
   '[{"value":"specialist","label":"Top specialist in a technical field"},{"value":"founder","label":"Founder of my own company"},{"value":"manager","label":"Leading a team or department"},{"value":"creative","label":"Recognized creative professional"},{"value":"impact","label":"Driving social or environmental impact"}]'::jsonb);

INSERT INTO public.career_paths (slug, title, category, short_description, why_match, required_skills, roadmap, certifications, future_opportunities, score_keywords, position) VALUES
  ('ai-engineer','AI Engineer','Technology','Build and deploy AI/ML systems that solve real-world problems.','You showed strong interest in AI, programming and analytical thinking.',
   ARRAY['Python','PyTorch / TensorFlow','Linear Algebra','MLOps','SQL'],
   '[{"step":"Master Python & data structures","duration":"1-2 months"},{"step":"Learn ML fundamentals (Andrew Ng)","duration":"3 months"},{"step":"Build 3 portfolio projects","duration":"3 months"},{"step":"Specialize: NLP, CV or Reinforcement Learning","duration":"6 months"}]'::jsonb,
   ARRAY['DeepLearning.AI Specialization','Google Professional ML Engineer','AWS ML Specialty'],
   ARRAY['ML Engineer','Research Scientist','AI Product Lead'],
   '{"build_software":3,"analyze_data":3,"ai_ml":4,"specialist":2}'::jsonb, 0),
  ('ux-designer','UX/UI Designer','Design','Design intuitive, beautiful product experiences users love.','You combine creativity, empathy and visual sensibility.',
   ARRAY['Figma','User Research','Interaction Design','Prototyping','Design Systems'],
   '[{"step":"Learn Figma & design fundamentals","duration":"2 months"},{"step":"Study UX research methods","duration":"2 months"},{"step":"Redesign 3 real apps for portfolio","duration":"3 months"},{"step":"Contribute to a design system","duration":"3 months"}]'::jsonb,
   ARRAY['Google UX Design Certificate','NN/g UX Certification','Interaction Design Foundation'],
   ARRAY['Senior Product Designer','Design Lead','Head of Design'],
   '{"design_visual":4,"create_content":2,"design":4,"creative":2}'::jsonb, 1),
  ('data-scientist','Data Scientist','Technology','Turn data into insights and predictive models.','You enjoy analytical thinking and finding patterns.',
   ARRAY['Python','Statistics','SQL','Pandas','Visualization','Machine Learning'],
   '[{"step":"Statistics & probability foundations","duration":"2 months"},{"step":"Pandas, NumPy, SQL fluency","duration":"2 months"},{"step":"Build 3 end-to-end data projects","duration":"4 months"},{"step":"Specialize: NLP, time-series or A/B testing","duration":"6 months"}]'::jsonb,
   ARRAY['IBM Data Science Pro','DataCamp Career Track','Microsoft DA Associate'],
   ARRAY['Senior Data Scientist','ML Engineer','Head of Data'],
   '{"analyze_data":4,"ai_ml":3,"science":2,"specialist":2}'::jsonb, 2),
  ('product-manager','Product Manager','Business','Define, ship and grow digital products.','You blend strategy, leadership and user empathy.',
   ARRAY['Product Strategy','User Research','Roadmapping','Analytics','Stakeholder Mgmt'],
   '[{"step":"Read Inspired & Lean Startup","duration":"1 month"},{"step":"Learn analytics tools (Mixpanel, GA)","duration":"2 months"},{"step":"Lead a side project end-to-end","duration":"4 months"},{"step":"Specialize: B2B SaaS, marketplace or growth","duration":"6 months"}]'::jsonb,
   ARRAY['Reforge Programs','Pendo Product School','Google PM Certificate'],
   ARRAY['Senior PM','Group PM','VP Product'],
   '{"lead_people":3,"business":4,"manager":3,"founder":2}'::jsonb, 3),
  ('full-stack-dev','Full-Stack Developer','Technology','Build modern web & mobile applications end-to-end.','You love building things and solving technical puzzles.',
   ARRAY['TypeScript','React','Node.js','PostgreSQL','System Design'],
   '[{"step":"Master JavaScript & TypeScript","duration":"2 months"},{"step":"Build with React + Node + Postgres","duration":"3 months"},{"step":"Ship 3 production apps","duration":"4 months"},{"step":"Learn DevOps & system design","duration":"6 months"}]'::jsonb,
   ARRAY['Meta Front-End Developer','AWS Developer Associate'],
   ARRAY['Senior Engineer','Tech Lead','Engineering Manager'],
   '{"build_software":4,"hands_on":3,"specialist":2}'::jsonb, 4),
  ('content-strategist','Content Strategist','Marketing','Craft content systems that grow brands and audiences.','You love storytelling and creative communication.',
   ARRAY['Copywriting','SEO','Content Strategy','Analytics','Editorial Planning'],
   '[{"step":"Master copywriting fundamentals","duration":"2 months"},{"step":"Learn SEO & content analytics","duration":"2 months"},{"step":"Grow a personal brand to 10K followers","duration":"6 months"},{"step":"Specialize: B2B, lifestyle, or technical content","duration":"6 months"}]'::jsonb,
   ARRAY['HubSpot Content Marketing','Semrush SEO Toolkit'],
   ARRAY['Head of Content','Brand Director','Content Founder'],
   '{"create_content":4,"design_visual":1,"creative":3}'::jsonb, 5);
