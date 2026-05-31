import type { Metadata } from "next";
import Link from "next/link";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { RelatedTools } from "@/components/related-tools";
import { SectionHeading } from "@/components/section-heading";
import { StructuredData } from "@/components/structured-data";
import { WebpToJpgUi } from "@/components/webp-to-jpg-ui";
import { absoluteUrl, createSeoMetadata } from "@/lib/seo";
import { getToolBySlug, siteConfig } from "@/lib/tools";

const webpToJpgTool = getToolBySlug("webp-to-jpg");

export const metadata: Metadata = createSeoMetadata({
  title:
    webpToJpgTool?.seoTitle ||
    "Free WEBP to JPG Converter Online | YourTeck Tools",
  description:
    webpToJpgTool?.seoDescription ||
    "Convert WEBP images to JPG online with YourTeck Tools.",
  path: "/tools/webp-to-jpg",
  absoluteTitle: true,
});

const howItWorks = [
  "Upload or drag a WEBP image into the converter.",
  "The server validates the file type, extension, and image structure.",
  "Your image is converted to JPG and prepared as a temporary download.",
];

const faqs = [
  {
    question: "Which image files can I upload?",
    answer: "This converter accepts WEBP images up to 25 MB.",
  },
  {
    question: "Why convert WEBP to JPG?",
    answer:
      "JPG is widely supported by older apps, devices, editors, and upload forms that may not accept WEBP images.",
  },
  {
    question: "What happens to transparent WEBP images?",
    answer:
      "JPG does not support transparency, so transparent areas are flattened onto a white background during conversion.",
  },
  {
    question: "Are uploaded images stored permanently?",
    answer:
      "No. Uploaded WEBP files and converted JPG files are temporary and automatically deleted after a short period.",
  },
];

export default function WebpToJpgPage() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: "Free WEBP to JPG Converter Online",
              url: absoluteUrl("/tools/webp-to-jpg"),
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
              name: "How to convert WEBP to JPG online",
              step: howItWorks.map((step, index) => ({
                "@type": "HowToStep",
                position: index + 1,
                text: step,
              })),
            },
          ],
        }}
      />
      <section className="bg-white" aria-labelledby="webp-to-jpg-title">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <AdPlaceholder slot="webp-to-jpg-top" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid gap-8">
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <p className="text-sm font-semibold uppercase text-cyan-700">
                    Image converter
                  </p>
                  <h1
                    id="webp-to-jpg-title"
                    className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl"
                  >
                    Free WEBP to JPG Converter Online
                  </h1>
                  <p className="mt-5 text-lg leading-8 text-slate-600">
                    Convert WEBP images into JPG files for wider compatibility.
                    Upload a WEBP up to 25 MB, process it server-side, and
                    download a temporary converted JPG.
                  </p>
                  <Link
                    href="/tools"
                    className="mt-6 inline-flex h-12 items-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-950 hover:bg-slate-50"
                  >
                    View all tools
                  </Link>
                </div>
                <WebpToJpgUi />
              </div>
              <AdPlaceholder slot="webp-to-jpg-below-tool" />
            </div>
            <AdPlaceholder
              slot="webp-to-jpg-sidebar"
              variant="sidebar"
              className="sticky top-24 hidden self-start lg:flex"
            />
          </div>
        </div>
      </section>

      <RelatedTools currentSlug="webp-to-jpg" />

      <section className="border-y border-slate-200 bg-slate-50" aria-labelledby="webp-to-jpg-how-it-works">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading
              id="webp-to-jpg-how-it-works"
              title="How it works"
              description="The converter validates WEBP uploads and creates a temporary JPG download on the server."
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
              description="Quick answers about WEBP uploads, JPG output, transparency, and temporary storage."
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

      <section className="bg-white" aria-labelledby="webp-to-jpg-seo-content">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <SectionHeading
            id="webp-to-jpg-seo-content"
            eyebrow="WEBP to JPG"
            title="Convert WEBP images for broad compatibility"
            description="JPG is useful for email attachments, product listings, legacy editors, and upload forms that do not support WEBP."
          />
          <div className="grid gap-4 text-sm leading-7 text-slate-600">
            <p>
              WEBP is efficient for the web, but JPG remains one of the most
              widely accepted image formats. Converting WEBP to JPG helps when a
              platform, app, or workflow expects a JPEG image.
            </p>
            <p>
              YourTeck Tools processes the image temporarily on the server and
              returns a real JPG download. Uploaded and converted files are
              automatically cleaned up after a short period.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
