"use client";

import { useLayoutEffect, useRef, useState } from "react";

// Shows the first few lines of long text with a "Read more" toggle.
// The button appears only when the text is actually cut off.
export default function ReadMore({ text, lines = 4, className = "" }: { text: string; lines?: number; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [cut, setCut] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || open) return;
    const check = () => setCut(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, text]);

  return (
    <div className={className}>
      <p
        ref={ref}
        className="whitespace-pre-line text-sm"
        style={open ? undefined : { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: lines, overflow: "hidden" }}
      >
        {text}
      </p>
      {(cut || open) && (
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="mt-2 text-sm font-semibold text-accent hover:underline">
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
