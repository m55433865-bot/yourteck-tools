import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Privacy Policy",
  description:
    "Read the YourTeck Tools privacy policy, including how temporary uploaded files are handled.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <ContentPage
      eyebrow="Privacy"
      title="Privacy Policy"
      description="YourTeck Tools is built to keep file utilities simple, clear, and respectful of your privacy."
    >
      <section>
        <h2 className="text-xl font-semibold text-slate-950">Uploaded files</h2>
        <p className="mt-3">
          Files uploaded to converter tools are used only to complete the
          requested task. Uploaded files are temporary and are automatically
          deleted from our temporary storage.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-950">File ownership</h2>
        <p className="mt-3">
          You must only upload files that you own or have permission to use. Do
          not upload files that violate someone else&apos;s rights or privacy.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-950">Basic usage data</h2>
        <p className="mt-3">
          We may use basic technical information, such as request status and
          error logs, to keep the service reliable and secure.
        </p>
      </section>
    </ContentPage>
  );
}
