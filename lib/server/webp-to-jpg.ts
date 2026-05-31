import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";
import { Readable } from "node:stream";
import sharp from "sharp";
import { cleanupOldTempFiles, deleteTempFile } from "@/lib/server/temp-cleanup";

export const maxWebpToJpgUploadSizeBytes = 25 * 1024 * 1024;
export const webpToJpgTempRetentionMs = 10 * 60 * 1000;
export const webpToJpgUploadTempDirectory = join(
  tmpdir(),
  "yourteck-tools",
  "uploads",
  "webp-to-jpg",
);
export const webpToJpgOutputTempDirectory = join(
  tmpdir(),
  "yourteck-tools",
  "outputs",
  "webp-to-jpg",
);

export class WebpToJpgError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "WebpToJpgError";
    this.status = status;
  }
}

export function validateWebpToJpgRequestContentLength(request: Request) {
  const contentLength = request.headers.get("content-length");

  if (!contentLength) {
    return;
  }

  const parsedLength = Number(contentLength);

  if (!Number.isFinite(parsedLength) || parsedLength <= 0) {
    throw new WebpToJpgError("Invalid upload request.", 400);
  }

  if (parsedLength > maxWebpToJpgUploadSizeBytes + 1024 * 1024) {
    throw new WebpToJpgError("WEBP is larger than 25 MB.", 413);
  }
}

export function getWebpToJpgUploadFile(formData: FormData) {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new WebpToJpgError("Please choose a WEBP file to upload.");
  }

  return file;
}

export async function saveAndConvertWebpToJpg(file: File) {
  validateWebpFile(file);
  await cleanupOldWebpToJpgFiles();
  await mkdir(webpToJpgUploadTempDirectory, { recursive: true });
  await mkdir(webpToJpgOutputTempDirectory, { recursive: true });

  const inputName = `${randomUUID()}.webp`;
  const outputName = `${randomUUID()}.jpg`;
  const inputPath = join(webpToJpgUploadTempDirectory, inputName);
  const outputPath = join(webpToJpgOutputTempDirectory, outputName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(inputPath, bytes, { flag: "wx" });

  try {
    const image = sharp(inputPath, { failOn: "error" }).rotate();
    const metadata = await image.metadata();

    if (metadata.format !== "webp") {
      throw new WebpToJpgError("The uploaded file is not a valid WEBP image.");
    }

    await image
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(outputPath);

    const outputStats = await stat(outputPath);
    void deleteTempFile(inputPath, webpToJpgUploadTempDirectory, "webp-upload");
    scheduleWebpToJpgDeletion(outputPath, webpToJpgOutputTempDirectory, "jpg-output");

    return {
      originalName: basename(file.name),
      outputName,
      downloadUrl: `/api/tools/webp-to-jpg/download/${outputName}`,
      originalSize: file.size,
      convertedSize: outputStats.size,
    };
  } catch (error) {
    await deleteTempFile(inputPath, webpToJpgUploadTempDirectory, "webp-upload");
    await deleteTempFile(outputPath, webpToJpgOutputTempDirectory, "jpg-output");

    if (error instanceof WebpToJpgError) {
      throw error;
    }

    console.error("WEBP to JPG conversion failed", error);
    throw new WebpToJpgError(
      "WEBP to JPG conversion failed. Please try another image.",
      422,
    );
  }
}

export async function getConvertedJpgDownload(fileName: string) {
  const safeFileName = validateJpgFileName(fileName);
  const filePath = join(webpToJpgOutputTempDirectory, safeFileName);
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

export async function cleanupOldWebpToJpgFiles() {
  await Promise.all([
    cleanupOldTempFiles({
      directory: webpToJpgUploadTempDirectory,
      maxAgeMs: webpToJpgTempRetentionMs,
      label: "webp-upload",
    }),
    cleanupOldTempFiles({
      directory: webpToJpgOutputTempDirectory,
      maxAgeMs: webpToJpgTempRetentionMs,
      label: "jpg-output",
    }),
  ]);
}

function validateWebpFile(file: File) {
  const extension = extname(basename(file.name)).toLowerCase();

  if (file.type !== "image/webp") {
    throw new WebpToJpgError("Only WEBP images are allowed.");
  }

  if (extension !== ".webp") {
    throw new WebpToJpgError("File extension must be .webp.");
  }

  if (file.size <= 0) {
    throw new WebpToJpgError("The uploaded WEBP is empty.");
  }

  if (file.size > maxWebpToJpgUploadSizeBytes) {
    throw new WebpToJpgError("WEBP is larger than 25 MB.", 413);
  }
}

function validateJpgFileName(fileName: string) {
  const safeFileName = basename(fileName);
  const fileNamePattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.jpg$/i;

  if (safeFileName !== fileName || !fileNamePattern.test(safeFileName)) {
    throw new WebpToJpgError("Invalid download file.", 400);
  }

  return safeFileName;
}

function scheduleWebpToJpgDeletion(
  filePath: string,
  directory: string,
  label: string,
) {
  const timeout = setTimeout(() => {
    deleteTempFile(filePath, directory, label).catch((error) => {
      console.error(`[cleanup:${label}] Failed to delete temp file`, error);
    });
  }, webpToJpgTempRetentionMs);

  timeout.unref();
}
