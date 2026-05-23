import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Terms",
  description:
    "Read the YourTeck Tools terms for using online converters and file tools.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <ContentPage
      eyebrow="Terms"
      title="Terms"
      description="By using YourTeck Tools, you agree to use the service responsibly and only for lawful file tasks."
    >
      <section>
        <h2 className="text-xl font-semibold text-slate-950">Permitted use</h2>
        <p className="mt-3">
          You may use YourTeck Tools for personal or business file tasks. You
          must only upload files you own or have permission to use.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-950">Temporary files</h2>
        <p className="mt-3">
          Uploaded files and generated converter files are temporary and are
          automatically deleted after a short period. You should download any
          result you need before leaving the page.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-950">Service availability</h2>
        <p className="mt-3">
          We aim to keep the tools available and stable, but access may be
          paused temporarily for safety, maintenance, or high traffic.
        </p>
      </section>
    </ContentPage>
  );
}
