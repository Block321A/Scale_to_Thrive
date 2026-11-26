"use client";

import { useFormStatus } from "react-dom";

// A form button that shows progress right away, so a slow network never feels like a dead click.
export default function SubmitButton({ children, pending, className }: { children: React.ReactNode; pending: string; className?: string }) {
  const { pending: busy } = useFormStatus();
  return (
    <button className={className} disabled={busy} aria-busy={busy}>
      {busy ? pending : children}
    </button>
  );
}
