# Scale to Thrive: Build Checklist

## Decisions locked in
- [x] Two tracks: **IT** (technical skills for software and infrastructure roles) and **Non-IT** (technical skills plus communication for business and corporate roles).
- [x] The **home page showcases all workshop content**: both tracks, curriculum, projects, job roles, delivery format, assessment, the team and enquiry.
- [x] Stack: Next.js + TypeScript + Tailwind (scaffold in `web/`). Database to be decided.

- [x] **Admin-editable intake info on the home page:** for each of the two tracks, an admin can update the **opening (start) date** and the **number of seats allocated**. The home page shows these values.
- [x] **Admin-editable workshop handlers:** through the admin panel, an admin can update the handler (trainer) names for each track. Handlers are shown per track on the home page. Initial values: Dr. Arjun U and Prajwal A (both tracks).
- [x] **Platform has four areas:** (1) home page, (2) admin panel, (3) job listing page, (4) enrollee profile page.
- [x] **Application form on the home page** appears only while an admin has applications **open** for that track. Admin can open and close applications per track.
- [x] **Admins review applications and finalize** the accepted applicants. **Only finalized applicants** get access to their enrollee profile.
- [x] Terminology: "chariot" is taken to mean the workshop/program (a track).
- [x] **Eligibility: engineering students and recently passed-out engineering graduates** (both tracks). This overrides the proposals' "Who should join" lists, which also named B.Com, BBA, BA, BCA and others. The home page's "Who should join" section must say engineering students and recent graduates.
- [x] Application form Education section has the **college name only** (degree/branch, year and CGPA fields removed).

## Open decisions
- [ ] First release scope: public site and enquiries only, or include the student portal?
- [ ] Organization and branding (PES ITM / PES CoE or a separate brand)? Logo, colors, domain?
- [ ] Expected scale (one batch or many colleges)?
- [ ] Payments needed?
- [ ] Hosting preference and budget?

## Phase 1: Home page and public site
- [ ] Database table for per-track intake: start date, total seats, seats filled
- [ ] Admin login (protected `/admin` area, one or a few admin accounts)
- [ ] Admin form to edit opening date and seats for IT and Non-IT
- [ ] Database table for handlers: name, designation, affiliation, linked to a track (a person can be on both tracks)
- [ ] Admin form to add, edit, reorder and remove handlers per track
- [ ] Home page shows each track's current handlers
- [ ] Home page reads these values live; show "seats left" and a "Full" state when it reaches zero
- [ ] Decide how "seats filled" is counted: manual number set by admin, or counted from enrollments
- [ ] Hero: name, tagline, the two tracks, key facts (12 weeks, hybrid)
- [ ] Track overview: IT vs Non-IT, with who each is for
- [ ] Program details per track: hours, weekly format, technologies or skills
- [ ] 12-week curriculum for each track
- [ ] Projects for each track
- [ ] Target job roles and skill mapping, with the "no placement guarantee" note
- [ ] Assessment breakdown for each track
- [ ] Non-IT communication module (weekly topics)
- [ ] Responsible AI note (IT, week 12)
- [ ] Workshop team: Dr. Arjun U, Prajwal A
- [ ] Who should join, and an enquiry/enrollment form
- [ ] Responsive layout, accessibility, SEO basics
- [ ] Content stored as data (from `docs/program-reference.md`), not hard-coded

## Phase 2: Student portal
- [ ] Login, enrollment, batches, weekly schedule and materials, submissions

## Phase 3: Trainer and admin tools
- [ ] Attendance, grading with the weighted scheme, reports

## Phase 4: Extras
- [ ] Certificates, student portfolios, mock-interview scheduling, payments if needed

## Application and enrollment flow
- [ ] Admin toggle: applications open/closed per track
- [ ] Application form (shown on home page only when open)
- [ ] Admin review list: view, shortlist, finalize or reject applicants
- [ ] Finalized applicants receive login access
- [ ] Enrollee profile page (design in progress)
- [ ] Job listing page (admin posts jobs; shown to visitors and/or enrollees; to be defined)

