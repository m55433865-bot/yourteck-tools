import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { getRelatedTools } from "@/lib/tools";

type RelatedToolsProps = {
  currentSlug: string;
};

export function RelatedTools({ currentSlug }: RelatedToolsProps) {
  const relatedTools = getRelatedTools(currentSlug);

  if (!relatedTools.length) {
    return null;
  }

  return (
    <section className="bg-white" aria-labelledby={`${currentSlug}-related-tools`}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          id={`${currentSlug}-related-tools`}
          eyebrow="Related tools"
          title="Try another YourTeck tool"
          description="Keep working with fast online converters and file utilities built for simple temporary uploads."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {relatedTools.map((tool) => {
            const isAvailable = tool.status !== "coming-soon";

            return (
              <Link
                key={tool.slug}
                href={tool.href}
                className="group flex min-h-44 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-md bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">
                    {tool.category}
                  </span>
                  {!isAvailable ? (
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      Soon
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-5 text-base font-semibold text-slate-950 group-hover:text-cyan-800">
                  {tool.name}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                  {tool.description}
                </p>
                <span className="mt-5 text-sm font-semibold text-slate-950">
                  {isAvailable ? "Open related tool" : "View tool category"}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
