"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// A slim progress bar at the top of the page plus a spinner on the button you pressed.
// Shown only if the wait is longer than a blink (150 ms), so quick pages never flash anything.
const SKIP = ["/admin/export", "/company/export", "/documents", "/auth/", "/admin/applications/resume", "/company/resume"];

export default function NavProgress() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [phase, setPhase] = useState<"idle" | "run" | "done">("idle");
  const timers = useRef<number[]>([]);
  const first = useRef(true);

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const unbusy = () => document.querySelectorAll("[data-busy]").forEach((b) => b.removeAttribute("data-busy"));

  const finish = useCallback(() => {
    const wasRunning = timers.current.length > 0;
    clear();
    unbusy();
    setPhase((p) => {
      if (p === "run") { timers.current.push(window.setTimeout(() => setPhase("idle"), 350)); return "done"; }
      return "idle";
    });
    return wasRunning;
  }, []);

  const start = useCallback(() => {
    clear();
    timers.current.push(window.setTimeout(() => setPhase("run"), 150));
    timers.current.push(window.setTimeout(finish, 15000)); // never get stuck
  }, [finish]);

  // New page (or new ?query) arrived: complete the bar
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    finish();
  }, [pathname, search, finish]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const href = a.getAttribute("href");
      if (!href || a.target === "_blank" || a.hasAttribute("download") || !href.startsWith("/") || href.startsWith("//")) return;
      const u = new URL(href, location.href);
      if (SKIP.some((p) => u.pathname.startsWith(p))) return;
      if (u.pathname === location.pathname && u.search === location.search) return;
      start();
    };
    const onSubmit = (e: Event) => {
      const f = e.target as HTMLFormElement;
      if (!f || f.hasAttribute("data-own-progress")) return;
      if (SKIP.some((p) => (f.getAttribute("action") ?? "").startsWith(p))) return;
      const btn = ((e as SubmitEvent).submitter as HTMLElement | null) ?? f.querySelector("button");
      btn?.setAttribute("data-busy", "");
      start();
    };
    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit);
    return () => { document.removeEventListener("click", onClick); document.removeEventListener("submit", onSubmit); clear(); };
  }, [start]);

  return (
    <div className={`nav-progress ${phase}`} role="progressbar" aria-hidden={phase === "idle"} aria-label="Loading">
      <div className="nav-progress-bar" />
    </div>
  );
}
