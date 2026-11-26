import Image from "next/image";
import { formatDate } from "@/lib/content";
import { loadTracks } from "@/lib/data";
import ApplicationForm from "@/components/ApplicationForm";
import Avatar from "@/components/Avatar";
import PartnerStrip from "@/components/PartnerStrip";
import TrackTabs from "@/components/TrackTabs";

// Served as a cached page (fast), rebuilt at most every minute and instantly when an admin edits tracks or finalizes someone.
export const revalidate = 60;

export default async function Home() {
  const tracks = await loadTracks();
  const seatsLeft = (t: (typeof tracks)[number]) => t.seatsLeft;
  // Each trainer once, even if they teach both tracks; prefer the entry that has a photo
  const teamMap = new Map<string, (typeof tracks)[number]["handlers"][number]>();
  for (const h of tracks.flatMap((t) => t.handlers)) {
    const key = h.name.trim().toLowerCase();
    const have = teamMap.get(key);
    if (!have || (!have.photo && h.photo)) teamMap.set(key, h);
  }
  const team = [...teamMap.values()];
  const openTracks = tracks.filter((t) => t.applicationsOpen && t.seatsLeft > 0);

  return (
    <>
      {/* Announcement bar (like Fabric's top banner), only while applications are open */}
      {openTracks.length > 0 && (
        <a href="#apply" className="block bg-[#eaf3ff] px-4 py-2.5 text-center text-sm text-navy">
          <span className="mr-1.5 inline-block size-2 rounded-full bg-green-600 align-middle" />
          Applications are open for the next batch. <span className="font-semibold text-accent">Apply now ›</span>
        </a>
      )}

      {/* Mobile hero: short text first, then a rounded photo panel */}
      <section className="px-5 pb-8 pt-8 md:hidden">
        <p className="text-xs font-semibold uppercase tracking-widest text-brown">Anvesana TBI · PES Trust</p>
        <h1 className="mt-3 text-[2.6rem] font-semibold leading-[1.05] tracking-tight">Great skills build great careers.</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">Two 12-week hybrid chariots for engineering students and recent graduates, with real projects and expert trainers.</p>
        <div className="mt-6 flex gap-3">
          <a href="#apply" className="rounded-full bg-accent px-6 py-3 font-medium text-white">Apply now</a>
          <a href="#tracks" className="rounded-full border border-black/15 px-6 py-3 font-medium">Explore chariots</a>
        </div>
        <div className="relative mt-8 h-64 overflow-hidden rounded-[28px] shadow-lg">
          <Image src="/images/hero-students.jpg" alt="Students collaborating around a laptop" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute bottom-3 left-3 right-3 flex justify-between gap-2 rounded-2xl bg-white/95 p-3 text-center shadow">
            <div className="flex-1"><p className="text-xl font-semibold text-navy">12</p><p className="text-xs text-muted">weeks</p></div>
            <div className="flex-1"><p className="text-xl font-semibold text-navy">2</p><p className="text-xs text-muted">tracks</p></div>
            <div className="flex-1"><p className="text-xl font-semibold text-navy">Hybrid</p><p className="text-xs text-muted">format</p></div>
          </div>
        </div>
      </section>

      {/* Mobile quick links (like Fabric's in-page jump bar), sticks under the header */}
      <nav aria-label="On this page" className="sticky top-[calc(3vh+67px)] z-40 border-y border-black/5 bg-white md:hidden">
        <ul className="flex gap-2 overflow-x-auto px-4 py-2.5 text-sm font-medium [scrollbar-width:none]">
          {[["#tracks", "Chariots"], ["#curriculum", "Curriculum"], ["#projects", "Projects"], ["#careers", "Careers"], ["#team", "Trainers"], ["#apply", "Apply"]].map(([h, l]) => (
            <li key={h}><a href={h} className="block whitespace-nowrap rounded-full bg-surface px-4 py-2">{l}</a></li>
          ))}
        </ul>
      </nav>

      {/* Desktop hero (unchanged) */}
      <section className="relative isolate hidden min-h-[78vh] items-end overflow-hidden bg-black md:flex">
        <Image src="/images/hero-students.jpg" alt="" fill sizes="100vw" className="-z-10 object-cover opacity-70" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="mx-auto w-full max-w-6xl px-6 pb-20 text-white">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/80">Anvesana TBI · PES Trust</p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Great skills build great careers.
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-white/85">
            Two 12-week hybrid chariots for engineering students and recent graduates. Learn, practise, build and demonstrate, with real projects and expert trainers.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#apply" className="rounded-full bg-accent px-7 py-3 text-lg font-medium hover:bg-[#0077ed]">Apply now</a>
            <a href="#tracks" className="rounded-full bg-white/15 px-7 py-3 text-lg font-medium backdrop-blur hover:bg-white/25">Explore chariots</a>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="border-b border-black/5">
        <div className="mx-auto max-w-6xl px-5 py-6 md:py-10">
          <PartnerStrip />
        </div>
      </section>

      {/* Tracks */}
      <section id="tracks" className="mx-auto max-w-6xl scroll-mt-[calc(8rem+3vh)] px-5 py-14 md:scroll-mt-[calc(5rem+3vh)] md:px-6 md:py-24">
        <h2 className="max-w-3xl text-[2rem] font-semibold leading-tight tracking-tight md:text-6xl">One stop skill enhancement for your life&apos;s future ventures</h2>
        <p className="mt-4 max-w-2xl text-lg text-muted md:mt-5 md:text-xl">
          Both build technical skill. The Non-IT track adds a weekly communication module for business and corporate roles.
        </p>
        {/* Subgrid: both cards share the same rows, so headings, numbers, dates and photos line up exactly */}
        <p className="mt-6 text-sm font-medium text-muted md:hidden">Swipe to compare →</p>
        <div className="-mx-5 mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:mt-14 md:grid md:gap-y-0 md:overflow-visible md:px-0 md:pb-0 md:grid-cols-2 md:grid-rows-[repeat(6,auto)] md:gap-x-6 md:gap-y-0">
          {tracks.map((t) => (
            <article key={t.id} className="grid w-[85%] shrink-0 snap-center overflow-hidden rounded-[28px] bg-surface md:w-auto md:row-span-6 md:grid-rows-subgrid">
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
              <div className="relative mt-8 h-48 md:h-64">
                <Image src={t.image} alt={`${t.name} track`} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">Eligibility: engineering students and recently passed-out engineering graduates.</p>
      </section>

      {/* Skills */}
      <section className="bg-surface py-14 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-6">
          <h2 className="text-[2rem] font-semibold leading-tight tracking-tight md:text-5xl">What you will learn</h2>
          <TrackTabs labels={tracks.map((t) => t.name)}>
            {tracks.map((t) => (
              <div key={t.id}>
                <h3 className="hidden text-xl font-semibold md:block">{t.name} track</h3>
                <p className="mt-1 text-sm text-muted">{t.delivery}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {t.skills.map((s) => <span key={s} className="rounded-full bg-white px-4 py-2 text-sm shadow-sm">{s}</span>)}
                </div>
              </div>
            ))}
          </TrackTabs>
        </div>
      </section>

      {/* Curriculum */}
      <section id="curriculum" className="mx-auto max-w-6xl scroll-mt-[calc(8rem+3vh)] px-5 py-14 md:scroll-mt-[calc(5rem+3vh)] md:px-6 md:py-24">
        <h2 className="text-[2rem] font-semibold leading-tight tracking-tight md:text-5xl">Twelve weeks, week by week.</h2>
        <TrackTabs labels={tracks.map((t) => t.name)}>
          {tracks.map((t) => (
            <div key={t.id}>
              <h3 className="mb-4 hidden text-xl font-semibold md:block">{t.name} track</h3>
              <ol className="divide-y divide-black/10 border-y border-black/10">
                {t.weeks.map((w) => (
                  <li key={w.week}>
                    <details className="group py-4">
                      <summary className="flex cursor-pointer list-none items-center gap-4">
                        <span className="w-16 shrink-0 whitespace-nowrap text-sm font-semibold text-brown">Week {w.week}</span>
                        <span className="flex-1 font-medium">{w.title}</span>
                        <span className="text-xl text-muted transition group-open:rotate-45">+</span>
                      </summary>
                      <p className="mt-2 pl-20 text-muted">{w.text}</p>
                    </details>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </TrackTabs>
      </section>

      {/* Projects + assessment */}
      <section id="projects" className="scroll-mt-[calc(8rem+3vh)] bg-surface py-14 md:scroll-mt-[calc(5rem+3vh)] md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-6">
          <h2 className="text-[2rem] font-semibold leading-tight tracking-tight md:text-5xl">Build projects you can talk about.</h2>
          <TrackTabs labels={tracks.map((t) => t.name)}>
            {tracks.map((t) => (
              <div key={t.id} className="rounded-[28px] bg-white p-6 md:p-8">
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
          </TrackTabs>
        </div>
      </section>

      {/* Careers */}
      <section id="careers" className="mx-auto max-w-6xl scroll-mt-[calc(8rem+3vh)] px-5 py-14 md:scroll-mt-[calc(5rem+3vh)] md:px-6 md:py-24">
        <h2 className="text-[2rem] font-semibold leading-tight tracking-tight md:text-5xl">Roles you can aim for.</h2>
        <p className="mt-4 max-w-2xl text-lg text-muted">Target entry-level roles, not guaranteed placements. Hiring requirements vary by employer.</p>
        <TrackTabs labels={tracks.map((t) => t.name)}>
          {tracks.map((t) => (
            <div key={t.id} className="rounded-[28px] border border-black/10 p-6 md:p-8">
              <h3 className="text-xl font-semibold">{t.name} track</h3>
              <ul className="mt-4 space-y-2">{t.roles.map((r) => <li key={r} className="flex gap-3"><span className="text-brown">•</span>{r}</li>)}</ul>
            </div>
          ))}
        </TrackTabs>
      </section>

      {/* Team */}
      <section id="team" className="scroll-mt-[calc(8rem+3vh)] bg-surface py-14 md:scroll-mt-[calc(5rem+3vh)] md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-6">
          <h2 className="text-[2rem] font-semibold leading-tight tracking-tight md:text-5xl">Meet your trainers.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-12 md:gap-8">
            {team.map((h) => (
              <div key={h.name} className="flex items-center gap-4 rounded-[28px] bg-white p-5 md:gap-6 md:p-8">
                <span className="md:hidden"><Avatar src={h.photo || null} name={h.name.replace(/^Dr\.?\s+/i, "")} size={64} /></span>
                <span className="hidden md:block"><Avatar src={h.photo || null} name={h.name.replace(/^Dr\.?\s+/i, "")} size={112} /></span>
                <div>
                  <h3 className="text-lg font-semibold md:text-xl">{h.name}</h3>
                  <p className="mt-1 text-sm text-muted">{h.designation}</p>
                  <p className="text-sm text-muted">{h.org}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application (shown only while an admin keeps applications open) */}
      <section id="apply" className="mx-auto max-w-3xl scroll-mt-[calc(8rem+3vh)] px-5 py-14 md:scroll-mt-[calc(5rem+3vh)] md:px-6 md:py-24">
        <h2 className="text-[2rem] font-semibold leading-tight tracking-tight md:text-5xl">Apply for the chariot.</h2>
        {openTracks.length > 0 ? (
          <div className="mt-10"><ApplicationForm openTracks={openTracks} /></div>
        ) : (
          <div className="mt-10 rounded-3xl bg-surface p-10 text-muted">Applications are currently closed. Please check back when the next batch opens.</div>
        )}
      </section>

      {/* Phones: Apply stays one tap away while scrolling */}
      {openTracks.length > 0 && (
        <>
          <div className="h-20 md:hidden" aria-hidden="true" />
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur md:hidden">
            <a href="#apply" className="flex items-center justify-between gap-3">
              <span className="text-sm leading-tight"><strong className="block">Applications open</strong><span className="text-muted">{openTracks.map((t) => t.name).join(" and ")} · limited seats</span></span>
              <span className="shrink-0 rounded-full bg-accent px-6 py-3 font-medium text-white">Apply now</span>
            </a>
          </div>
        </>
      )}
    </>
  );
}
