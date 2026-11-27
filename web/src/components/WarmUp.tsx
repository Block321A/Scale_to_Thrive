"use client";

import { useEffect } from "react";

// Quietly wakes the server in the background (at most once every 4 minutes per browser tab),
// so a sleeping server is already awake by the time someone signs in or opens a private page.
export default function WarmUp() {
  useEffect(() => {
    try {
      const last = Number(sessionStorage.getItem("warm") ?? 0);
      if (Date.now() - last < 4 * 60 * 1000) return;
      sessionStorage.setItem("warm", String(Date.now()));
    } catch {
      // private mode: just warm once
    }
    fetch("/api/warm", { cache: "no-store" }).catch(() => {});
  }, []);
  return null;
}
