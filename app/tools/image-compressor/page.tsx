import type { Metadata } from "next";
import Link from "next/link";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { ImageCompressorUi } from "@/components/image-compressor-ui";
import { RelatedTools } from "@/components/related-tools";
import { SectionHeading } from "@/components/section-heading";
import { StructuredData } from "@/components/structured-data";
import { absoluteUrl, createSeoMetadata } from "@/lib/seo";
import { getToolBySlug, siteConfig } from "@/lib/tools";

const imageTool = getToolBySlug("compress-image");

export const metadata: Metadata = createSeoMetadata({
  title: imageTool?.seoTitle || "Free Image Compressor Online | YourTeck Tools",
  description:
    imageTool?.seoDescription ||
    "Compress JPG, PNG, and WebP images online with YourTeck Tools.",
  path: "/tools/image-compressor",
  absoluteTitle: true,
});

const howItWorks = [
  "Upload or drag a JPG, JPEG, PNG, or WebP image into the compressor.",
  "The server validates the file type and compresses the image with optimized settings.",
  "Download the compressed image and compare original size, compressed size, and percentage saved.",
];

const faqs = [
  {
    question: "Which image formats are supported?",
    answer: "The image compressor accepts JPG, JPEG, PNG, and WebP files.",
  },
  {
    question: "What is the maximum image size?",
    answer: "You can upload images up to 20 MB.",
  },
  {
    question: "Are uploaded images stored permanently?",
    answer:
      "No. Uploaded and compressed images are temporary and automatically deleted after a short period.",
  },
  {
    question: "Will compression change the image format?",
    answer:
      "No. The compressor keeps the original format and applies optimized settings for that format.",
  },
];

export default function ImageCompressorPage() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: "Free Image Compressor Online",
              url: absoluteUrl("/tools/image-compressor"),
              applicationCategory: "MultimediaApplication",
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
              name: "How to compress an image online",
              step: howItWorks.map((step, index) => ({
                "@type": "HowToStep",
                position: index + 1,
                text: step,
              })),
            },
          ],
        }}
      />
      <section className="bg-white" aria-labelledby="image-compressor-title">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <AdPlaceholder slot="image-compressor-top" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid gap-8">
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <p className="text-sm font-semibold uppercase text-cyan-700">
                    Image tool
                  </p>
                  <h1
                    id="image-compressor-title"
                    className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl"
                  >
                    Free Image Compressor Online
                  </h1>
                  <p className="mt-5 text-lg leading-8 text-slate-600">
                    Compress JPG, PNG, and WebP images with a clean,
                    mobile-friendly tool. Upload an image up to 20 MB and get a
                    downloadable optimized file.
                  </p>
                  <Link
                    href="/tools"
                    className="mt-6 inline-flex h-12 items-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-950 hover:bg-slate-50"
                  >
                    View all tools
                  </Link>
                </div>
                <ImageCompressorUi />
              </div>
              <AdPlaceholder slot="image-compressor-below-tool" />
            </div>
            <AdPlaceholder
              slot="image-compressor-sidebar"
              variant="sidebar"
              className="sticky top-24 hidden self-start lg:flex"
            />
          </div>
        </div>
      </section>

      <RelatedTools currentSlug="compress-image" />

      <section className="border-y border-slate-200 bg-slate-50" aria-labelledby="image-how-it-works">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading
              id="image-how-it-works"
              title="How it works"
              description="The compressor keeps the workflow simple while processing images securely on the server."
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
              description="Quick answers about image formats, file size, and temporary storage."
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
    </>
  );
}
