import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { tmpdir } from "node:os";
import { Readable } from "node:stream";
import ffmpeg from "fluent-ffmpeg";
import { cleanupOldTempFiles, deleteTempFile } from "@/lib/server/temp-cleanup";

export const maxUploadSizeBytes = 200 * 1024 * 1024;
export const converterTempRetentionMs = 10 * 60 * 1000;
export const uploadRetentionMs = converterTempRetentionMs;
export const outputRetentionMs = converterTempRetentionMs;
export const uploadTempDirectory = join(
  tmpdir(),
  "yourteck-tools",
  "uploads",
  "mp4-to-mp3",
);
export const outputTempDirectory = join(
  tmpdir(),
  "yourteck-tools",
  "outputs",
  "mp4-to-mp3",
);

const allowedMimeTypes = new Set(["video/mp4"]);
const allowedExtensions = new Set([".mp4"]);

export class UploadValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "UploadValidationError";
    this.status = status;
  }
}

export class ConversionError extends Error {
  status: number;

  constructor(message = "MP4 to MP3 conversion failed.", status = 422) {
    super(message);
    this.name = "ConversionError";
    this.status = status;
  }
}

export function validateRequestContentLength(request: Request) {
  const contentLength = request.headers.get("content-length");

  if (!contentLength) {
    return;
  }

  const parsedLength = Number(contentLength);

  if (!Number.isFinite(parsedLength) || parsedLength <= 0) {
    throw new UploadValidationError("Invalid upload request.", 400);
  }

  if (parsedLength > maxUploadSizeBytes + 1024 * 1024) {
    throw new UploadValidationError("File is larger than 200 MB.", 413);
  }
}

export function getUploadFile(formData: FormData) {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new UploadValidationError("Please choose an MP4 file to upload.");
  }

  return file;
}

export function validateMp4File(file: File) {
  const extension = extname(basename(file.name)).toLowerCase();

  if (!allowedMimeTypes.has(file.type)) {
    throw new UploadValidationError("Only MP4 video files are allowed.");
  }

  if (!allowedExtensions.has(extension)) {
    throw new UploadValidationError("File extension must be .mp4.");
  }

  if (file.size <= 0) {
    throw new UploadValidationError("The uploaded file is empty.");
  }

  if (file.size > maxUploadSizeBytes) {
    throw new UploadValidationError("File is larger than 200 MB.", 413);
  }
}

export async function saveTemporaryUpload(file: File) {
  validateMp4File(file);

  await mkdir(uploadTempDirectory, { recursive: true });

  const safeFileName = `${randomUUID()}.mp4`;
  const destination = join(uploadTempDirectory, safeFileName);
  const bytes = Buffer.from(await file.arrayBuffer());

  if (!looksLikeMp4(bytes)) {
    throw new UploadValidationError("The uploaded file is not a valid MP4 file.");
  }

  await writeFile(destination, bytes, { flag: "wx" });
  scheduleTemporaryDeletion(destination, uploadTempDirectory, "mp4-upload");

  return {
    originalName: basename(file.name),
    storedName: safeFileName,
    path: destination,
    size: file.size,
    mimeType: file.type,
  };
}

export async function convertMp4ToMp3(inputPath: string) {
  await mkdir(outputTempDirectory, { recursive: true });

  const safeFileName = `${randomUUID()}.mp3`;
  const outputPath = join(outputTempDirectory, safeFileName);
  const ffmpegPath = process.env.FFMPEG_PATH;

  if (ffmpegPath && ffmpeg.setFfmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
  }

  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .noVideo()
        .audioCodec("libmp3lame")
        .audioBitrate("192k")
        .format("mp3")
        .output(outputPath)
        .on("end", resolve)
        .on("error", (error) => reject(toConversionError(error)))
        .run();
    });
  } catch (error) {
    await deleteTemporaryFile(outputPath, outputTempDirectory, "mp3-output");

    if (error instanceof ConversionError) {
      throw error;
    }

    throw new ConversionError();
  }

  scheduleTemporaryDeletion(outputPath, outputTempDirectory, "mp3-output", outputRetentionMs);

  return {
    storedName: safeFileName,
  };
}

function toConversionError(error: Error) {
  const message = error.message.toLowerCase();

  if (
    message.includes("cannot find ffmpeg") ||
    message.includes("ffmpeg was not found") ||
    message.includes("spawn ffmpeg enoent")
  ) {
    return new ConversionError(
      "FFmpeg was not found. Make sure ffmpeg is installed and available on PATH.",
      500,
    );
  }

  console.error("FFmpeg conversion error", error.message);

  return new ConversionError(
    "Conversion failed. Please try another valid MP4 file.",
  );
}

export async function getTemporaryMp3Download(fileName: string) {
  const safeFileName = validateTemporaryMp3FileName(fileName);
  const filePath = join(outputTempDirectory, safeFileName);
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

export function validateTemporaryMp3FileName(fileName: string) {
  const safeFileName = basename(fileName);
  const fileNamePattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.mp3$/i;

  if (safeFileName !== fileName || !fileNamePattern.test(safeFileName)) {
    throw new UploadValidationError("Invalid download file.", 400);
  }

  return safeFileName;
}

export async function deleteTemporaryFile(
  filePath: string,
  directory = uploadTempDirectory,
  label = "converter",
) {
  await deleteTempFile(filePath, directory, label);
}

export async function cleanupOldTemporaryFiles() {
  await Promise.all([
    cleanupOldTempFiles({
      directory: uploadTempDirectory,
      maxAgeMs: uploadRetentionMs,
      label: "mp4-upload",
    }),
    cleanupOldTempFiles({
      directory: outputTempDirectory,
      maxAgeMs: outputRetentionMs,
      label: "mp3-output",
    }),
  ]);
}

export async function cleanupOldTemporaryUploads(maxAgeMs = uploadRetentionMs) {
  await cleanupOldTempFiles({
    directory: uploadTempDirectory,
    maxAgeMs,
    label: "mp4-upload",
  });
}

function looksLikeMp4(bytes: Buffer) {
  if (bytes.length < 12) {
    return false;
  }

  return bytes.toString("ascii", 4, 8) === "ftyp";
}

function scheduleTemporaryDeletion(
  filePath: string,
  directory: string,
  label: string,
  retentionMs = uploadRetentionMs,
) {
  const timeout = setTimeout(() => {
    deleteTempFile(filePath, directory, label).catch((error) => {
      console.error(`[cleanup:${label}] Failed to delete temp file`, error);
    });
  }, retentionMs);

  timeout.unref();
}
