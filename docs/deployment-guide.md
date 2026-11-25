# Deployment guide: Supabase + Vercel

You need two free accounts: [supabase.com](https://supabase.com) and [vercel.com](https://vercel.com). The code is on GitHub (`Block321A/Scale_to_Thrive`).

> The website is connected to Supabase. It shows built-in sample content until you add the Supabase keys (step 6), and the private areas (admin, company, jobs, profile) need the database.

## 1. Create the database (Supabase)
1. Supabase dashboard -> **New project**. Pick a name, a strong database password (save it in a password manager) and the region closest to your users (for India, Mumbai / `ap-south-1`).
2. Open **SQL Editor -> New query**. Paste the full contents of `supabase/schema.sql` and press **Run**. It should finish with "Success". Run it only once; running it again fails because the tables already exist.
3. Check **Table Editor**: you should see `tracks`, `handlers`, `applications`, `enrollees`, `companies`, `jobs`, `job_applications` and others. `tracks` already has IT and Non-IT.

## 2. Lock down sign-up
The schema trusts the server to decide who is an admin, company or enrollee, so nobody should be able to register themselves.
- **Authentication -> Sign In / Providers -> Email**: turn **off** "Allow new users to sign up". (Invitations still work.)

## 3. Create the first admin
1. **Authentication -> Users -> Add user -> Create new user**. Email `scaletothrive@gmail.com`, tick **Auto Confirm User**, and enter a **strong, new password** (not the temporary one used during planning).
2. In the SQL Editor run:
```sql
update public.profiles set role = 'admin' where email = 'scaletothrive@gmail.com';
```
3. Check: `select email, role from public.profiles;` should show `admin`.

## 4. Get your keys
**Project Settings -> API**:
- Project URL
- `anon` public key (safe in the browser)
- `service_role` key (**secret**: full database access, server only)

Never paste these in chat or commit them. They go only into Vercel (step 6) and `web/.env.local`.

## 5. Email (important)
Supabase's built-in email sender is not usable for this project: it sends only a couple of emails an hour and, on new projects, only to your own team members. Applicants and companies would never receive their set-password emails. Connect your own sender first:
- **Authentication -> Emails -> SMTP Settings -> Set up SMTP.**
- Quick start without a domain: a Gmail account with an **App Password** (Google Account -> Security -> 2-Step Verification -> App passwords). Host `smtp.gmail.com`, port `465`, username the Gmail address, password the app password. Limit is roughly 500 emails a day.
- Better for launch: Brevo or Resend with your own verified domain.
- The website's set-password page works with Supabase's **default** invite and reset links, so you do not need to edit the email templates. After SMTP is connected you may still restyle them, but keep the link as `{{ .ConfirmationURL }}`.
- Application received, rejection and job-stage emails are sent by the website itself through Resend. Create a free Resend account, verify your sender domain, and add `RESEND_API_KEY` and `EMAIL_FROM` in Vercel. Until then those emails are only written to the server log.

## 6. Host the website (Vercel)
1. Vercel dashboard -> **Add New -> Project** -> import `Block321A/Scale_to_Thrive` (give Vercel access to the repo when asked).
2. **Root Directory**: set to `web` (the Next.js app lives in that folder). Framework preset should say Next.js.
3. **Environment Variables**: add the names from `web/.env.example` with your values (`RESEND_API_KEY` and `EMAIL_FROM` are optional at first). Mark the service role key and the Resend key as **Sensitive**.
4. Production branch: Vercel deploys the branch you choose. Use `main` for production; other branches get preview URLs. (The work is currently on `claude/intelligent-volta-m3clk7`.)
5. Click **Deploy**. You get a URL like `https://scale-to-thrive.vercel.app`.

## 7. Tell Supabase your site address
**Authentication -> URL Configuration**:
- **Site URL**: your Vercel URL (later your custom domain)
- **Redirect URLs**: add `https://<your-vercel-url>/**` and `http://localhost:3000/**`

Then set `NEXT_PUBLIC_SITE_URL` in Vercel to the same URL and redeploy. Without this, set-password links point to the wrong place.

## 8. Custom domain (optional)
Vercel -> Project -> Settings -> Domains -> add your domain, then add the DNS records Vercel shows. Update the Supabase Site URL and `NEXT_PUBLIC_SITE_URL` afterwards.

## Notes
- Free Supabase projects pause after about a week of no activity. Resume them from the dashboard, or upgrade before the workshop starts.
- Back up: Supabase dashboard -> Database -> Backups (daily backups need a paid plan). You can also export applicant lists as CSV from the admin panel once it exists.
- The browser only ever uses the `anon` key. Row level security in `schema.sql` is what protects the data, so do not disable it.

## What the schema decides (change if you disagree)
- Applicants submit without an account, only while the track's applications are open.
- One live application per email per track. Rejected people can apply again.
- Finalizing is blocked when the track has no seats left. Seats left = seats allocated minus finalized applications.
- Jobs are visible only to signed-in users (enrollees, companies, admins), not the public.
- Companies see only enrollees who applied to their jobs, and can change only the stage of an application.
- Every stage change is logged in `job_application_events`; the server sends the applicant an email for each.
