# CAREERY — Full Dynamic Refactor Plan

This is a large, multi-phase refactor. I'll keep the existing stack (TanStack Start + Lovable Cloud / Postgres) — it already gives us TypeScript, Postgres, JWT auth, RLS-based RBAC, file storage and edge runtime. Switching to Next.js + Prisma would require rebuilding the whole project from scratch; the current stack covers every requirement you listed.

---

## 1. Auth & Onboarding (simplified)

- Strip the current "pick a role on signup" flow.
- Signup form = **Full name, Email, Password** + **Google OAuth** button. That's it.
- After signup → redirect to `/onboarding` which is **fully skippable** (Skip → dashboard).
- Onboarding becomes a multi-step wizard (role pick, basics, skills, preferences) with each step optional and re-editable from `/settings/profile`.
- Profile completion % shown on dashboard to nudge (not block) users.

## 2. Multi-Role System

- `user_roles` already exists — extend it to allow **multiple active rows per user** (student + job_seeker, employer + recruiter, etc.).
- Add `roles` admin table (name, label, description, permissions JSON) so roles are data, not code.
- New role switcher in the top nav: shows all of the user's roles, switches the "active context" (stored in localStorage + URL).
- Dashboard, nav and permissions adapt to active roles via a `useRoles()` hook.
- Add/remove roles anytime from `/settings/roles`.

## 3. Dynamic Profile Data (all editable anytime)

New tables, all RLS-protected:
- `profiles` (extend): headline, bio, location, remote_preference, salary_min, salary_max, salary_currency, cv_url, avatar_url, completion_pct
- `education` (user_id, institution, degree, field, start, end, current)
- `experiences` (user_id, company, title, start, end, current, description, location, work_mode)
- `certifications` (user_id, name, issuer, issued_at, expires_at, credential_url)
- `user_skills` (user_id, skill_id, level 1–5, years)
- `user_languages` (user_id, language, proficiency)
- `user_interests` (user_id, interest)
- `career_goals` (user_id, goal, target_role, timeline)
- `portfolio_links` (user_id, label, url, type)
- `study_paths` (user_id, program, school, status, target_career)

Each gets its own CRUD UI under `/settings/*`.

## 4. Skills (DB-driven)

- `skill_categories` (name, slug, icon)
- `skills` (name, slug, category_id, is_custom, created_by)
- Skill picker = async search against DB, with "Create custom skill" fallback (writes to `skills` with `is_custom = true`, pending admin moderation).
- Skill levels: Beginner / Intermediate / Advanced / Expert (enum).
- Admin can merge/approve custom skills.

## 5. Companies, Jobs, Applications

- `companies` (name, slug, logo_url, website, size, industry, verified, owner_id)
- `company_members` (company_id, user_id, role: owner/recruiter/member)
- `jobs` (company_id, title, description, work_mode, location, salary_min/max, currency, experience_level, education_level, status, expires_at)
- `job_skills` (job_id, skill_id, weight, required)
- `job_tags` (job_id, tag)
- `applications` (job_id, user_id, status, cover_letter, cv_url, match_score, applied_at)
- `saved_jobs`, `saved_candidates`

Full CRUD for employers + browsing/filtering for seekers.

## 6. AI Matching & Recommendations

- Server function `compute_match(user_id, job_id)` returns weighted compatibility score (skills overlap × level, location/remote, salary, experience, education, languages, interests). Stored in `match_scores` and refreshed when profile or job changes (via DB triggers + on-demand recompute).
- Edge server function `ai-recommend` calls Lovable AI Gateway (Gemini 2.5 Flash) with the user's structured profile + top candidate jobs, returns ranked recs with reasoning.
- Three rec endpoints:
  - `recommendJobs(userId)` — for seekers/students
  - `recommendStudyPaths(userId)` — for students (AI-only, no jobs table needed)
  - `recommendCandidates(jobId)` — for employers
- Recs auto-invalidate via React Query when profile mutates.

## 7. Advanced Filtering

Shared filter bar component: skills (multi), location, experience level, work mode, salary range, education level, tags. Backed by Postgres queries with proper indexes (GIN on skill arrays, btree on numeric ranges).

## 8. Admin Dashboard / CMS

Protected by `has_role(uid,'admin')`. Routes under `/admin`:
- `/admin` — analytics overview (real counts from DB)
- `/admin/users` — list/search, change roles, ban
- `/admin/roles` — role + permission management
- `/admin/companies` — verify/reject companies
- `/admin/jobs` — moderate/feature/remove jobs
- `/admin/skills` — approve custom skills, merge duplicates, manage categories
- `/admin/cms` — homepage CMS:
  - `cms_pages` (slug, title, meta)
  - `cms_blocks` (page_id, type: hero/features/stats/testimonials/faq, position, content JSONB)
  - `cms_navigation` (location: navbar/footer, label, url, order)
  - `cms_settings` (key/value): logo_url, favicon_url, brand_name, theme tokens (primary/accent/bg in oklch)
- `/admin/media` — upload to Supabase Storage bucket `cms-media`

Homepage `/` reads everything from `cms_blocks` + `cms_settings`. Theme tokens are injected as CSS variables at runtime.

## 9. Remove all mock data

Audit pass: dashboard panels, advisor suggestions, landing stats — every static array gets replaced with a query. Empty states get proper illustrations + CTAs ("No jobs yet — complete your profile to get matches").

## 10. File Uploads

Storage buckets: `avatars` (public), `cvs` (private, owner-read), `company-logos` (public), `cms-media` (public, admin-write). Signed URLs for private CVs shared with employers when an application is sent.

---

## Technical Notes

- Stack stays: **TanStack Start + TS + Postgres (Lovable Cloud) + RLS + Lovable AI Gateway**. Equivalent to your "Next + Prisma + JWT + RBAC" requirements (RLS = SQL-native RBAC; Supabase Auth issues JWTs).
- All data access via `createServerFn` with `requireSupabaseAuth`; admin ops via `supabaseAdmin` behind `has_role` checks.
- React Query everywhere for caching + auto-revalidation when profile mutates.
- New `has_any_role`, `has_permission` SQL helpers for fine-grained RBAC.

---

## Execution Order (will ship in phases, asking for review between major phases)

1. **DB foundation**: drop role-on-signup constraint, add all new tables + RLS + helpers + storage buckets.
2. **Auth refactor**: simplified signup, Google OAuth, skippable onboarding wizard, role switcher.
3. **Profile & Skills**: full CRUD UIs under `/settings/*`, skill search.
4. **Companies & Jobs**: employer flow + job board + applications.
5. **AI matching + recommendations + filters**.
6. **Admin/CMS**: schema, admin UI, dynamic homepage rendering from CMS.
7. **Mock-data purge + empty states + polish**.

Phase 1 alone is a large migration. **Confirm and I'll start with phase 1 (DB foundation) — that's a single migration plus storage buckets, no UI changes yet, so you can review the schema before we wire anything up.**
