import Link from "next/link";
import { BrandLogo } from "./brand-logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <BrandLogo inverted />
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
            Simple online utilities built for quick file tasks, clear pages, and
            a growing library of useful tools.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Tools</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-300">
            <Link href="/tools" className="hover:text-white">
              All tools
            </Link>
            <Link href="/tools/mp4-to-mp3" className="hover:text-white">
              MP4 to MP3
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">Company</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-300">
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">SEO</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-300">
            <Link href="/sitemap.xml" className="hover:text-white">
              Sitemap
            </Link>
            <Link href="/robots.txt" className="hover:text-white">
              Robots
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
