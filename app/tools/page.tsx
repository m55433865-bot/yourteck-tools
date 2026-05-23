import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { StructuredData } from "@/components/structured-data";
import { ToolsBrowser } from "@/components/tools-browser";
import { absoluteUrl, createSeoMetadata } from "@/lib/seo";
import { categories, siteConfig, tools } from "@/lib/tools";

export const metadata: Metadata = createSeoMetadata({
  title: "Free Online Tools",
  description:
    "Browse free online tools from YourTeck Tools for audio, video, image, and document tasks. Search converters and utilities built for quick, temporary file workflows.",
  path: "/tools",
});

export default function ToolsPage() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Free Online Tools",
          url: absoluteUrl("/tools"),
          description:
            "Browse free online file tools from YourTeck Tools.",
          isPartOf: {
            "@type": "WebSite",
            name: siteConfig.name,
            url: siteConfig.url,
          },
          hasPart: tools
            .filter((tool) => tool.status !== "coming-soon")
            .map((tool) => ({
              "@type": "WebApplication",
              name: tool.name,
              url: absoluteUrl(tool.href),
              applicationCategory: `${tool.category}Application`,
            })),
        }}
      />
      <section className="bg-white" aria-labelledby="tools-index-title">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <SectionHeading
            id="tools-index-title"
            eyebrow="Tool library"
            title="All YourTeck Tools"
            description="Search and filter file tools by category. This index is ready to scale as new utilities are added."
          />
          <div className="mt-8">
            <ToolsBrowser />
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50" aria-labelledby="tool-categories">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <SectionHeading
            id="tool-categories"
            title="Categories"
            description="Organized categories make it easier to expand the site and help visitors find the exact tool they need."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <div
                key={category}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-950">
                  {category}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Explore {category.toLowerCase()} tools for quick online file
                  tasks.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
