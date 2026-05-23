export type ToolCategory = "Audio" | "Video" | "Image" | "Document";

export type Tool = {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  href: string;
  featured?: boolean;
  status?: "available" | "coming-soon";
  seoTitle?: string;
  seoDescription?: string;
  sitemapPriority?: number;
};

export const siteConfig = {
  name: "YourTeck Tools",
  url: "https://yourteck.tools",
  description:
    "Fast, free, browser-friendly tools for converting, editing, and managing everyday files online.",
};

export const tools: Tool[] = [
  {
    slug: "mp4-to-mp3",
    name: "MP4 to MP3 Converter",
    description:
      "Extract MP3 audio from MP4 videos with a simple online converter interface.",
    category: "Audio",
    href: "/tools/mp4-to-mp3",
    featured: true,
    status: "available",
    seoTitle: "Free MP4 to MP3 Converter Online | YourTeck Tools",
    seoDescription:
      "Convert MP4 video files to MP3 audio online with YourTeck Tools. Upload secure MP4 files up to 200 MB and download a temporary MP3 file after conversion.",
    sitemapPriority: 0.9,
  },
  {
    slug: "compress-image",
    name: "Image Compressor",
    description: "Reduce image file size while keeping visuals clean and usable.",
    category: "Image",
    href: "/tools",
    featured: true,
    status: "coming-soon",
  },
  {
    slug: "pdf-tools",
    name: "PDF Tools",
    description: "Merge, split, and organize PDF files from one tidy workspace.",
    category: "Document",
    href: "/tools",
    featured: true,
    status: "coming-soon",
  },
  {
    slug: "video-compressor",
    name: "Video Compressor",
    description: "Prepare videos for sharing with lightweight compression tools.",
    category: "Video",
    href: "/tools",
    status: "coming-soon",
  },
];

export const categories = Array.from(
  new Set(tools.map((tool) => tool.category)),
).sort();

export function getFeaturedTools() {
  return tools.filter((tool) => tool.featured);
}

export function getToolBySlug(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}
