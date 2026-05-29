import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";
import { Readable } from "node:stream";
import sharp from "sharp";
import { cleanupOldTempFiles, deleteTempFile } from "@/lib/server/temp-cleanup";

export const maxJpgToWebpUploadSizeBytes = 25 * 1024 * 1024;
export const jpgToWebpTempRetentionMs = 10 * 60 * 1000;
export const jpgToWebpUploadTempDirectory = join(
  tmpdir(),
  "yourteck-tools",
  "uploads",
  "jpg-to-webp",
);
export const jpgToWebpOutputTempDirectory = join(
  tmpdir(),
  "yourteck-tools",
  "outputs",
  "jpg-to-webp",
);

type WebpQuality = "high" | "recommended" | "smallest";

const qualitySettings: Record<WebpQuality, { label: string; quality: number; effort: number }> = {
  high: {
    label: "High Quality",
    quality: 90,
    effort: 4,
  },
  recommended: {
    label: "Recommended",
    quality: 78,
    effort: 5,
  },
  smallest: {
    label: "Smallest File Size",
    quality: 62,
    effort: 6,
  },
};

export class JpgToWebpError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "JpgToWebpError";
    this.status = status;
  }
}

export function validateJpgToWebpRequestContentLength(request: Request) {
  const contentLength = request.headers.get("content-length");

  if (!contentLength) {
    return;
  }

  const parsedLength = Number(contentLength);

  if (!Number.isFinite(parsedLength) || parsedLength <= 0) {
    throw new JpgToWebpError("Invalid upload request.", 400);
  }

  if (parsedLength > maxJpgToWebpUploadSizeBytes + 1024 * 1024) {
    throw new JpgToWebpError("JPG is larger than 25 MB.", 413);
  }
}

export function getJpgToWebpUpload(formData: FormData) {
  const file = formData.get("file");
  const quality = formData.get("quality");

  if (!(file instanceof File)) {
    throw new JpgToWebpError("Please choose a JPG or JPEG file to upload.");
  }

  if (quality !== "high" && quality !== "recommended" && quality !== "smallest") {
    throw new JpgToWebpError("Choose a valid WEBP quality level.");
  }

  const webpQuality: WebpQuality = quality;

  return {
    file,
    quality: webpQuality,
  };
}

export async function saveAndConvertJpgToWebp({
  file,
  quality,
}: {
  file: File;
  quality: WebpQuality;
}) {
  validateJpgFile(file);
  await cleanupOldJpgToWebpFiles();
  await mkdir(jpgToWebpUploadTempDirectory, { recursive: true });
  await mkdir(jpgToWebpOutputTempDirectory, { recursive: true });

  const inputName = `${randomUUID()}${getJpgExtension(file.name)}`;
  const outputName = `${randomUUID()}.webp`;
  const inputPath = join(jpgToWebpUploadTempDirectory, inputName);
  const outputPath = join(jpgToWebpOutputTempDirectory, outputName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(inputPath, bytes, { flag: "wx" });

  try {
    const image = sharp(inputPath, { failOn: "error" }).rotate();
    const metadata = await image.metadata();

    if (metadata.format !== "jpeg") {
      throw new JpgToWebpError("The uploaded file is not a valid JPG image.");
    }

    const settings = qualitySettings[quality];
    await image
      .webp({
        quality: settings.quality,
        effort: settings.effort,
      })
      .toFile(outputPath);

    const outputStats = await stat(outputPath);
    void deleteTempFile(inputPath, jpgToWebpUploadTempDirectory, "jpg-webp-upload");
    scheduleJpgToWebpDeletion(
      outputPath,
      jpgToWebpOutputTempDirectory,
      "webp-output",
    );

    return {
      originalName: basename(file.name),
      outputName,
      downloadUrl: `/api/tools/jpg-to-webp/download/${outputName}`,
      originalSize: file.size,
      convertedSize: outputStats.size,
      quality,
      qualityLabel: settings.label,
    };
  } catch (error) {
    await deleteTempFile(inputPath, jpgToWebpUploadTempDirectory, "jpg-webp-upload");
    await deleteTempFile(outputPath, jpgToWebpOutputTempDirectory, "webp-output");

    if (error instanceof JpgToWebpError) {
      throw error;
    }

    console.error("JPG to WEBP conversion failed", error);
    throw new JpgToWebpError(
      "JPG to WEBP conversion failed. Please try another image.",
      422,
    );
  }
}

export async function getWebpDownload(fileName: string) {
  const safeFileName = validateWebpFileName(fileName);
  const filePath = join(jpgToWebpOutputTempDirectory, safeFileName);
  const fileStats = await stat(filePath);

  if (!fileStats.isFile()) {
    return null;
  }

  return {
    fileName: safeFileName,
    size: fileStats.size,
    stream: Readable.toWeb(createReadStream(filePath)) as ReadableStream,
  };
}

export async function cleanupOldJpgToWebpFiles() {
  await Promise.all([
    cleanupOldTempFiles({
      directory: jpgToWebpUploadTempDirectory,
      maxAgeMs: jpgToWebpTempRetentionMs,
      label: "jpg-webp-upload",
    }),
    cleanupOldTempFiles({
      directory: jpgToWebpOutputTempDirectory,
      maxAgeMs: jpgToWebpTempRetentionMs,
      label: "webp-output",
    }),
  ]);
}

function validateJpgFile(file: File) {
  const extension = getJpgExtension(file.name);

  if (file.type !== "image/jpeg") {
    throw new JpgToWebpError("Only JPG and JPEG images are allowed.");
  }

  if (extension !== ".jpg" && extension !== ".jpeg") {
    throw new JpgToWebpError("File extension must be .jpg or .jpeg.");
  }

  if (file.size <= 0) {
    throw new JpgToWebpError("The uploaded JPG is empty.");
  }

  if (file.size > maxJpgToWebpUploadSizeBytes) {
    throw new JpgToWebpError("JPG is larger than 25 MB.", 413);
  }
}

function getJpgExtension(fileName: string) {
  return extname(basename(fileName)).toLowerCase();
}

function validateWebpFileName(fileName: string) {
  const safeFileName = basename(fileName);
  const fileNamePattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/i;

  if (safeFileName !== fileName || !fileNamePattern.test(safeFileName)) {
    throw new JpgToWebpError("Invalid download file.", 400);
  }

  return safeFileName;
}

function scheduleJpgToWebpDeletion(
  filePath: string,
  directory: string,
  label: string,
) {
  const timeout = setTimeout(() => {
    deleteTempFile(filePath, directory, label).catch((error) => {
      console.error(`[cleanup:${label}] Failed to delete temp file`, error);
    });
  }, jpgToWebpTempRetentionMs);

  timeout.unref();
}
