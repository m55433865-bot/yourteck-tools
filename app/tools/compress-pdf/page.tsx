import type { Metadata } from "next";
import Link from "next/link";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { CompressPdfUi } from "@/components/compress-pdf-ui";
import { RelatedTools } from "@/components/related-tools";
import { SectionHeading } from "@/components/section-heading";
import { StructuredData } from "@/components/structured-data";
import { absoluteUrl, createSeoMetadata } from "@/lib/seo";
import { getToolBySlug, siteConfig } from "@/lib/tools";

const compressPdfTool = getToolBySlug("compress-pdf");

export const metadata: Metadata = createSeoMetadata({
  title: compressPdfTool?.seoTitle || "Free PDF Compressor Online | YourTeck Tools",
  description:
    compressPdfTool?.seoDescription ||
    "Compress PDF files online with YourTeck Tools.",
  path: "/tools/compress-pdf",
  absoluteTitle: true,
});

const howItWorks = [
  "Upload one PDF file, up to 100 MB.",
  "Choose low, recommended, or high compression.",
  "Compress the PDF on the server and download the optimized file.",
];

const faqs = [
  {
    question: "What compression level should I choose?",
    answer:
      "Recommended is a good default for most PDFs. Low compression keeps the file closest to the original, while high compression uses stronger optimization.",
  },
  {
    question: "Will every PDF become much smaller?",
    answer:
      "Compression depends on how the PDF was created. Some PDFs are already optimized, so the size reduction may be small.",
  },
  {
    question: "What is the upload limit?",
    answer: "You can upload one PDF file up to 100 MB.",
  },
  {
    question: "Are uploaded PDFs stored permanently?",
    answer:
      "No. YourTeck Tools stores compressed PDFs temporarily for download and automatically cleans up temporary files after a short period.",
  },
];

export default function CompressPdfPage() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: "Free PDF Compressor Online",
              url: absoluteUrl("/tools/compress-pdf"),
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
              name: "How to compress PDF files online",
              step: howItWorks.map((step, index) => ({
                "@type": "HowToStep",
                position: index + 1,
                text: step,
              })),
            },
          ],
        }}
      />
      <section className="bg-white" aria-labelledby="compress-pdf-title">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <AdPlaceholder slot="compress-pdf-top" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid gap-8">
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <p className="text-sm font-semibold uppercase text-cyan-700">
                    PDF tool
                  </p>
                  <h1
                    id="compress-pdf-title"
                    className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl"
                  >
                    Free PDF Compressor Online
                  </h1>
                  <p className="mt-5 text-lg leading-8 text-slate-600">
                    Reduce PDF file size for sharing, uploads, and storage.
                    Choose a compression level, process the file securely on the
                    server, and download a temporary compressed PDF.
                  </p>
                  <Link
                    href="/tools"
                    className="mt-6 inline-flex h-12 items-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-950 hover:bg-slate-50"
                  >
                    View all tools
                  </Link>
                </div>
                <CompressPdfUi />
              </div>
              <AdPlaceholder slot="compress-pdf-below-tool" />
            </div>
            <AdPlaceholder
              slot="compress-pdf-sidebar"
              variant="sidebar"
              className="sticky top-24 hidden self-start lg:flex"
            />
          </div>
        </div>
      </section>

      <RelatedTools currentSlug="compress-pdf" />

      <section className="border-y border-slate-200 bg-slate-50" aria-labelledby="compress-pdf-how-it-works">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading
              id="compress-pdf-how-it-works"
              title="How it works"
              description="The PDF compressor keeps upload, compression, and download steps simple."
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
              description="Quick answers about compression levels, file limits, and temporary downloads."
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

      <section className="bg-white" aria-labelledby="compress-pdf-seo-content">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <SectionHeading
            id="compress-pdf-seo-content"
            eyebrow="PDF compressor"
            title="Make PDFs easier to upload and share"
            description="Compressing PDFs can help with email attachments, form submissions, online portals, and storage limits."
          />
          <div className="grid gap-4 text-sm leading-7 text-slate-600">
            <p>
              A PDF compressor reduces file size by optimizing the document
              structure and saving a cleaner output file. It is useful for
              reports, forms, scanned documents, and files that need to fit
              under upload limits.
            </p>
            <p>
              YourTeck Tools processes uploaded PDFs temporarily on the server.
              The compressed PDF stays available briefly for download and is
              automatically cleaned up after a short period.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
