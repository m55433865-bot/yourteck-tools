import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { tmpdir } from "node:os";
import { Readable } from "node:stream";
import sharp from "sharp";
import { cleanupOldTempFiles, deleteTempFile } from "@/lib/server/temp-cleanup";

export const maxJpgUploadSizeBytes = 20 * 1024 * 1024;
export const jpgToPngTempRetentionMs = 10 * 60 * 1000;
export const jpgToPngUploadTempDirectory = join(
  tmpdir(),
  "yourteck-tools",
  "uploads",
  "jpg-to-png",
);
export const jpgToPngOutputTempDirectory = join(
  tmpdir(),
  "yourteck-tools",
  "outputs",
  "jpg-to-png",
);

export class JpgToPngError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "JpgToPngError";
    this.status = status;
  }
}

export function validateJpgRequestContentLength(request: Request) {
  const contentLength = request.headers.get("content-length");

  if (!contentLength) {
    return;
  }

  const parsedLength = Number(contentLength);

  if (!Number.isFinite(parsedLength) || parsedLength <= 0) {
    throw new JpgToPngError("Invalid upload request.", 400);
  }

  if (parsedLength > maxJpgUploadSizeBytes + 1024 * 1024) {
    throw new JpgToPngError("JPG is larger than 20 MB.", 413);
  }
}

export function getJpgUploadFile(formData: FormData) {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new JpgToPngError("Please choose a JPG or JPEG file to upload.");
  }

  return file;
}

export async function saveAndConvertJpgToPng(file: File) {
  validateJpgFile(file);
  await cleanupOldJpgToPngFiles();
  await mkdir(jpgToPngUploadTempDirectory, { recursive: true });
  await mkdir(jpgToPngOutputTempDirectory, { recursive: true });

  const inputName = `${randomUUID()}${getJpgExtension(file.name)}`;
  const outputName = `${randomUUID()}.png`;
  const inputPath = join(jpgToPngUploadTempDirectory, inputName);
  const outputPath = join(jpgToPngOutputTempDirectory, outputName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(inputPath, bytes, { flag: "wx" });

  try {
    const image = sharp(inputPath, { failOn: "error" }).rotate();
    const metadata = await image.metadata();

    if (metadata.format !== "jpeg") {
      throw new JpgToPngError("The uploaded file is not a valid JPG image.");
    }

    await image.png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(outputPath);

    const outputStats = await stat(outputPath);
    void deleteTempFile(inputPath, jpgToPngUploadTempDirectory, "jpg-upload");
    scheduleJpgToPngDeletion(outputPath, jpgToPngOutputTempDirectory, "png-output");

    return {
      originalName: basename(file.name),
      outputName,
      downloadUrl: `/api/tools/jpg-to-png/download/${outputName}`,
      originalSize: file.size,
      convertedSize: outputStats.size,
    };
  } catch (error) {
    await deleteTempFile(inputPath, jpgToPngUploadTempDirectory, "jpg-upload");
    await deleteTempFile(outputPath, jpgToPngOutputTempDirectory, "png-output");

    if (error instanceof JpgToPngError) {
      throw error;
    }

    console.error("JPG to PNG conversion failed", error);
    throw new JpgToPngError("JPG to PNG conversion failed. Please try another image.", 422);
  }
}

export async function getPngDownload(fileName: string) {
  const safeFileName = validatePngFileName(fileName);
  const filePath = join(jpgToPngOutputTempDirectory, safeFileName);
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

export async function cleanupOldJpgToPngFiles() {
  await Promise.all([
    cleanupOldTempFiles({
      directory: jpgToPngUploadTempDirectory,
      maxAgeMs: jpgToPngTempRetentionMs,
      label: "jpg-upload",
    }),
    cleanupOldTempFiles({
      directory: jpgToPngOutputTempDirectory,
      maxAgeMs: jpgToPngTempRetentionMs,
      label: "png-output",
    }),
  ]);
}

function validateJpgFile(file: File) {
  const extension = getJpgExtension(file.name);

  if (file.type !== "image/jpeg") {
    throw new JpgToPngError("Only JPG and JPEG images are allowed.");
  }

  if (extension !== ".jpg" && extension !== ".jpeg") {
    throw new JpgToPngError("File extension must be .jpg or .jpeg.");
  }

  if (file.size <= 0) {
    throw new JpgToPngError("The uploaded JPG is empty.");
  }

  if (file.size > maxJpgUploadSizeBytes) {
    throw new JpgToPngError("JPG is larger than 20 MB.", 413);
  }
}

function getJpgExtension(fileName: string) {
  return extname(basename(fileName)).toLowerCase();
}

function validatePngFileName(fileName: string) {
  const safeFileName = basename(fileName);
  const fileNamePattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.png$/i;

  if (safeFileName !== fileName || !fileNamePattern.test(safeFileName)) {
    throw new JpgToPngError("Invalid download file.", 400);
  }

  return safeFileName;
}

function scheduleJpgToPngDeletion(filePath: string, directory: string, label: string) {
  const timeout = setTimeout(() => {
    deleteTempFile(filePath, directory, label).catch((error) => {
      console.error(`[cleanup:${label}] Failed to delete temp file`, error);
    });
  }, jpgToPngTempRetentionMs);

  timeout.unref();
}
