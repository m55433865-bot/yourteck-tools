import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { tmpdir } from "node:os";
import { Readable } from "node:stream";
import sharp from "sharp";
import { cleanupOldTempFiles, deleteTempFile } from "@/lib/server/temp-cleanup";

export const maxPngUploadSizeBytes = 20 * 1024 * 1024;
export const pngToJpgTempRetentionMs = 10 * 60 * 1000;
export const pngToJpgUploadTempDirectory = join(
  tmpdir(),
  "yourteck-tools",
  "uploads",
  "png-to-jpg",
);
export const pngToJpgOutputTempDirectory = join(
  tmpdir(),
  "yourteck-tools",
  "outputs",
  "png-to-jpg",
);

export class PngToJpgError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "PngToJpgError";
    this.status = status;
  }
}

export function validatePngRequestContentLength(request: Request) {
  const contentLength = request.headers.get("content-length");

  if (!contentLength) {
    return;
  }

  const parsedLength = Number(contentLength);

  if (!Number.isFinite(parsedLength) || parsedLength <= 0) {
    throw new PngToJpgError("Invalid upload request.", 400);
  }

  if (parsedLength > maxPngUploadSizeBytes + 1024 * 1024) {
    throw new PngToJpgError("PNG is larger than 20 MB.", 413);
  }
}

export function getPngUploadFile(formData: FormData) {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new PngToJpgError("Please choose a PNG file to upload.");
  }

  return file;
}

export function getWhiteBackgroundOption(formData: FormData) {
  return formData.get("whiteBackground") === "true";
}

export async function saveAndConvertPngToJpg(file: File, whiteBackground: boolean) {
  validatePngFile(file);
  await cleanupOldPngToJpgFiles();
  await mkdir(pngToJpgUploadTempDirectory, { recursive: true });
  await mkdir(pngToJpgOutputTempDirectory, { recursive: true });

  const inputName = `${randomUUID()}.png`;
  const outputName = `${randomUUID()}.jpg`;
  const inputPath = join(pngToJpgUploadTempDirectory, inputName);
  const outputPath = join(pngToJpgOutputTempDirectory, outputName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(inputPath, bytes, { flag: "wx" });

  try {
    const image = sharp(inputPath, { failOn: "error" }).rotate();
    const metadata = await image.metadata();

    if (metadata.format !== "png") {
      throw new PngToJpgError("The uploaded file is not a valid PNG image.");
    }

    const pipeline = image.flatten({
      background: whiteBackground ? "#ffffff" : "#0f172a",
    });

    await pipeline.jpeg({ quality: 90, mozjpeg: true }).toFile(outputPath);

    const outputStats = await stat(outputPath);
    void deleteTempFile(inputPath, pngToJpgUploadTempDirectory, "png-upload");
    schedulePngToJpgDeletion(outputPath, pngToJpgOutputTempDirectory, "jpg-output");

    return {
      originalName: basename(file.name),
      outputName,
      downloadUrl: `/api/tools/png-to-jpg/download/${outputName}`,
      originalSize: file.size,
      convertedSize: outputStats.size,
      whiteBackground,
    };
  } catch (error) {
    await deleteTempFile(inputPath, pngToJpgUploadTempDirectory, "png-upload");
    await deleteTempFile(outputPath, pngToJpgOutputTempDirectory, "jpg-output");

    if (error instanceof PngToJpgError) {
      throw error;
    }

    console.error("PNG to JPG conversion failed", error);
    throw new PngToJpgError("PNG to JPG conversion failed. Please try another image.", 422);
  }
}

export async function getJpgDownload(fileName: string) {
  const safeFileName = validateJpgFileName(fileName);
  const filePath = join(pngToJpgOutputTempDirectory, safeFileName);
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

export async function cleanupOldPngToJpgFiles() {
  await Promise.all([
    cleanupOldTempFiles({
      directory: pngToJpgUploadTempDirectory,
      maxAgeMs: pngToJpgTempRetentionMs,
      label: "png-upload",
    }),
    cleanupOldTempFiles({
      directory: pngToJpgOutputTempDirectory,
      maxAgeMs: pngToJpgTempRetentionMs,
      label: "jpg-output",
    }),
  ]);
}

function validatePngFile(file: File) {
  const extension = extname(basename(file.name)).toLowerCase();

  if (file.type !== "image/png") {
    throw new PngToJpgError("Only PNG images are allowed.");
  }

  if (extension !== ".png") {
    throw new PngToJpgError("File extension must be .png.");
  }

  if (file.size <= 0) {
    throw new PngToJpgError("The uploaded PNG is empty.");
  }

  if (file.size > maxPngUploadSizeBytes) {
    throw new PngToJpgError("PNG is larger than 20 MB.", 413);
  }
}

function validateJpgFileName(fileName: string) {
  const safeFileName = basename(fileName);
  const fileNamePattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.jpg$/i;

  if (safeFileName !== fileName || !fileNamePattern.test(safeFileName)) {
    throw new PngToJpgError("Invalid download file.", 400);
  }

  return safeFileName;
}

function schedulePngToJpgDeletion(filePath: string, directory: string, label: string) {
  const timeout = setTimeout(() => {
    deleteTempFile(filePath, directory, label).catch((error) => {
      console.error(`[cleanup:${label}] Failed to delete temp file`, error);
    });
  }, pngToJpgTempRetentionMs);

  timeout.unref();
}
