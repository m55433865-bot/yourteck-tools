import type { Metadata } from "next";
import Link from "next/link";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { QrCodeGeneratorUi } from "@/components/qr-code-generator-ui";
import { RelatedTools } from "@/components/related-tools";
import { SectionHeading } from "@/components/section-heading";
import { StructuredData } from "@/components/structured-data";
import { absoluteUrl, createSeoMetadata } from "@/lib/seo";
import { getToolBySlug, siteConfig } from "@/lib/tools";

const qrTool = getToolBySlug("qr-code-generator");

export const metadata: Metadata = createSeoMetadata({
  title: qrTool?.seoTitle || "Free QR Code Generator Online | YourTeck Tools",
  description:
    qrTool?.seoDescription ||
    "Generate QR codes for URLs, text, email, phone numbers, and WiFi credentials online.",
  path: "/tools/qr-code-generator",
  absoluteTitle: true,
});

const howItWorks = [
  "Choose the QR code type: URL, text, email, phone, or WiFi.",
  "Enter the details and watch the QR code preview update instantly in your browser.",
  "Download the finished QR code as a PNG image.",
];

const faqs = [
  {
    question: "What can I create QR codes for?",
    answer:
      "You can generate QR codes for URLs, plain text, email messages, phone numbers, and WiFi credentials.",
  },
  {
    question: "Is the QR code generated on the server?",
    answer:
      "No. QR codes are generated client-side in your browser, so the preview updates instantly while you type.",
  },
  {
    question: "Can I download the QR code?",
    answer:
      "Yes. The generator creates a PNG download that you can use in documents, print materials, or websites.",
  },
  {
    question: "Do WiFi QR codes include the password?",
    answer:
      "Yes, if you enter a password. Anyone who scans that QR code may be able to join the network, so share it carefully.",
  },
];

export default function QrCodeGeneratorPage() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: "Free QR Code Generator Online",
              url: absoluteUrl("/tools/qr-code-generator"),
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
              name: "How to generate a QR code online",
              step: howItWorks.map((step, index) => ({
                "@type": "HowToStep",
                position: index + 1,
                text: step,
              })),
            },
          ],
        }}
      />
      <section className="bg-white" aria-labelledby="qr-code-generator-title">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <AdPlaceholder slot="qr-code-generator-top" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid gap-8">
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <p className="text-sm font-semibold uppercase text-cyan-700">
                    Utility tool
                  </p>
                  <h1
                    id="qr-code-generator-title"
                    className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl"
                  >
                    Free QR Code Generator Online
                  </h1>
                  <p className="mt-5 text-lg leading-8 text-slate-600">
                    Create QR codes instantly for links, text, email, phone
                    numbers, and WiFi credentials. Preview changes live and
                    download a clean PNG when you are ready.
                  </p>
                  <Link
                    href="/tools"
                    className="mt-6 inline-flex h-12 items-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-950 hover:bg-slate-50"
                  >
                    View all tools
                  </Link>
                </div>
                <QrCodeGeneratorUi />
              </div>
              <AdPlaceholder slot="qr-code-generator-below-tool" />
            </div>
            <AdPlaceholder
              slot="qr-code-generator-sidebar"
              variant="sidebar"
              className="sticky top-24 hidden self-start lg:flex"
            />
          </div>
        </div>
      </section>

      <RelatedTools currentSlug="qr-code-generator" />

      <section className="border-y border-slate-200 bg-slate-50" aria-labelledby="qr-how-it-works">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading
              id="qr-how-it-works"
              title="How it works"
              description="The generator creates QR codes directly in your browser with a live preview and PNG download."
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
              description="Quick answers about QR code types, browser-side generation, downloads, and WiFi codes."
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

      <section className="bg-white" aria-labelledby="qr-seo-content">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <SectionHeading
            id="qr-seo-content"
            eyebrow="QR code generator"
            title="Create QR codes for everyday sharing"
            description="QR codes make it easy to share websites, contact details, WiFi access, and short text with a quick scan."
          />
          <div className="grid gap-4 text-sm leading-7 text-slate-600">
            <p>
              A QR code generator is useful for business cards, event posters,
              menus, classroom materials, product labels, and support pages.
              This tool keeps the workflow focused: choose a type, enter the
              content, preview the code, and download a PNG.
            </p>
            <p>
              Generation happens in the browser, which makes the preview fast
              and avoids an upload step. For WiFi QR codes, only share generated
              images with people who should have access to the network.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
