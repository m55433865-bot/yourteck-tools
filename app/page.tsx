import type { Metadata } from "next";
import Link from "next/link";
import { HomeSearch } from "@/components/home-search";
import { SectionHeading } from "@/components/section-heading";
import { StructuredData } from "@/components/structured-data";
import { ToolCard } from "@/components/tool-card";
import { absoluteUrl, createSeoMetadata } from "@/lib/seo";
import { getFeaturedTools, siteConfig } from "@/lib/tools";

export const metadata: Metadata = createSeoMetadata({
  title: "YourTeck Tools | Free Online File Tools",
  description:
    "Use YourTeck Tools for fast online file utilities, including MP4 to MP3 conversion, temporary file handling, and a growing library of audio, video, image, and document tools.",
  path: "/",
  absoluteTitle: true,
});

export default function Home() {
  const featuredTools = getFeaturedTools();

  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteConfig.name,
          url: siteConfig.url,
          description: siteConfig.description,
          potentialAction: {
            "@type": "SearchAction",
            target: `${absoluteUrl("/tools")}?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <section className="bg-white" aria-labelledby="home-hero-title">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <p className="text-sm font-semibold uppercase text-cyan-700">
            Free online utilities
          </p>
          <h1
            id="home-hero-title"
            className="mx-auto mt-4 max-w-3xl text-4xl font-semibold text-slate-950 sm:text-5xl"
          >
            YourTeck Tools
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Fast, simple tools for everyday file conversion, media tasks, and
            digital cleanup. Start with MP4 to MP3 and grow from there.
          </p>
          <HomeSearch />
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/tools"
              className="flex h-12 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Browse all tools
            </Link>
            <Link
              href="/tools/mp4-to-mp3"
              className="flex h-12 items-center justify-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-950 hover:bg-slate-50"
            >
              Try MP4 to MP3
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50" aria-labelledby="featured-tools">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeading
            id="featured-tools"
            eyebrow="Featured"
            title="Popular tools"
            description="A starter set of practical tools with a structure ready for more converters, editors, and file utilities."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white" aria-labelledby="seo-foundation">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-[1fr_1fr] lg:px-8">
          <SectionHeading
            id="seo-foundation"
            eyebrow="SEO ready"
            title="A clean foundation for searchable online tools"
            description="YourTeck Tools is structured with focused pages, useful metadata, and scalable content sections so every new utility can target a clear user intent."
          />
          <div className="grid gap-4 text-sm leading-7 text-slate-600">
            <p>
              Each tool page can carry its own title, description, FAQ, how-it-works
              content, and internal links. That gives search engines and users a
              clear reason to understand and trust the page.
            </p>
            <p>
              The tools index groups utilities by category, while the homepage
              highlights core tasks and gives visitors a quick path to the right
              converter.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
