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
  url: "https://tools.yourteck.com",
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
    href: "/tools/image-compressor",
    featured: true,
    status: "available",
    seoTitle: "Free Image Compressor Online | YourTeck Tools",
    seoDescription:
      "Compress JPG, JPEG, PNG, and WebP images online with YourTeck Tools. Upload images up to 20 MB and download a smaller optimized file.",
    sitemapPriority: 0.9,
  },
  {
    slug: "png-to-jpg",
    name: "PNG to JPG Converter",
    description:
      "Convert PNG images to high-quality JPG files with an optional white background.",
    category: "Image",
    href: "/tools/png-to-jpg",
    featured: true,
    status: "available",
    seoTitle: "Free PNG to JPG Converter Online | YourTeck Tools",
    seoDescription:
      "Convert PNG images to JPG online with YourTeck Tools. Upload PNG files up to 20 MB, choose a white background for transparent images, and download a high-quality JPG.",
    sitemapPriority: 0.9,
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

export function getRelatedTools(slug: string, limit = 6) {
  const currentTool = getToolBySlug(slug);

  return tools
    .filter((tool) => tool.slug !== slug)
    .sort((firstTool, secondTool) => {
      const firstSameCategory =
        currentTool && firstTool.category === currentTool.category ? 1 : 0;
      const secondSameCategory =
        currentTool && secondTool.category === currentTool.category ? 1 : 0;
      const firstAvailable = firstTool.status !== "coming-soon" ? 1 : 0;
      const secondAvailable = secondTool.status !== "coming-soon" ? 1 : 0;
      const firstFeatured = firstTool.featured ? 1 : 0;
      const secondFeatured = secondTool.featured ? 1 : 0;

      return (
        secondSameCategory - firstSameCategory ||
        secondAvailable - firstAvailable ||
        secondFeatured - firstFeatured ||
        firstTool.name.localeCompare(secondTool.name)
      );
    })
    .slice(0, limit);
}
