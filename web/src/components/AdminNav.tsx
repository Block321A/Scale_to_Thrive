"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/admin", "Dashboard"],
  ["/admin/tracks", "Tracks"],
  ["/admin/applications", "Applications"],
  ["/admin/enrollees", "Enrollees"],
  ["/admin/jobs", "Jobs"],
  ["/admin/companies", "Companies"],
  ["/admin/admins", "Admins"],
] as const;

// Small dot on the tab you just tapped while its page loads. The current page stays on screen, so nothing flickers.
function Pending() {
  const { pending } = useLinkStatus();
  return <span aria-hidden className={`ml-1.5 inline-block size-1.5 rounded-full bg-current align-middle transition-opacity ${pending ? "animate-pulse opacity-100" : "opacity-0"}`} />;
}

export default function AdminNav({ email }: { email: string }) {
  const path = usePathname();
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path === href || path.startsWith(href + "/"));
  return (
    <>
      {/* Phones: sticky, swipeable section bar (like Fabric's in-page bar) */}
      <div className="sticky top-[calc(1.5vh+67px)] z-30 -mx-5 border-b border-black/5 bg-surface/95 backdrop-blur md:hidden">
        <nav aria-label="Admin sections" className="flex gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none]">
          {items.map(([href, label]) => (
            <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${active(href) ? "bg-foreground text-white" : "bg-white text-foreground"}`}>
              {label}<Pending />
            </Link>
          ))}
        </nav>
      </div>

      {/* Tablets and desktops: sidebar */}
      <aside className="hidden md:block md:w-52 md:shrink-0">
        <p className="mb-3 truncate text-xs text-muted" title={email}>Admin · {email}</p>
        <nav aria-label="Admin sections" className="flex flex-col gap-1">
          {items.map(([href, label]) => (
            <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${active(href) ? "bg-white text-foreground shadow-sm" : "text-foreground/75 hover:bg-white/70"}`}>
              {label}<Pending />
            </Link>
          ))}
        </nav>
        <form action="/auth/signout" method="post" className="mt-4"><button className="px-3 text-sm text-muted hover:text-foreground">Sign out</button></form>
      </aside>
    </>
  );
}
