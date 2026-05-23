import type { Metadata } from "next";
import Link from "next/link";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { Mp4ConverterUi } from "@/components/mp4-converter-ui";
import { RelatedTools } from "@/components/related-tools";
import { SectionHeading } from "@/components/section-heading";
import { StructuredData } from "@/components/structured-data";
import { absoluteUrl, createSeoMetadata } from "@/lib/seo";
import { getToolBySlug, siteConfig } from "@/lib/tools";

const mp4Tool = getToolBySlug("mp4-to-mp3");

export const metadata: Metadata = createSeoMetadata({
  title: mp4Tool?.seoTitle || "Free MP4 to MP3 Converter Online | YourTeck Tools",
  description:
    mp4Tool?.seoDescription ||
    "Convert MP4 video files to MP3 audio online with YourTeck Tools.",
  path: "/tools/mp4-to-mp3",
  absoluteTitle: true,
});

const howItWorks = [
  "Upload or drag an MP4 video into the converter box.",
  "The upload endpoint validates file type, extension, size, and MP4 structure.",
  "The file is converted to MP3 with FFmpeg and made available through a temporary download link.",
];

const faqs = [
  {
    question: "Is MP4 uploading live yet?",
    answer:
      "Yes. MP4 upload and MP3 conversion are active when FFmpeg is installed on the server.",
  },
  {
    question: "What is the maximum file size?",
    answer: "The interface shows a maximum file size of 200 MB.",
  },
  {
    question: "Can I drag and drop MP4 files?",
    answer:
      "Yes. The upload box supports drag and drop, along with a standard file picker.",
  },
  {
    question: "Will the downloaded MP3 be real right now?",
    answer:
      "Yes. The download button is enabled only after FFmpeg finishes creating the MP3 file.",
  },
];

export default function Mp4ToMp3Page() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: "Free MP4 to MP3 Converter Online",
              url: absoluteUrl("/tools/mp4-to-mp3"),
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
              name: "How to convert MP4 to MP3",
              step: howItWorks.map((step, index) => ({
                "@type": "HowToStep",
                position: index + 1,
                text: step,
              })),
            },
          ],
        }}
      />
      <section className="bg-white" aria-labelledby="mp4-tool-title">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <AdPlaceholder slot="mp4-to-mp3-top" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid gap-8">
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <p className="text-sm font-semibold uppercase text-cyan-700">
                    Audio converter
                  </p>
                  <h1 id="mp4-tool-title" className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl">
                    Free MP4 to MP3 Converter Online
                  </h1>
                  <p className="mt-5 text-lg leading-8 text-slate-600">
                    Upload MP4 videos with a clean, mobile-friendly tool page.
                    This version validates uploads, converts them with FFmpeg,
                    and stores the MP3 temporarily for download.
                  </p>
                  <Link
                    href="/tools"
                    className="mt-6 inline-flex h-12 items-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-950 hover:bg-slate-50"
                  >
                    View all tools
                  </Link>
                </div>
                <Mp4ConverterUi />
              </div>
              <AdPlaceholder slot="mp4-to-mp3-below-converter" />
            </div>
            <AdPlaceholder
              slot="mp4-to-mp3-sidebar"
              variant="sidebar"
              className="sticky top-24 hidden self-start lg:flex"
            />
          </div>
        </div>
      </section>

      <RelatedTools currentSlug="mp4-to-mp3" />

      <section className="border-y border-slate-200 bg-slate-50" aria-labelledby="mp4-how-it-works">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading
              id="mp4-how-it-works"
              title="How it works"
              description="The upload flow is simple, secure, and built for real MP4 to MP3 conversion."
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
              description="Clear answers help visitors understand the current frontend-only state."
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

      <section className="bg-white" aria-labelledby="mp4-guide">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <SectionHeading
            id="mp4-guide"
            eyebrow="Guide"
            title="Convert MP4 video audio to MP3"
            description="An MP4 to MP3 converter is useful when you only need the audio track from a video file, such as a lecture, voice note, interview, or recording."
          />
          <div className="mt-6 grid gap-5 text-base leading-8 text-slate-600 md:grid-cols-2">
            <p>
              MP3 files are widely supported across phones, browsers, media
              players, and editing apps. A focused converter page gives users a
              direct path from video upload to audio download without extra
              options getting in the way.
            </p>
            <p>
              This YourTeck Tools page now runs a production-style conversion
              pipeline locally: upload, validate, convert, delete the source
              MP4, and keep the generated MP3 available temporarily.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
