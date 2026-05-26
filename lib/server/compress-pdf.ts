import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";
import { Readable } from "node:stream";
import { PDFDocument } from "pdf-lib";
import { cleanupOldTempFiles, deleteTempFile } from "@/lib/server/temp-cleanup";

export const maxCompressPdfSizeBytes = 100 * 1024 * 1024;
export const compressPdfTempRetentionMs = 10 * 60 * 1000;
export const compressPdfOutputTempDirectory = join(
  tmpdir(),
  "yourteck-tools",
  "outputs",
  "compress-pdf",
);

type CompressionLevel = "low" | "recommended" | "high";

const compressionLabels: Record<CompressionLevel, string> = {
  low: "Low compression",
  recommended: "Recommended",
  high: "High compression",
};

export class CompressPdfError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CompressPdfError";
    this.status = status;
  }
}

export function validateCompressPdfContentLength(request: Request) {
  const contentLength = request.headers.get("content-length");

  if (!contentLength) {
    return;
  }

  const parsedLength = Number(contentLength);

  if (!Number.isFinite(parsedLength) || parsedLength <= 0) {
    throw new CompressPdfError("Invalid upload request.", 400);
  }

  if (parsedLength > maxCompressPdfSizeBytes + 1024 * 1024) {
    throw new CompressPdfError("PDF upload is larger than 100 MB.", 413);
  }
}

export function getCompressPdfUpload(formData: FormData) {
  const file = formData.get("file");
  const level = formData.get("level");

  if (!(file instanceof File)) {
    throw new CompressPdfError("Please choose one PDF file.");
  }

  if (level !== "low" && level !== "recommended" && level !== "high") {
    throw new CompressPdfError("Choose a valid compression level.");
  }

  const compressionLevel: CompressionLevel = level;

  return {
    file,
    level: compressionLevel,
  };
}

export async function compressPdfFile({
  file,
  level,
}: {
  file: File;
  level: CompressionLevel;
}) {
  validatePdfFile(file);
  await cleanupOldCompressedPdfFiles();
  await mkdir(compressPdfOutputTempDirectory, { recursive: true });

  try {
    const originalBytes = Buffer.from(await file.arrayBuffer());
    const sourcePdf = await PDFDocument.load(originalBytes, {
      ignoreEncryption: false,
      updateMetadata: false,
    });
    const pageCount = sourcePdf.getPageCount();

    if (pageCount === 0) {
      throw new CompressPdfError("Uploaded PDF does not contain pages.");
    }

    const compressedBytes = await optimizePdf(sourcePdf, level);
    const outputBytes =
      compressedBytes.byteLength < originalBytes.byteLength
        ? Buffer.from(compressedBytes)
        : originalBytes;
    const outputName = `${randomUUID()}.pdf`;
    const outputPath = join(compressPdfOutputTempDirectory, outputName);

    await writeFile(outputPath, outputBytes, { flag: "wx" });
    scheduleCompressedPdfDeletion(
      outputPath,
      compressPdfOutputTempDirectory,
      "compress-pdf-output",
    );

    return {
      outputName,
      downloadUrl: `/api/tools/compress-pdf/download/${outputName}`,
      originalSize: originalBytes.byteLength,
      compressedSize: outputBytes.byteLength,
      reductionPercent: calculateReductionPercent(
        originalBytes.byteLength,
        outputBytes.byteLength,
      ),
      pageCount,
      level,
      levelLabel: compressionLabels[level],
    };
  } catch (error) {
    if (error instanceof CompressPdfError) {
      throw error;
    }

    console.error("PDF compression failed", error);
    throw new CompressPdfError(
      "PDF compression failed. Please check that the file is a valid, unlocked PDF.",
      422,
    );
  }
}

export async function getCompressedPdfDownload(fileName: string) {
  const safeFileName = validateCompressedPdfFileName(fileName);
  const filePath = join(compressPdfOutputTempDirectory, safeFileName);
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

export async function cleanupOldCompressedPdfFiles() {
  await cleanupOldTempFiles({
    directory: compressPdfOutputTempDirectory,
    maxAgeMs: compressPdfTempRetentionMs,
    label: "compress-pdf-output",
  });
}

async function optimizePdf(sourcePdf: PDFDocument, level: CompressionLevel) {
  const optimizedPdf = await PDFDocument.create();
  const copiedPages = await optimizedPdf.copyPages(
    sourcePdf,
    sourcePdf.getPageIndices(),
  );

  copiedPages.forEach((page) => optimizedPdf.addPage(page));

  if (level !== "low") {
    optimizedPdf.setProducer("YourTeck Tools");
    optimizedPdf.setCreator("YourTeck Tools");
  }

  if (level === "high") {
    optimizedPdf.setTitle("");
    optimizedPdf.setSubject("");
    optimizedPdf.setKeywords([]);
  }

  return optimizedPdf.save({
    addDefaultPage: false,
    objectsPerTick: level === "high" ? 100 : 50,
    updateFieldAppearances: false,
    useObjectStreams: level !== "low",
  });
}

function validatePdfFile(file: File) {
  const extension = extname(basename(file.name)).toLowerCase();

  if (file.type !== "application/pdf") {
    throw new CompressPdfError("Only PDF files are allowed.");
  }

  if (extension !== ".pdf") {
    throw new CompressPdfError("File extension must be .pdf.");
  }

  if (file.size <= 0) {
    throw new CompressPdfError("The selected PDF is empty.");
  }

  if (file.size > maxCompressPdfSizeBytes) {
    throw new CompressPdfError("PDF upload is larger than 100 MB.", 413);
  }
}

function calculateReductionPercent(originalSize: number, compressedSize: number) {
  if (!originalSize || compressedSize >= originalSize) {
    return 0;
  }

  return Number((((originalSize - compressedSize) / originalSize) * 100).toFixed(1));
}

function validateCompressedPdfFileName(fileName: string) {
  const safeFileName = basename(fileName);
  const fileNamePattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.pdf$/i;

  if (safeFileName !== fileName || !fileNamePattern.test(safeFileName)) {
    throw new CompressPdfError("Invalid download file.", 400);
  }

  return safeFileName;
}

function scheduleCompressedPdfDeletion(
  filePath: string,
  directory: string,
  label: string,
) {
  const timeout = setTimeout(() => {
    deleteTempFile(filePath, directory, label).catch((error) => {
      console.error(`[cleanup:${label}] Failed to delete temp file`, error);
    });
  }, compressPdfTempRetentionMs);

  timeout.unref();
}
