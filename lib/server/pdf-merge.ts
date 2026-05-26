import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { tmpdir } from "node:os";
import { Readable } from "node:stream";
import { PDFDocument } from "pdf-lib";
import { cleanupOldTempFiles, deleteTempFile } from "@/lib/server/temp-cleanup";

export const maxPdfMergeTotalSizeBytes = 100 * 1024 * 1024;
export const pdfMergeTempRetentionMs = 10 * 60 * 1000;
export const pdfMergeOutputTempDirectory = join(
  tmpdir(),
  "yourteck-tools",
  "outputs",
  "pdf-merge",
);

export class PdfMergeError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "PdfMergeError";
    this.status = status;
  }
}

export function validatePdfMergeContentLength(request: Request) {
  const contentLength = request.headers.get("content-length");

  if (!contentLength) {
    return;
  }

  const parsedLength = Number(contentLength);

  if (!Number.isFinite(parsedLength) || parsedLength <= 0) {
    throw new PdfMergeError("Invalid upload request.", 400);
  }

  if (parsedLength > maxPdfMergeTotalSizeBytes + 2 * 1024 * 1024) {
    throw new PdfMergeError("PDF uploads are larger than 100 MB total.", 413);
  }
}

export function getPdfUploadFiles(formData: FormData) {
  const files = formData.getAll("files");

  if (files.length < 2) {
    throw new PdfMergeError("Please upload at least two PDF files.");
  }

  if (!files.every((file) => file instanceof File)) {
    throw new PdfMergeError("Invalid upload request.");
  }

  return files as File[];
}

export async function mergePdfFiles(files: File[]) {
  validatePdfFiles(files);
  await cleanupOldPdfMergeFiles();
  await mkdir(pdfMergeOutputTempDirectory, { recursive: true });

  const mergedPdf = await PDFDocument.create();

  try {
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(bytes, {
        ignoreEncryption: false,
        updateMetadata: false,
      });
      const copiedPages = await mergedPdf.copyPages(
        sourcePdf,
        sourcePdf.getPageIndices(),
      );

      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    if (mergedPdf.getPageCount() === 0) {
      throw new PdfMergeError("Uploaded PDFs do not contain pages.");
    }

    const outputName = `${randomUUID()}.pdf`;
    const outputPath = join(pdfMergeOutputTempDirectory, outputName);
    const mergedBytes = await mergedPdf.save({
      addDefaultPage: false,
      updateFieldAppearances: false,
    });

    await writeFile(outputPath, mergedBytes, { flag: "wx" });
    schedulePdfMergeDeletion(outputPath, pdfMergeOutputTempDirectory, "pdf-merge-output");

    return {
      outputName,
      downloadUrl: `/api/tools/pdf-merge/download/${outputName}`,
      fileCount: files.length,
      totalSize: getTotalSize(files),
      mergedSize: mergedBytes.byteLength,
      pageCount: mergedPdf.getPageCount(),
    };
  } catch (error) {
    if (error instanceof PdfMergeError) {
      throw error;
    }

    console.error("PDF merge failed", error);
    throw new PdfMergeError(
      "PDF merge failed. Please check that the files are valid, unlocked PDFs.",
      422,
    );
  }
}

export async function getMergedPdfDownload(fileName: string) {
  const safeFileName = validatePdfFileName(fileName);
  const filePath = join(pdfMergeOutputTempDirectory, safeFileName);
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

export async function cleanupOldPdfMergeFiles() {
  await cleanupOldTempFiles({
    directory: pdfMergeOutputTempDirectory,
    maxAgeMs: pdfMergeTempRetentionMs,
    label: "pdf-merge-output",
  });
}

function validatePdfFiles(files: File[]) {
  if (files.length < 2) {
    throw new PdfMergeError("Please upload at least two PDF files.");
  }

  const totalSize = getTotalSize(files);

  if (totalSize > maxPdfMergeTotalSizeBytes) {
    throw new PdfMergeError("PDF uploads are larger than 100 MB total.", 413);
  }

  files.forEach((file) => {
    const extension = extname(basename(file.name)).toLowerCase();

    if (file.type !== "application/pdf") {
      throw new PdfMergeError("Only PDF files are allowed.");
    }

    if (extension !== ".pdf") {
      throw new PdfMergeError("File extension must be .pdf.");
    }

    if (file.size <= 0) {
      throw new PdfMergeError("One of the selected PDFs is empty.");
    }
  });
}

function getTotalSize(files: File[]) {
  return files.reduce((total, file) => total + file.size, 0);
}

function validatePdfFileName(fileName: string) {
  const safeFileName = basename(fileName);
  const fileNamePattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.pdf$/i;

  if (safeFileName !== fileName || !fileNamePattern.test(safeFileName)) {
    throw new PdfMergeError("Invalid download file.", 400);
  }

  return safeFileName;
}

function schedulePdfMergeDeletion(filePath: string, directory: string, label: string) {
  const timeout = setTimeout(() => {
    deleteTempFile(filePath, directory, label).catch((error) => {
      console.error(`[cleanup:${label}] Failed to delete temp file`, error);
    });
  }, pdfMergeTempRetentionMs);

  timeout.unref();
}
