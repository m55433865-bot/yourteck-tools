import type { Metadata } from "next";
import Link from "next/link";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { JpgToWebpUi } from "@/components/jpg-to-webp-ui";
import { RelatedTools } from "@/components/related-tools";
import { SectionHeading } from "@/components/section-heading";
import { StructuredData } from "@/components/structured-data";
import { absoluteUrl, createSeoMetadata } from "@/lib/seo";
import { getToolBySlug, siteConfig } from "@/lib/tools";

const jpgToWebpTool = getToolBySlug("jpg-to-webp");

export const metadata: Metadata = createSeoMetadata({
  title:
    jpgToWebpTool?.seoTitle ||
    "Free JPG to WEBP Converter Online | YourTeck Tools",
  description:
    jpgToWebpTool?.seoDescription ||
    "Convert JPG and JPEG images to WEBP online with YourTeck Tools.",
  path: "/tools/jpg-to-webp",
  absoluteTitle: true,
});

const howItWorks = [
  "Upload or drag a JPG or JPEG image into the converter.",
  "Choose High Quality, Recommended, or Smallest File Size.",
  "The server converts your image to WEBP and prepares a temporary download.",
];

const faqs = [
  {
    question: "Which image files can I upload?",
    answer: "This converter accepts JPG and JPEG files up to 25 MB.",
  },
  {
    question: "Which WEBP quality should I choose?",
    answer:
      "Recommended is best for most images. High Quality keeps more visual detail, while Smallest File Size uses stronger compression.",
  },
  {
    question: "Why convert JPG to WEBP?",
    answer:
      "WEBP usually creates smaller image files than JPG while keeping good visual quality, which can help websites load faster.",
  },
  {
    question: "Are uploaded images stored permanently?",
    answer:
      "No. Uploaded JPG files and converted WEBP files are temporary and automatically deleted after a short period.",
  },
];

export default function JpgToWebpPage() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: "Free JPG to WEBP Converter Online",
              url: absoluteUrl("/tools/jpg-to-webp"),
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
              name: "How to convert JPG to WEBP online",
              step: howItWorks.map((step, index) => ({
                "@type": "HowToStep",
                position: index + 1,
                text: step,
              })),
            },
          ],
        }}
      />
      <section className="bg-white" aria-labelledby="jpg-to-webp-title">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <AdPlaceholder slot="jpg-to-webp-top" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid gap-8">
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <p className="text-sm font-semibold uppercase text-cyan-700">
                    Image converter
                  </p>
                  <h1
                    id="jpg-to-webp-title"
                    className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl"
                  >
                    Free JPG to WEBP Converter Online
                  </h1>
                  <p className="mt-5 text-lg leading-8 text-slate-600">
                    Convert JPG and JPEG images into efficient WEBP files.
                    Choose a quality level, upload an image up to 25 MB, and
                    download the converted WEBP file.
                  </p>
                  <Link
                    href="/tools"
                    className="mt-6 inline-flex h-12 items-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-950 hover:bg-slate-50"
                  >
                    View all tools
                  </Link>
                </div>
                <JpgToWebpUi />
              </div>
              <AdPlaceholder slot="jpg-to-webp-below-tool" />
            </div>
            <AdPlaceholder
              slot="jpg-to-webp-sidebar"
              variant="sidebar"
              className="sticky top-24 hidden self-start lg:flex"
            />
          </div>
        </div>
      </section>

      <RelatedTools currentSlug="jpg-to-webp" />

      <section className="border-y border-slate-200 bg-slate-50" aria-labelledby="jpg-to-webp-how-it-works">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading
              id="jpg-to-webp-how-it-works"
              title="How it works"
              description="The converter validates JPG uploads and creates a temporary WEBP download on the server."
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
              description="Quick answers about JPG uploads, WEBP quality, file size, and temporary storage."
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

      <section className="bg-white" aria-labelledby="jpg-to-webp-seo-content">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <SectionHeading
            id="jpg-to-webp-seo-content"
            eyebrow="JPG to WEBP"
            title="Create smaller web-friendly images"
            description="WEBP is useful for websites, product photos, blog images, and image-heavy pages that need fast loading."
          />
          <div className="grid gap-4 text-sm leading-7 text-slate-600">
            <p>
              JPG is widely supported and works well for photos. WEBP is often
              more efficient, making it a strong choice when you want smaller
              files for web pages without losing too much visual quality.
            </p>
            <p>
              YourTeck Tools processes the image temporarily on the server and
              returns a real WEBP download. Uploaded and converted files are
              automatically cleaned up after a short period.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
