# Scale to Thrive: Build Checklist

## Decisions locked in
- [x] Two tracks: **IT** (technical skills for software and infrastructure roles) and **Non-IT** (technical skills plus communication for business and corporate roles).
- [x] The **home page showcases all workshop content**: both tracks, curriculum, projects, job roles, delivery format, assessment, the team and enquiry.
- [x] Stack: Next.js + TypeScript + Tailwind (scaffold in `web/`). Database to be decided.

- [x] **Admin-editable intake info on the home page:** for each of the two tracks, an admin can update the **opening (start) date** and the **number of seats allocated**. The home page shows these values.
- [x] **Admin-editable workshop handlers:** through the admin panel, an admin can update the handler (trainer) names for each track. Handlers are shown per track on the home page. Initial values: Dr. Arjun U and Prajwal A (both tracks).

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
