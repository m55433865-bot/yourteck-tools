import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact YourTeck Tools for support and general questions.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact | YourTeck Tools",
    description: "Contact YourTeck Tools.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <ContentPage
      eyebrow="Contact"
      title="Contact"
      description="Questions, feedback, and support requests can be sent by email."
    >
      <section>
        <h2 className="text-xl font-semibold text-slate-950">Email</h2>
        <p className="mt-3">
          Contact us at{" "}
          <a
            href="mailto:contact@yourteck.com"
            className="font-semibold text-cyan-700 hover:text-cyan-800"
          >
            contact@yourteck.com
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-950">File tools</h2>
        <p className="mt-3">
          Uploaded files are temporary and automatically deleted. Please only
          upload files you own or have permission to use.
        </p>
      </section>
    </ContentPage>
  );
}
