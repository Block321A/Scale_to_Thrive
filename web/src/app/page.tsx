import Image from "next/image";
import { formatDate } from "@/lib/content";
import { loadTracks } from "@/lib/data";
import ApplicationForm from "@/components/ApplicationForm";
import PartnerStrip from "@/components/PartnerStrip";

// Served as a cached page (fast), rebuilt at most every minute and instantly when an admin edits tracks or finalizes someone.
export const revalidate = 60;

export default async function Home() {
  const tracks = await loadTracks();
  const seatsLeft = (t: (typeof tracks)[number]) => t.seatsLeft;
  const openTracks = tracks.filter((t) => t.applicationsOpen && t.seatsLeft > 0);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[78vh] items-end overflow-hidden bg-black">
        <Image src="/images/hero-students.jpg" alt="Students collaborating around a laptop" fill priority sizes="100vw" className="-z-10 object-cover opacity-70" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="mx-auto w-full max-w-6xl px-6 pb-20 text-white">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/80">Anvesana TBI · PES Trust</p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Great skills build great careers.
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-white/85">
            Two 12-week hybrid workshops for engineering students and recent graduates. Learn, practise, build and demonstrate, with real projects and expert trainers.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#apply" className="rounded-full bg-accent px-7 py-3 text-lg font-medium hover:bg-[#0077ed]">Apply now</a>
            <a href="#tracks" className="rounded-full bg-white/15 px-7 py-3 text-lg font-medium backdrop-blur hover:bg-white/25">Explore workshops</a>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="border-b border-black/5">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <PartnerStrip />
        </div>
      </section>

      {/* Tracks */}
      <section id="tracks" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">Two workshops. One goal: get job-ready.</h2>
        <p className="mt-5 max-w-2xl text-xl text-muted">
          Both build technical skill. The Non-IT track adds a weekly communication module for business and corporate roles.
        </p>
        {/* Subgrid: both cards share the same rows, so headings, numbers, dates and photos line up exactly */}
        <div className="mt-14 grid gap-y-6 md:grid-cols-2 md:grid-rows-[repeat(6,auto)] md:gap-x-6 md:gap-y-0">
          {tracks.map((t) => (
            <article key={t.id} className="grid overflow-hidden rounded-[28px] bg-surface md:row-span-6 md:grid-rows-subgrid">
              <p className="px-8 pt-8 text-sm font-semibold uppercase tracking-widest text-brown md:px-10 md:pt-10">{t.name} track</p>
              <h3 className="mt-2 px-8 text-3xl font-semibold leading-tight tracking-tight md:px-10">{t.tagline}</h3>
              <p className="mt-4 px-8 text-lg text-muted md:px-10">{t.summary}</p>
              <dl className="mt-8 grid grid-cols-3 gap-4 px-8 md:px-10">
                <div><dd className="text-4xl font-semibold text-navy">12</dd><dt className="text-sm text-muted">weeks</dt></div>
                <div><dd className="text-4xl font-semibold text-navy">{t.hours}</dd><dt className="text-sm text-muted">guided hours</dt></div>
                <div><dd className="text-4xl font-semibold text-navy">{t.projects.length}</dd><dt className="text-sm text-muted">projects</dt></div>
              </dl>
              <ul className="mt-8 space-y-1 px-8 text-sm md:px-10">
                <li><span className="text-muted">Opens: </span><strong>{formatDate(t.openingDate)}</strong></li>
                <li><span className="text-muted">Seats: </span><strong>{seatsLeft(t)} of {t.seatsTotal} left</strong></li>
                <li>
                  <span className="text-muted">Applications: </span>
                  <strong className={t.applicationsOpen ? "text-green-700" : "text-muted"}>{t.applicationsOpen ? "Open" : "Closed"}</strong>
                </li>
              </ul>
              <div className="relative mt-8 h-64">
                <Image src={t.image} alt={`${t.name} track`} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">Eligibility: engineering students and recently passed-out engineering graduates.</p>
      </section>

      {/* Skills */}
      <section className="bg-surface py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">What you will learn</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-2">
            {tracks.map((t) => (
              <div key={t.id}>
                <h3 className="text-xl font-semibold">{t.name} track</h3>
                <p className="mt-1 text-sm text-muted">{t.delivery}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {t.skills.map((s) => <span key={s} className="rounded-full bg-white px-4 py-2 text-sm shadow-sm">{s}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section id="curriculum" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Twelve weeks, week by week.</h2>
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          {tracks.map((t) => (
            <div key={t.id}>
              <h3 className="mb-4 text-xl font-semibold">{t.name} track</h3>
              <ol className="divide-y divide-black/10 border-y border-black/10">
                {t.weeks.map((w) => (
                  <li key={w.week}>
                    <details className="group py-4">
                      <summary className="flex cursor-pointer list-none items-center gap-4">
                        <span className="w-14 shrink-0 text-sm font-semibold text-brown">Week {w.week}</span>
                        <span className="flex-1 font-medium">{w.title}</span>
                        <span className="text-xl text-muted transition group-open:rotate-45">+</span>
                      </summary>
                      <p className="mt-2 pl-[4.5rem] text-muted">{w.text}</p>
                    </details>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* Projects + assessment */}
      <section className="bg-surface py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Build projects you can talk about.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {tracks.map((t) => (
              <div key={t.id} className="rounded-[28px] bg-white p-8">
                <h3 className="text-xl font-semibold">{t.name} projects</h3>
                <ul className="mt-5 space-y-4">
                  {t.projects.map((p) => (
                    <li key={p.title}><p className="font-medium">{p.title}</p><p className="text-sm text-muted">{p.text}</p></li>
                  ))}
                </ul>
                <h4 className="mt-8 text-sm font-semibold uppercase tracking-widest text-brown">Assessment</h4>
                <ul className="mt-3 space-y-2 text-sm">
                  {t.assessment.map((a) => (
                    <li key={a.area} className="flex items-center justify-between gap-4 border-b border-black/5 pb-2"><span>{a.area}</span><strong>{a.weight}%</strong></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Careers */}
      <section id="careers" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Roles you can aim for.</h2>
        <p className="mt-4 max-w-2xl text-lg text-muted">Target entry-level roles, not guaranteed placements. Hiring requirements vary by employer.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {tracks.map((t) => (
            <div key={t.id} className="rounded-[28px] border border-black/10 p-8">
              <h3 className="text-xl font-semibold">{t.name} track</h3>
              <ul className="mt-4 space-y-2">{t.roles.map((r) => <li key={r} className="flex gap-3"><span className="text-brown">•</span>{r}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section id="team" className="bg-surface py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Meet your trainers.</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {tracks[0].handlers.map((h) => (
              <div key={h.name} className="flex items-center gap-6 rounded-[28px] bg-white p-8">
                {/* Initials until real trainer photos are provided */}
                <div className="grid size-28 shrink-0 place-items-center rounded-full bg-navy text-3xl font-semibold text-white ring-4 ring-white shadow-[0_8px_30px_rgba(0,0,0,0.15)]" aria-hidden="true">
                  {h.name.replace("Dr. ", "").split(" ").map((w) => w[0]).join("")}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{h.name}</h3>
                  <p className="mt-1 text-sm text-muted">{h.designation}</p>
                  <p className="text-sm text-muted">{h.org}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application (shown only while an admin keeps applications open) */}
      <section id="apply" className="mx-auto max-w-3xl px-6 py-24">
        <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Apply for the workshop.</h2>
        {openTracks.length > 0 ? (
          <div className="mt-10"><ApplicationForm openTracks={openTracks} /></div>
        ) : (
          <div className="mt-10 rounded-3xl bg-surface p-10 text-muted">Applications are currently closed. Please check back when the next batch opens.</div>
        )}
      </section>
    </>
  );
}