## Enrollee profile (decided)
- [x] When an admin **finalizes** an applicant, the system emails them a **set-password link**. They can log in only after setting a password.
- [x] Profile shows: **profile details**, **chosen track** (IT or Non-IT) and **workshop milestones** (progress).
- [x] A **separate Jobs section** in the profile lists the jobs posted by admin. The enrollee can **apply** to them.
- [x] The enrollee can see their **applied-job details** (which jobs they applied to, and the status).
- [ ] Define milestones (proposal: 12 weekly milestones plus projects and final assessment)
- [ ] Define job application statuses (applied, shortlisted, rejected, selected)
- [ ] Set-password link: expiry, resend, forgot-password

## Admin panel (decided)
- [x] Sections: dashboard, track settings, applications, enrollees, jobs, admin accounts.
- [x] **All admins are equal** (no main admin, no permission levels). Any admin can add or remove admins. Block removing the last admin and self-removal. New admins get a set-password email.
- [x] Seats left = seats allocated minus finalized applicants (calculated, not typed). Finalizing is blocked when no seats are left.
- [x] **Rejected applicants receive an email.**
- [x] **Finalize is one click; the set-password email is sent immediately after finalization.**
- [x] **Track-wise job report** (how many enrollees applied and how many were selected, per track)
- [x] **CSV/Excel export** of the applicant list
- [ ] Starting admin accounts and emails (proposed: Dr. Arjun U, Prajwal A)

## Initial admin account (decided)
- [x] A first admin account is created when the database is set up. Its email and password are supplied through **environment variables** (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) in a local, git-ignored `.env` file and on the hosting provider. They are **never committed** to the repo, and the password is stored **hashed** in the database.
- [ ] Admin should change the initial password after first login

## First admin account
- [x] The first admin (`scaletothrive@gmail.com`) is created from environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) when the database is seeded. The password is **hashed**, never stored in plain text and **never committed** to the repo.
- [x] The first admin is created in Supabase with a strong password (see `docs/deployment-guide.md`); the planning password is not used.

## Companies and jobs (decided)
- [x] **New role: Company.** Admin creates each company with **logo, email and description**. The company gets an email with a **set-password link** (no password is chosen or shared by admin). Login uses the company email.
- [x] **Companies post and manage their own jobs** and run a **job management / monitoring area** to track applicants through to the **final candidate**.
- [x] **Every job application sends emails**: the applicant gets a confirmation email.
- [x] On application, **only the applicant** is emailed (no email to company or admin).
- [x] Hiring stages: Applied, Shortlisted, Interview, Offered, Selected, Rejected. **The applicant is emailed on every stage change.**
- [x] A company can see the applicant's **complete profile**. The apply button shows a consent line: "Your complete profile will be shared with this company."
- [x] **No admin approval**: companies publish jobs directly. **Admins can also post jobs themselves, shown as a separate "Special" category.** Admins can close or remove any listing.
- [x] **One login per company.**
- [x] **All admins can see every company's jobs and applicants** (monitoring).

## Build progress
- [x] Apple-inspired theme (hero image, large type, rounded tiles, stat callouts), text logo, partner logos, Unsplash images
- [x] Home page: hero, partners, both tracks, skills, 12-week curriculum, projects, assessment, careers, trainers, application form (shown only for open tracks)
- [x] Enrollee profile page (UI only, sample data): LinkedIn-style round photo, milestones, applied jobs
- [ ] Backend not built yet: database, admin login, set-password emails, storing applications, job listings, company area. Track dates, seats and open/closed flags are placeholders in `web/src/lib/content.ts`.
- [ ] Replace stock portraits with real photos; trainers currently show initials

## Database and hosting
- [x] `supabase/schema.sql`: tables, row level security, storage buckets, seed data. Tested against a local Postgres (15 scenarios).
- [x] `docs/deployment-guide.md`: Supabase + Vercel steps.
- [ ] Create the Supabase project and run the schema (user)
- [ ] Wire the app to Supabase: admin login, track settings, applications, finalize + invite email, enrollee profile, companies and jobs
- [ ] Configure SMTP email provider

