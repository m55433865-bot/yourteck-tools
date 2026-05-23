import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "About",
  description:
    "Learn about YourTeck Tools, a simple platform for fast online tools, file conversion utilities, and privacy-minded temporary file handling.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <ContentPage
      eyebrow="About"
      title="About YourTeck Tools"
      description="YourTeck Tools is a growing platform for fast online utilities that help people complete everyday file tasks with less friction."
    >
      <section>
        <h2 className="text-xl font-semibold text-slate-950">
          Simple tools for practical tasks
        </h2>
        <p className="mt-3">
          The platform is focused on useful browser-based tools, including file
          conversion utilities like{" "}
          <Link
            href="/tools/mp4-to-mp3"
            className="font-semibold text-cyan-700 hover:text-cyan-800"
          >
            MP4 to MP3 conversion
          </Link>
          . Each tool is designed to be direct, easy to understand, and quick to
          use.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-950">
          Privacy-minded by default
        </h2>
        <p className="mt-3">
          Uploaded files are temporary and automatically deleted after a short
          period. YourTeck Tools is built around focused file processing, not
          permanent file storage.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-950">
          Built for speed, simplicity, and accessibility
        </h2>
        <p className="mt-3">
          The goal is to keep every tool lightweight, responsive, and accessible
          across devices. Clear layouts, straightforward labels, and minimal
          steps help users finish tasks without distraction.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-950">
          Explore the tools
        </h2>
        <p className="mt-3">
          Browse the{" "}
          <Link
            href="/tools"
            className="font-semibold text-cyan-700 hover:text-cyan-800"
          >
            full tools library
          </Link>{" "}
          to see available converters and upcoming utilities.
        </p>
      </section>
    </ContentPage>
  );
}
