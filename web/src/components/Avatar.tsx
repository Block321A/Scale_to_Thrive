import Image from "next/image";

// LinkedIn-style round profile picture: circular crop, white ring, soft shadow.
// With no photo it shows the person's initials instead of a stock picture.
export default function Avatar({ src, name, size = 144 }: { src?: string | null; name: string; size?: number }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full bg-navy ring-4 ring-white shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image src={src} alt={`${name} profile photo`} fill sizes={`${size}px`} className="object-cover object-top" />
      ) : (
        <span className="grid size-full place-items-center font-semibold text-white" style={{ fontSize: size * 0.36 }} aria-hidden="true">{initials}</span>
      )}
    </div>
  );
}
