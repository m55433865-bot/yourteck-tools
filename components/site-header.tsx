import Link from "next/link";
import { tools } from "@/lib/tools";
import { BrandLogo } from "./brand-logo";

export function SiteHeader() {
  const availableTools = tools.filter((tool) => tool.status !== "coming-soon");

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <BrandLogo />
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-slate-600 md:justify-end">
          <Link href="/about" className="hover:text-slate-950">
            About
          </Link>
          <Link href="/tools" className="hover:text-slate-950">
            Tools
          </Link>
          {availableTools.map((tool) => (
            <Link key={tool.slug} href={tool.href} className="hover:text-slate-950">
              {tool.name.replace(" Converter", "")}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
