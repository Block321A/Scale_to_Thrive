import Image from "next/image";

// LinkedIn-style round profile picture: circular crop, white ring, soft shadow.
export default function Avatar({ src, name, size = 144 }: { src: string; name: string; size?: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full bg-surface ring-4 ring-white shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
      style={{ width: size, height: size }}
    >
      <Image src={src} alt={`${name} profile photo`} fill sizes={`${size}px`} className="object-cover object-top" />
    </div>
  );
}