## Backend built (code written, not yet tested against a live Supabase)
- [x] Login, forgot password, set-password (via /auth/confirm), sign out; route protection in src/proxy.ts
- [x] Home page reads dates, seats, open/closed and handlers from the database; application form saves to it (resume and photo uploads)
- [x] Admin: dashboard, tracks (date, seats, open/close, handlers), applications (filter, shortlist, reject+email, finalize+invite, CSV export), enrollees (milestones, resend link), jobs (Special jobs, track report), companies (create + invite), admins (invite, remove)
- [x] Company: post/close jobs, applicants with full profile, resume, stage changes with email
- [x] Enrollee: real profile, job listing, apply with confirmation email
- [ ] Test the whole flow on a real Supabase project

## Email templates (done)
- [x] One branded layout (logo, purpose box, partner logos, footer) in `web/src/lib/email-layout.ts`
- [x] Website emails (HTML + plain text): application received, application rejected, job applied, job stage changes (applied, shortlisted, interview, offered, selected, rejected)
- [x] Supabase emails generated to `supabase/email-templates/`: invite, reset password, confirm sign up, magic link, change email, reauthentication. Paste into Supabase -> Authentication -> Emails. Rebuild with `npm run build:emails` in `web/`.
- [x] Website emails can send through SMTP (Gmail) or Resend. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in Vercel.
- [ ] Replace low-resolution partner logos (cropped from the poster) with official files

## Branded account emails (done)
- [x] The website now generates set-password links itself and sends them in its own branded templates (no pasting into Supabase needed): selected enrollee, company welcome, admin invite, password reset. Falls back to Supabase's plain email if the mailer is not configured.
- [ ] Vercel needs SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (Gmail app password) for any website email to send
- [ ] Known limit: the public "Forgot your password?" form can trigger emails to existing accounts without a throttle

## Exports, downloads and shortlisting emails (done)
- [x] Excel (.xlsx) exports with styled headers, filters and frozen header row. Admin: applications (respects filters), enrollees, all members (enrollees + companies + admins), companies, admins, jobs and job applications. Company: its own applicants.
- [x] "Download PDF" (branded, same look as the emails) for every workshop application (admin) and "Download application" for every job application (company, enrollee, admin route).
- [x] Separate shortlisting emails: workshop applicant shortlisted by admin, and job applicant shortlisted by a company.
- [ ] PDFs use standard fonts, so non-Latin characters (for example Kannada or Hindi names) show as "?"
- [ ] `npm audit` reports 2 moderate issues inside the Excel library; it is only used to create files, never to read uploads

## Category exports and student resume (done)
- [x] Separate one-click Excel exports for IT and Non-IT: enrollees, job applications (admin) and applicants (company)
- [x] Student resume: ATS-friendly PDF (single column, standard fonts, no logos) built from the workshop application, with the skills of the enrolled track and completed modules. Profile shows an ATS score out of 100 with tips.
- [ ] Degree, branch and graduation year are not collected in the application, so the resume says "B.E. / B.Tech" only

## Required education details (done)
- [x] Application form now requires: highest education, branch / specialization, education status (currently studying or completed) and year of passing out (expected year if still studying). Validated again on the server. Stored in the application answers, so no database change is needed.
- [x] Used by the student resume (education section and summary wording), the application PDF, the Excel exports and the admin application view
- [ ] Applications and enrollees created before this change have no education details; their resume falls back to "B.E. / B.Tech" and the ATS score shows what is missing

## Speed and region
- [x] Supabase project is in Mumbai (ap-south-1). `web/vercel.json` runs Vercel's functions in Mumbai (`bom1`) next to it.
- [x] Moved from the old Sydney project: schema re-run, admin user recreated, Site URL, redirect URL, sign-ups off, SMTP and Vercel keys updated.
- [ ] Delete the old Sydney Supabase project and the old Google app password after testing.
