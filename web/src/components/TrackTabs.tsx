"use client";

import { Children, useState } from "react";

// Phones: IT / Non-IT tabs, one track at a time (shorter page).
// Tablets and desktops: both tracks side by side, as before.
export default function TrackTabs({ labels, children }: { labels: string[]; children: React.ReactNode }) {
  const [active, setActive] = useState(0);
  const panels = Children.toArray(children);
  return (
    <div className="mt-8 md:mt-12">
      <div role="tablist" className="mb-6 flex rounded-full bg-black/[0.05] p-1 md:hidden">
        {labels.map((l, i) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${i === active ? "bg-white text-foreground shadow" : "text-muted"}`}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="md:grid md:grid-cols-2 md:gap-10">
        {panels.map((p, i) => (
          <div key={i} role="tabpanel" className={i === active ? "" : "hidden md:block"}>{p}</div>
        ))}
      </div>
    </div>
  );
}
