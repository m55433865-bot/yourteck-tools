import type { Metadata } from "next";
import Link from "next/link";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { JpgToPngUi } from "@/components/jpg-to-png-ui";
import { RelatedTools } from "@/components/related-tools";
import { SectionHeading } from "@/components/section-heading";
import { StructuredData } from "@/components/structured-data";
import { absoluteUrl, createSeoMetadata } from "@/lib/seo";
import { getToolBySlug, siteConfig } from "@/lib/tools";

const jpgTool = getToolBySlug("jpg-to-png");

export const metadata: Metadata = createSeoMetadata({
  title: jpgTool?.seoTitle || "Free JPG to PNG Converter Online | YourTeck Tools",
  description:
    jpgTool?.seoDescription ||
    "Convert JPG and JPEG images to PNG online with YourTeck Tools.",
  path: "/tools/jpg-to-png",
  absoluteTitle: true,
});

const howItWorks = [
  "Upload or drag a JPG or JPEG image into the converter.",
  "The server validates the file type, extension, and image structure.",
  "Your image is converted to PNG and prepared as a temporary download.",
];

const faqs = [
  {
    question: "Which image files can I upload?",
    answer: "This converter accepts JPG and JPEG files up to 20 MB.",
  },
  {
    question: "Will converting JPG to PNG improve quality?",
    answer:
      "Converting to PNG keeps the current image details in a lossless PNG container, but it cannot restore quality already lost in the original JPG.",
  },
  {
    question: "Why is the PNG sometimes larger than the JPG?",
    answer:
      "PNG is lossless, while JPG is compressed for smaller file sizes. A converted PNG can be larger, especially for photos.",
  },
  {
    question: "Are uploaded images stored permanently?",
    answer:
      "No. Uploaded JPG files and converted PNG files are temporary and automatically deleted after a short period.",
  },
];

export default function JpgToPngPage() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: "Free JPG to PNG Converter Online",
              url: absoluteUrl("/tools/jpg-to-png"),
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
              name: "How to convert JPG to PNG online",
              step: howItWorks.map((step, index) => ({
                "@type": "HowToStep",
                position: index + 1,
                text: step,
              })),
            },
          ],
        }}
      />
      <section className="bg-white" aria-labelledby="jpg-to-png-title">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <AdPlaceholder slot="jpg-to-png-top" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid gap-8">
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <p className="text-sm font-semibold uppercase text-cyan-700">
                    Image converter
                  </p>
                  <h1
                    id="jpg-to-png-title"
                    className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl"
                  >
                    Free JPG to PNG Converter Online
                  </h1>
                  <p className="mt-5 text-lg leading-8 text-slate-600">
                    Convert JPG and JPEG images into PNG files from a clean,
                    mobile-friendly tool. Upload an image up to 20 MB and
                    download the converted PNG.
                  </p>
                  <Link
                    href="/tools"
                    className="mt-6 inline-flex h-12 items-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-950 hover:bg-slate-50"
                  >
                    View all tools
                  </Link>
                </div>
                <JpgToPngUi />
              </div>
              <AdPlaceholder slot="jpg-to-png-below-tool" />
            </div>
            <AdPlaceholder
              slot="jpg-to-png-sidebar"
              variant="sidebar"
              className="sticky top-24 hidden self-start lg:flex"
            />
          </div>
        </div>
      </section>

      <RelatedTools currentSlug="jpg-to-png" />

      <section className="border-y border-slate-200 bg-slate-50" aria-labelledby="jpg-how-it-works">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading
              id="jpg-how-it-works"
              title="How it works"
              description="The converter validates JPG uploads and creates a temporary PNG download on the server."
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
              description="Quick answers about JPG uploads, PNG output, file size, and temporary storage."
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

      <section className="bg-white" aria-labelledby="jpg-seo-content">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <SectionHeading
            id="jpg-seo-content"
            eyebrow="JPG to PNG"
            title="Convert JPG images into PNG files"
            description="PNG is useful for editing workflows, design handoff, screenshots, and image processing tasks that need a lossless file format."
          />
          <div className="grid gap-4 text-sm leading-7 text-slate-600">
            <p>
              JPG is popular for photos because it keeps file sizes small. PNG
              is a lossless format that is often better for image editing,
              visual assets, and workflows where repeated saves should avoid
              extra compression loss.
            </p>
            <p>
              YourTeck Tools processes the image temporarily on the server and
              returns a real PNG download. Uploaded and converted files are
              automatically cleaned up after a short period.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
