import type { Metadata } from "next";
import Link from "next/link";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { PdfMergeUi } from "@/components/pdf-merge-ui";
import { RelatedTools } from "@/components/related-tools";
import { SectionHeading } from "@/components/section-heading";
import { StructuredData } from "@/components/structured-data";
import { absoluteUrl, createSeoMetadata } from "@/lib/seo";
import { getToolBySlug, siteConfig } from "@/lib/tools";

const pdfMergeTool = getToolBySlug("pdf-merge");

export const metadata: Metadata = createSeoMetadata({
  title: pdfMergeTool?.seoTitle || "Free PDF Merge Online | YourTeck Tools",
  description:
    pdfMergeTool?.seoDescription ||
    "Merge multiple PDF files online with YourTeck Tools.",
  path: "/tools/pdf-merge",
  absoluteTitle: true,
});

const howItWorks = [
  "Upload two or more PDF files, up to 100 MB total.",
  "Drag and drop the files or use the controls to set the merge order.",
  "Merge the PDFs on the server and download one combined PDF file.",
];

const faqs = [
  {
    question: "How many PDFs can I merge?",
    answer:
      "You can upload multiple PDF files as long as the total upload size stays under 100 MB.",
  },
  {
    question: "Can I reorder PDFs before merging?",
    answer:
      "Yes. Reorder files with drag and drop or with the Up and Down controls before starting the merge.",
  },
  {
    question: "Are uploaded PDFs stored permanently?",
    answer:
      "No. The merged PDF is stored temporarily for download, and temporary files are automatically cleaned up after a short period.",
  },
  {
    question: "Why did my PDF merge fail?",
    answer:
      "Some encrypted, damaged, or unsupported PDFs cannot be merged. Try unlocked PDF files and upload them again.",
  },
];

export default function PdfMergePage() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: "Free PDF Merge Online",
              url: absoluteUrl("/tools/pdf-merge"),
              applicationCategory: "UtilitiesApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              isPartOf: {
                "@type": "WebSite",
                name: siteConfig.name,
                url: siteConfig.url,
              },
            },
            {
              "@type": "FAQPage",
              mainEntity: faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            },
            {
              "@type": "HowTo",
              name: "How to merge PDF files online",
              step: howItWorks.map((step, index) => ({
                "@type": "HowToStep",
                position: index + 1,
                text: step,
              })),
            },
          ],
        }}
      />
      <section className="bg-white" aria-labelledby="pdf-merge-title">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <AdPlaceholder slot="pdf-merge-top" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid gap-8">
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <p className="text-sm font-semibold uppercase text-cyan-700">
                    PDF tool
                  </p>
                  <h1
                    id="pdf-merge-title"
                    className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl"
                  >
                    Free PDF Merge Online
                  </h1>
                  <p className="mt-5 text-lg leading-8 text-slate-600">
                    Combine multiple PDF files into one document. Upload PDFs,
                    reorder them, and download a merged PDF from a clean,
                    mobile-friendly workflow.
                  </p>
                  <Link
                    href="/tools"
                    className="mt-6 inline-flex h-12 items-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-950 hover:bg-slate-50"
                  >
                    View all tools
                  </Link>
                </div>
                <PdfMergeUi />
              </div>
              <AdPlaceholder slot="pdf-merge-below-tool" />
            </div>
            <AdPlaceholder
              slot="pdf-merge-sidebar"
              variant="sidebar"
              className="sticky top-24 hidden self-start lg:flex"
            />
          </div>
        </div>
      </section>

      <RelatedTools currentSlug="pdf-merge" />

      <section className="border-y border-slate-200 bg-slate-50" aria-labelledby="pdf-how-it-works">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading
              id="pdf-how-it-works"
              title="How it works"
              description="The PDF merge tool keeps ordering, uploading, and downloading straightforward."
            />
            <ol className="mt-6 grid gap-3">
              {howItWorks.map((step, index) => (
                <li
                  key={step}
                  className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-cyan-700 text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-6 text-slate-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <SectionHeading
              title="FAQ"
              description="Quick answers about upload limits, reordering, temporary files, and merge errors."
            />
            <div className="mt-6 grid gap-3">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <summary className="cursor-pointer text-sm font-semibold text-slate-950">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white" aria-labelledby="pdf-seo-content">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <SectionHeading
            id="pdf-seo-content"
            eyebrow="PDF merge"
            title="Combine PDFs into one document"
            description="Merging PDFs is useful for contracts, reports, invoices, scanned pages, forms, and shared document packets."
          />
          <div className="grid gap-4 text-sm leading-7 text-slate-600">
            <p>
              A PDF merge tool helps turn several separate files into one
              organized document. Upload the PDFs in the order you want, adjust
              the order before merging, and download a single combined PDF.
            </p>
            <p>
              YourTeck Tools processes the merge temporarily on the server. The
              merged file stays available briefly for download and is then
              automatically cleaned up.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
