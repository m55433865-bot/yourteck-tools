import Link from "next/link";
import { BrandLogo } from "./brand-logo";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <BrandLogo />
        <nav className="flex items-center gap-5 text-sm font-medium text-slate-600">
          <Link href="/about" className="hover:text-slate-950">
            About
          </Link>
          <Link href="/tools" className="hover:text-slate-950">
            Tools
          </Link>
          <Link href="/tools/mp4-to-mp3" className="hover:text-slate-950">
            MP4 to MP3
          </Link>
        </nav>
      </div>
    </header>
  );
}
