
-- Career quiz results
CREATE TABLE public.career_quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  score integer NOT NULL DEFAULT 0,
  personality_type text,
  description text,
  recommended_careers text[] DEFAULT '{}',
  recommended_companies text[] DEFAULT '{}',
  skills_to_improve text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.career_quiz_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner read" ON public.career_quiz_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner insert" ON public.career_quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner delete" ON public.career_quiz_results FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_quiz_user ON public.career_quiz_results(user_id, created_at DESC);

-- Application events (status timeline)
CREATE TABLE public.application_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL,
  actor_id uuid,
  event_type text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.application_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events read" ON public.application_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    LEFT JOIN public.jobs j ON j.id = a.job_id
    WHERE a.id = application_events.application_id
      AND (a.user_id = auth.uid() OR public.is_company_member(auth.uid(), j.company_id) OR public.has_role(auth.uid(),'admin'))
  )
);
CREATE POLICY "events write" ON public.application_events FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.applications a
    LEFT JOIN public.jobs j ON j.id = a.job_id
    WHERE a.id = application_events.application_id
      AND (a.user_id = auth.uid() OR public.is_company_member(auth.uid(), j.company_id) OR public.has_role(auth.uid(),'admin'))
  )
);
CREATE INDEX idx_app_events ON public.application_events(application_id, created_at DESC);
