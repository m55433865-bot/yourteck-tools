import type { Metadata } from "next";
import Link from "next/link";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { PngToJpgUi } from "@/components/png-to-jpg-ui";
import { RelatedTools } from "@/components/related-tools";
import { SectionHeading } from "@/components/section-heading";
import { StructuredData } from "@/components/structured-data";
import { absoluteUrl, createSeoMetadata } from "@/lib/seo";
import { getToolBySlug, siteConfig } from "@/lib/tools";

const pngTool = getToolBySlug("png-to-jpg");

export const metadata: Metadata = createSeoMetadata({
  title: pngTool?.seoTitle || "Free PNG to JPG Converter Online | YourTeck Tools",
  description:
    pngTool?.seoDescription ||
    "Convert PNG images to high-quality JPG files online with YourTeck Tools.",
  path: "/tools/png-to-jpg",
  absoluteTitle: true,
});

const howItWorks = [
  "Upload or drag a PNG image into the converter.",
  "Choose whether transparent areas should use a white background.",
  "The server converts the PNG into a high-quality JPG and prepares a temporary download.",
];

const faqs = [
  {
    question: "Which file type can I upload?",
    answer: "This converter accepts PNG files only, with a maximum upload size of 20 MB.",
  },
  {
    question: "What happens to transparent PNG backgrounds?",
    answer:
      "JPG files do not support transparency, so transparent areas are flattened during conversion. You can choose a white background for cleaner product images and graphics.",
  },
  {
    question: "Will the JPG look good?",
    answer:
      "Yes. The converter uses high-quality JPG settings designed to preserve clear visual detail while creating a broadly compatible image file.",
  },
  {
    question: "Are uploaded images stored permanently?",
    answer:
      "No. Uploaded PNG files and converted JPG files are temporary and automatically deleted after a short period.",
  },
];

export default function PngToJpgPage() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: "Free PNG to JPG Converter Online",
              url: absoluteUrl("/tools/png-to-jpg"),
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
              name: "How to convert PNG to JPG online",
              step: howItWorks.map((step, index) => ({
                "@type": "HowToStep",
                position: index + 1,
                text: step,
              })),
            },
          ],
        }}
      />
      <section className="bg-white" aria-labelledby="png-to-jpg-title">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <AdPlaceholder slot="png-to-jpg-top" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid gap-8">
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <p className="text-sm font-semibold uppercase text-cyan-700">
                    Image converter
                  </p>
                  <h1
                    id="png-to-jpg-title"
                    className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl"
                  >
                    Free PNG to JPG Converter Online
                  </h1>
                  <p className="mt-5 text-lg leading-8 text-slate-600">
                    Convert PNG images into high-quality JPG files from a clean,
                    mobile-friendly tool. Upload a PNG up to 20 MB, choose the
                    background for transparency, and download the converted JPG.
                  </p>
                  <Link
                    href="/tools"
                    className="mt-6 inline-flex h-12 items-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-950 hover:bg-slate-50"
                  >
                    View all tools
                  </Link>
                </div>
                <PngToJpgUi />
              </div>
              <AdPlaceholder slot="png-to-jpg-below-tool" />
            </div>
            <AdPlaceholder
              slot="png-to-jpg-sidebar"
              variant="sidebar"
              className="sticky top-24 hidden self-start lg:flex"
            />
          </div>
        </div>
      </section>

      <RelatedTools currentSlug="png-to-jpg" />

      <section className="border-y border-slate-200 bg-slate-50" aria-labelledby="png-how-it-works">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading
              id="png-how-it-works"
              title="How it works"
              description="The converter keeps PNG to JPG conversion simple while validating and processing images securely on the server."
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
              description="Quick answers about PNG uploads, transparent backgrounds, quality, and temporary storage."
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

      <section className="bg-white" aria-labelledby="png-seo-content">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <SectionHeading
            id="png-seo-content"
            eyebrow="PNG to JPG"
            title="Convert PNG images for sharing and compatibility"
            description="JPG is widely supported across websites, email clients, documents, and everyday apps."
          />
          <div className="grid gap-4 text-sm leading-7 text-slate-600">
            <p>
              PNG is excellent for screenshots, graphics, and images with
              transparency, while JPG is often better for broad compatibility and
              quick sharing. This tool converts PNG files into downloadable JPG
              images without requiring desktop software.
            </p>
            <p>
              Files are processed temporarily on the server. Uploaded PNG files
              and converted JPG outputs are automatically cleaned up after a
              short period, keeping the workflow simple and privacy-conscious.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
