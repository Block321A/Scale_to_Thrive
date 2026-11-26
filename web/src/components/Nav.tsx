"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";

const links = [
  ["/#tracks", "Workshops"],
  ["/#curriculum", "Curriculum"],
  ["/#careers", "Careers"],
  ["/#team", "Team"],
  ["/jobs", "Jobs"],
] as const;

export default function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" aria-label="Scale to Thrive home" onClick={() => setOpen(false)}><Logo compact /></Link>

        <ul className="hidden items-center gap-8 text-sm text-foreground/80 md:flex">
          {links.map(([href, label]) => (
            <li key={href}><Link href={href} className="hover:text-foreground">{label}</Link></li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Always visible, including on phones */}
          <Link href="/login" className="rounded-full px-3 py-1.5 text-sm font-medium text-foreground hover:bg-black/5">Sign in</Link>
          <Link href="/#apply" className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0077ed]">Apply</Link>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full hover:bg-black/5 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-black/5 bg-white md:hidden">
          <ul className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            {links.map(([href, label]) => (
              <li key={href}>
                <Link href={href} onClick={() => setOpen(false)} className="block border-b border-black/5 py-3 text-base last:border-0">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
