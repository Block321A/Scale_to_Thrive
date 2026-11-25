import Image from "next/image";
import Avatar from "@/components/Avatar";
import { tracks } from "@/lib/content";

// Demo enrollee. TODO: replace with the logged-in enrollee from the database.
const me = {
  name: "Ananya Rao",
  headline: "B.E. Computer Science · IT track",
  email: "ananya@example.com",
  college: "PES Institute of Technology and Management",
  photo: "/images/portrait-3.jpg",
  track: tracks[0],
  completedWeeks: 4,
};
const jobs = [
  { company: "Example Tech Pvt Ltd", title: "Junior Python Developer", stage: "Interview" },
  { company: "Sample Systems", title: "Linux Support Engineer – L1", stage: "Applied" },
];

export default function Profile() {
  const t = me.track;
  return (
    <div className="bg-surface pb-24">
      <p className="bg-navy px-6 py-2 text-center text-xs text-white">Sample profile with placeholder data and a stock photo.</p>
      <div className="relative h-56 md:h-72">
        <Image src="/images/office.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-4xl px-0 md:px-6">
        <div className="relative rounded-b-[28px] bg-white px-8 pb-8 pt-24 shadow-sm">
          <div className="absolute -top-20 left-8"><Avatar src={me.photo} name={me.name} size={160} /></div>
          <h1 className="text-3xl font-semibold tracking-tight">{me.name}</h1>
          <p className="text-muted">{me.headline}</p>
          <p className="mt-1 text-sm text-muted">{me.college} · {me.email}</p>
        </div>

        <section className="mt-6 rounded-[28px] bg-white p-8">
          <h2 className="text-xl font-semibold">Workshop milestones · {t.name} track</h2>
          <p className="text-sm text-muted">{me.completedWeeks} of 12 weeks completed</p>
          <div className="mt-4 h-2 rounded-full bg-surface"><div className="h-2 rounded-full bg-accent" style={{ width: `${(me.completedWeeks / 12) * 100}%` }} /></div>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2">
            {t.weeks.map((w) => {
              const done = w.week <= me.completedWeeks;
              const current = w.week === me.completedWeeks + 1;
              return (
                <li key={w.week} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 text-sm">
                  <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${done ? "bg-accent text-white" : current ? "bg-navy text-white" : "bg-white text-muted"}`}>{done ? "✓" : w.week}</span>
                  <span className="flex-1">{w.title}</span>
                  <span className="text-xs text-muted">{done ? "Completed" : current ? "In progress" : "Not started"}</span>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="mt-6 rounded-[28px] bg-white p-8">
          <h2 className="text-xl font-semibold">Jobs you applied for</h2>
          <ul className="mt-4 divide-y divide-black/5">
            {jobs.map((j) => (
              <li key={j.title} className="flex items-center justify-between py-4">
                <div><p className="font-medium">{j.title}</p><p className="text-sm text-muted">{j.company}</p></div>
                <span className="rounded-full bg-surface px-3 py-1 text-sm">{j.stage}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">Sample data. The job listing and applications arrive in the next step.</p>
        </section>
      </div>
    </div>
  );
}
