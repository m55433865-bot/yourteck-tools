import type { Metadata } from "next";
import { siteConfig } from "@/lib/tools";

type SeoMetadataOptions = {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  type?: "website" | "article";
};

export const defaultOgImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "YourTeck Tools online file tools",
};

export const publicStaticRoutes = [
  {
    path: "/",
    changeFrequency: "weekly" as const,
    priority: 1,
  },
  {
    path: "/tools",
    changeFrequency: "weekly" as const,
    priority: 0.9,
  },
  {
    path: "/privacy-policy",
    changeFrequency: "yearly" as const,
    priority: 0.4,
  },
  {
    path: "/terms",
    changeFrequency: "yearly" as const,
    priority: 0.4,
  },
  {
    path: "/contact",
    changeFrequency: "yearly" as const,
    priority: 0.4,
  },
];

export function absoluteUrl(path: string) {
  return new URL(path, siteConfig.url).toString();
}

export function createSeoMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  type = "website",
}: SeoMetadataOptions): Metadata {
  const canonical = absoluteUrl(path);
  const metadataTitle = absoluteTitle ? { absolute: title } : title;

  return {
    title: metadataTitle,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: "en_US",
      type,
      images: [defaultOgImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [defaultOgImage.url],
    },
  };
}
