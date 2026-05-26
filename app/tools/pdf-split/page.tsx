import type { Metadata } from "next";
import Link from "next/link";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { PdfSplitUi } from "@/components/pdf-split-ui";
import { RelatedTools } from "@/components/related-tools";
import { SectionHeading } from "@/components/section-heading";
import { StructuredData } from "@/components/structured-data";
import { absoluteUrl, createSeoMetadata } from "@/lib/seo";
import { getToolBySlug, siteConfig } from "@/lib/tools";

const pdfSplitTool = getToolBySlug("pdf-split");

export const metadata: Metadata = createSeoMetadata({
  title: pdfSplitTool?.seoTitle || "Free PDF Split Online | YourTeck Tools",
  description:
    pdfSplitTool?.seoDescription ||
    "Split PDF files online with YourTeck Tools.",
  path: "/tools/pdf-split",
  absoluteTitle: true,
});

const howItWorks = [
  "Upload one PDF file, up to 100 MB.",
  "Choose to split every page or extract selected pages like 1,3,5-8.",
  "Process the PDF on the server and download a ZIP file with the results.",
];

const faqs = [
  {
    question: "Can I split every page into separate PDF files?",
    answer:
      "Yes. Choose the split every page option and each page will be saved as its own PDF inside a ZIP download.",
  },
  {
    question: "How do selected page ranges work?",
    answer:
      "Enter pages separated by commas, with optional ranges. For example, 1,3,5-8 extracts pages 1, 3, 5, 6, 7, and 8.",
  },
  {
    question: "What is the upload limit?",
    answer: "You can upload one PDF file up to 100 MB.",
  },
  {
    question: "Are uploaded PDFs stored permanently?",
    answer:
      "No. YourTeck Tools stores generated ZIP files temporarily for download and automatically cleans up temporary files after a short period.",
  },
];

export default function PdfSplitPage() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: "Free PDF Split Online",
              url: absoluteUrl("/tools/pdf-split"),
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
              name: "How to split PDF files online",
              step: howItWorks.map((step, index) => ({
                "@type": "HowToStep",
                position: index + 1,
                text: step,
              })),
            },
          ],
        }}
      />
      <section className="bg-white" aria-labelledby="pdf-split-title">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <AdPlaceholder slot="pdf-split-top" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid gap-8">
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <p className="text-sm font-semibold uppercase text-cyan-700">
                    PDF tool
                  </p>
                  <h1
                    id="pdf-split-title"
                    className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl"
                  >
                    Free PDF Split Online
                  </h1>
                  <p className="mt-5 text-lg leading-8 text-slate-600">
                    Split a PDF into separate pages or extract the exact pages
                    you need. Download the result as a temporary ZIP file from a
                    simple mobile-friendly workflow.
                  </p>
                  <Link
                    href="/tools"
                    className="mt-6 inline-flex h-12 items-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-950 hover:bg-slate-50"
                  >
                    View all tools
                  </Link>
                </div>
                <PdfSplitUi />
              </div>
              <AdPlaceholder slot="pdf-split-below-tool" />
            </div>
            <AdPlaceholder
              slot="pdf-split-sidebar"
              variant="sidebar"
              className="sticky top-24 hidden self-start lg:flex"
            />
          </div>
        </div>
      </section>

      <RelatedTools currentSlug="pdf-split" />

      <section className="border-y border-slate-200 bg-slate-50" aria-labelledby="pdf-split-how-it-works">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading
              id="pdf-split-how-it-works"
              title="How it works"
              description="The PDF split tool keeps page extraction, processing, and downloading straightforward."
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
              description="Quick answers about splitting pages, page ranges, file limits, and temporary downloads."
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

      <section className="bg-white" aria-labelledby="pdf-split-seo-content">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <SectionHeading
            id="pdf-split-seo-content"
            eyebrow="PDF split"
            title="Extract the PDF pages you need"
            description="Splitting PDFs is useful for forms, scanned packets, invoices, reports, and any document where you only need specific pages."
          />
          <div className="grid gap-4 text-sm leading-7 text-slate-600">
            <p>
              A PDF split tool helps turn a large document into smaller, easier
              to share files. You can separate every page or extract a clean set
              of selected pages using a simple range format.
            </p>
            <p>
              YourTeck Tools processes uploaded PDFs temporarily on the server.
              Generated ZIP files stay available briefly for download and are
              automatically cleaned up after a short period.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
