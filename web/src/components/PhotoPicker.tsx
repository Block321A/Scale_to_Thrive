"use client";

import { useRef, useState } from "react";

// A big, obvious photo button with a live preview of the chosen file.
export default function PhotoPicker({ label = "Upload photo", name = "photo" }: { label?: string; name?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
    setFileName(f ? f.name : "");
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 px-4 py-3">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Selected photo" className="size-14 rounded-full object-cover object-top ring-2 ring-white shadow" />
      ) : (
        <span className="grid size-14 place-items-center rounded-full bg-accent/10 text-2xl" aria-hidden>📷</span>
      )}
      <div className="min-w-0">
        <button type="button" onClick={() => ref.current?.click()} className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow hover:opacity-90">
          {label}
        </button>
        <p className="mt-1 truncate text-xs text-muted">{fileName || "JPG, PNG or WebP. Then press Save."}</p>
      </div>
      <input ref={ref} name={name} type="file" accept="image/jpeg,image/png,image/webp" onChange={onChange} className="sr-only" tabIndex={-1} />
    </div>
  );
}
