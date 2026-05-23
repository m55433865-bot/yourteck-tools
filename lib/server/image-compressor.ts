import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { tmpdir } from "node:os";
import { Readable } from "node:stream";
import sharp, { type FormatEnum } from "sharp";
import { cleanupOldTempFiles, deleteTempFile } from "@/lib/server/temp-cleanup";

export const maxImageUploadSizeBytes = 20 * 1024 * 1024;
export const imageTempRetentionMs = 10 * 60 * 1000;
export const imageUploadTempDirectory = join(
  tmpdir(),
  "yourteck-tools",
  "uploads",
  "image-compressor",
);
export const imageOutputTempDirectory = join(
  tmpdir(),
  "yourteck-tools",
  "outputs",
  "image-compressor",
);

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const outputContentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export class ImageCompressionError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ImageCompressionError";
    this.status = status;
  }
}

export function validateImageRequestContentLength(request: Request) {
  const contentLength = request.headers.get("content-length");

  if (!contentLength) {
    return;
  }

  const parsedLength = Number(contentLength);

  if (!Number.isFinite(parsedLength) || parsedLength <= 0) {
    throw new ImageCompressionError("Invalid upload request.", 400);
  }

  if (parsedLength > maxImageUploadSizeBytes + 1024 * 1024) {
    throw new ImageCompressionError("Image is larger than 20 MB.", 413);
  }
}

export function getImageUploadFile(formData: FormData) {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new ImageCompressionError("Please choose an image to upload.");
  }

  return file;
}

export async function saveAndCompressImage(file: File) {
  validateImageFile(file);
  await cleanupOldImageFiles();
  await mkdir(imageUploadTempDirectory, { recursive: true });
  await mkdir(imageOutputTempDirectory, { recursive: true });

  const inputExtension = normalizeExtension(extname(basename(file.name)));
  const inputName = `${randomUUID()}${inputExtension}`;
  const outputName = `${randomUUID()}${inputExtension}`;
  const inputPath = join(imageUploadTempDirectory, inputName);
  const outputPath = join(imageOutputTempDirectory, outputName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(inputPath, bytes, { flag: "wx" });

  try {
    await compressImage(inputPath, outputPath, inputExtension);
    const outputStats = await stat(outputPath);
    void deleteTempFile(inputPath, imageUploadTempDirectory, "image-upload");
    scheduleImageDeletion(outputPath, imageOutputTempDirectory, "image-output");

    return {
      originalName: basename(file.name),
      outputName,
      downloadUrl: `/api/tools/image-compressor/download/${outputName}`,
      originalSize: file.size,
      compressedSize: outputStats.size,
      percentSaved: calculatePercentSaved(file.size, outputStats.size),
      mimeType: outputContentTypes[inputExtension],
    };
  } catch (error) {
    await deleteTempFile(inputPath, imageUploadTempDirectory, "image-upload");
    await deleteTempFile(outputPath, imageOutputTempDirectory, "image-output");

    if (error instanceof ImageCompressionError) {
      throw error;
    }

    console.error("Image compression failed", error);
    throw new ImageCompressionError("Image compression failed. Please try another image.", 422);
  }
}

export async function getCompressedImageDownload(fileName: string) {
  const safeFileName = validateCompressedImageFileName(fileName);
  const filePath = join(imageOutputTempDirectory, safeFileName);
  const fileStats = await stat(filePath);
  const extension = normalizeExtension(extname(safeFileName));

  if (!fileStats.isFile()) {
    return null;
  }

  return {
    fileName: safeFileName,
    contentType: outputContentTypes[extension],
    size: fileStats.size,
    stream: Readable.toWeb(createReadStream(filePath)) as ReadableStream,
  };
}

export async function cleanupOldImageFiles() {
  await Promise.all([
    cleanupOldTempFiles({
      directory: imageUploadTempDirectory,
      maxAgeMs: imageTempRetentionMs,
      label: "image-upload",
    }),
    cleanupOldTempFiles({
      directory: imageOutputTempDirectory,
      maxAgeMs: imageTempRetentionMs,
      label: "image-output",
    }),
  ]);
}

function validateImageFile(file: File) {
  const extension = normalizeExtension(extname(basename(file.name)));

  if (!allowedMimeTypes.has(file.type)) {
    throw new ImageCompressionError("Only JPG, PNG, and WebP images are allowed.");
  }

  if (!allowedExtensions.has(extension)) {
    throw new ImageCompressionError("File extension must be JPG, JPEG, PNG, or WebP.");
  }

  if (file.size <= 0) {
    throw new ImageCompressionError("The uploaded image is empty.");
  }

  if (file.size > maxImageUploadSizeBytes) {
    throw new ImageCompressionError("Image is larger than 20 MB.", 413);
  }
}

async function compressImage(inputPath: string, outputPath: string, extension: string) {
  const image = sharp(inputPath, { failOn: "error" }).rotate();
  const metadata = await image.metadata();

  if (!metadata.format || !isSupportedFormat(metadata.format)) {
    throw new ImageCompressionError("Unsupported image format.");
  }

  if (extension === ".png") {
    await image.png({ compressionLevel: 9, palette: true }).toFile(outputPath);
    return;
  }

  if (extension === ".webp") {
    await image.webp({ quality: 78, effort: 5 }).toFile(outputPath);
    return;
  }

  await image.jpeg({ quality: 78, mozjpeg: true }).toFile(outputPath);
}

function validateCompressedImageFileName(fileName: string) {
  const safeFileName = basename(fileName);
  const fileNamePattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$/i;

  if (safeFileName !== fileName || !fileNamePattern.test(safeFileName)) {
    throw new ImageCompressionError("Invalid download file.", 400);
  }

  return safeFileName;
}

function normalizeExtension(extension: string) {
  return extension.toLowerCase() === ".jpeg" ? ".jpg" : extension.toLowerCase();
}

function isSupportedFormat(format: keyof FormatEnum | string) {
  return ["jpeg", "png", "webp"].includes(format);
}

function calculatePercentSaved(originalSize: number, compressedSize: number) {
  if (originalSize <= 0 || compressedSize >= originalSize) {
    return 0;
  }

  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}

function scheduleImageDeletion(filePath: string, directory: string, label: string) {
  const timeout = setTimeout(() => {
    deleteTempFile(filePath, directory, label).catch((error) => {
      console.error(`[cleanup:${label}] Failed to delete temp file`, error);
    });
  }, imageTempRetentionMs);

  timeout.unref();
}
