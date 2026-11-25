import Link from "next/link";
import Logo from "./Logo";

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="Scale to Thrive home" ><Logo compact /></Link>
        <ul className="hidden items-center gap-8 text-sm text-foreground/80 md:flex">
          <li><a href="#tracks" className="hover:text-foreground">Workshops</a></li>
          <li><a href="#curriculum" className="hover:text-foreground">Curriculum</a></li>
          <li><a href="#careers" className="hover:text-foreground">Careers</a></li>
          <li><a href="#team" className="hover:text-foreground">Team</a></li>
          <li><Link href="/profile" className="hover:text-foreground">Sign in</Link></li>
        </ul>
        <a href="#apply" className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0077ed]">Apply</a>
      </nav>
    </header>
  );
}
