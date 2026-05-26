import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";
import { Readable } from "node:stream";
import { PDFDocument } from "pdf-lib";
import { cleanupOldTempFiles, deleteTempFile } from "@/lib/server/temp-cleanup";

export const maxPdfSplitSizeBytes = 100 * 1024 * 1024;
export const pdfSplitTempRetentionMs = 10 * 60 * 1000;
export const pdfSplitOutputTempDirectory = join(
  tmpdir(),
  "yourteck-tools",
  "outputs",
  "pdf-split",
);

type SplitMode = "every-page" | "selected-pages";

type ZipEntry = {
  name: string;
  bytes: Uint8Array;
};

export class PdfSplitError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "PdfSplitError";
    this.status = status;
  }
}

export function validatePdfSplitContentLength(request: Request) {
  const contentLength = request.headers.get("content-length");

  if (!contentLength) {
    return;
  }

  const parsedLength = Number(contentLength);

  if (!Number.isFinite(parsedLength) || parsedLength <= 0) {
    throw new PdfSplitError("Invalid upload request.", 400);
  }

  if (parsedLength > maxPdfSplitSizeBytes + 1024 * 1024) {
    throw new PdfSplitError("PDF upload is larger than 100 MB.", 413);
  }
}

export function getPdfSplitUpload(formData: FormData) {
  const file = formData.get("file");
  const mode = formData.get("mode");
  const pages = formData.get("pages");

  if (!(file instanceof File)) {
    throw new PdfSplitError("Please choose one PDF file.");
  }

  if (mode !== "every-page" && mode !== "selected-pages") {
    throw new PdfSplitError("Choose a valid split option.");
  }

  const splitMode: SplitMode = mode;

  return {
    file,
    mode: splitMode,
    pages: typeof pages === "string" ? pages : "",
  };
}

export async function splitPdfFile({
  file,
  mode,
  pages,
}: {
  file: File;
  mode: SplitMode;
  pages: string;
}) {
  validatePdfFile(file);
  await cleanupOldPdfSplitFiles();
  await mkdir(pdfSplitOutputTempDirectory, { recursive: true });

  try {
    const sourcePdf = await PDFDocument.load(await file.arrayBuffer(), {
      ignoreEncryption: false,
      updateMetadata: false,
    });
    const pageCount = sourcePdf.getPageCount();

    if (pageCount === 0) {
      throw new PdfSplitError("Uploaded PDF does not contain pages.");
    }

    const pageNumbers =
      mode === "every-page"
        ? Array.from({ length: pageCount }, (_value, index) => index + 1)
        : parsePageSelection(pages, pageCount);
    const outputEntries =
      mode === "every-page"
        ? await createSinglePagePdfs(sourcePdf, pageNumbers)
        : [await createSelectedPagesPdf(sourcePdf, pageNumbers)];
    const zipBytes = createStoredZip(outputEntries);
    const outputName = `${randomUUID()}.zip`;
    const outputPath = join(pdfSplitOutputTempDirectory, outputName);

    await writeFile(outputPath, zipBytes, { flag: "wx" });
    schedulePdfSplitDeletion(outputPath, pdfSplitOutputTempDirectory, "pdf-split-output");

    return {
      outputName,
      downloadUrl: `/api/tools/pdf-split/download/${outputName}`,
      originalSize: file.size,
      zipSize: zipBytes.byteLength,
      pageCount,
      outputCount: outputEntries.length,
      selectedPages: pageNumbers.length,
    };
  } catch (error) {
    if (error instanceof PdfSplitError) {
      throw error;
    }

    console.error("PDF split failed", error);
    throw new PdfSplitError(
      "PDF split failed. Please check that the file is a valid, unlocked PDF.",
      422,
    );
  }
}

export async function getSplitPdfZipDownload(fileName: string) {
  const safeFileName = validatePdfSplitZipFileName(fileName);
  const filePath = join(pdfSplitOutputTempDirectory, safeFileName);
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

export async function cleanupOldPdfSplitFiles() {
  await cleanupOldTempFiles({
    directory: pdfSplitOutputTempDirectory,
    maxAgeMs: pdfSplitTempRetentionMs,
    label: "pdf-split-output",
  });
}

function validatePdfFile(file: File) {
  const extension = extname(basename(file.name)).toLowerCase();

  if (file.type !== "application/pdf") {
    throw new PdfSplitError("Only PDF files are allowed.");
  }

  if (extension !== ".pdf") {
    throw new PdfSplitError("File extension must be .pdf.");
  }

  if (file.size <= 0) {
    throw new PdfSplitError("The selected PDF is empty.");
  }

  if (file.size > maxPdfSplitSizeBytes) {
    throw new PdfSplitError("PDF upload is larger than 100 MB.", 413);
  }
}

function parsePageSelection(selection: string, pageCount: number) {
  const trimmedSelection = selection.trim();

  if (!trimmedSelection) {
    throw new PdfSplitError("Enter the pages you want to extract, like 1,3,5-8.");
  }

  const pageNumbers: number[] = [];

  for (const part of trimmedSelection.split(",")) {
    const trimmedPart = part.trim();

    if (!trimmedPart) {
      throw new PdfSplitError("Page ranges cannot be empty.");
    }

    if (trimmedPart.includes("-")) {
      const [startText, endText, extra] = trimmedPart.split("-");
      const start = Number(startText);
      const end = Number(endText);

      if (extra !== undefined || !isValidPageNumber(start) || !isValidPageNumber(end)) {
        throw new PdfSplitError("Use page numbers and ranges like 1,3,5-8.");
      }

      if (start > end) {
        throw new PdfSplitError("Page ranges must go from low to high.");
      }

      for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
        pageNumbers.push(pageNumber);
      }
    } else {
      const pageNumber = Number(trimmedPart);

      if (!isValidPageNumber(pageNumber)) {
        throw new PdfSplitError("Use page numbers and ranges like 1,3,5-8.");
      }

      pageNumbers.push(pageNumber);
    }
  }

  const uniquePageNumbers = Array.from(new Set(pageNumbers));
  const invalidPageNumber = uniquePageNumbers.find(
    (pageNumber) => pageNumber < 1 || pageNumber > pageCount,
  );

  if (invalidPageNumber) {
    throw new PdfSplitError(`Page ${invalidPageNumber} is outside this PDF.`);
  }

  return uniquePageNumbers;
}

function isValidPageNumber(value: number) {
  return Number.isInteger(value) && value > 0;
}

async function createSinglePagePdfs(sourcePdf: PDFDocument, pageNumbers: number[]) {
  const entries: ZipEntry[] = [];
  const width = String(pageNumbers.length).length;

  for (const pageNumber of pageNumbers) {
    const splitPdf = await PDFDocument.create();
    const [page] = await splitPdf.copyPages(sourcePdf, [pageNumber - 1]);
    splitPdf.addPage(page);

    entries.push({
      name: `page-${String(pageNumber).padStart(width, "0")}.pdf`,
      bytes: await splitPdf.save({
        addDefaultPage: false,
        updateFieldAppearances: false,
      }),
    });
  }

  return entries;
}

async function createSelectedPagesPdf(sourcePdf: PDFDocument, pageNumbers: number[]) {
  const splitPdf = await PDFDocument.create();
  const copiedPages = await splitPdf.copyPages(
    sourcePdf,
    pageNumbers.map((pageNumber) => pageNumber - 1),
  );

  copiedPages.forEach((page) => splitPdf.addPage(page));

  return {
    name: "selected-pages.pdf",
    bytes: await splitPdf.save({
      addDefaultPage: false,
      updateFieldAppearances: false,
    }),
  };
}

function createStoredZip(entries: ZipEntry[]) {
  const localHeaders: Buffer[] = [];
  const centralHeaders: Buffer[] = [];
  const endDirectorySize = 22;
  let offset = 0;

  for (const entry of entries) {
    const fileName = Buffer.from(entry.name, "utf8");
    const fileBytes = Buffer.from(entry.bytes);
    const crc = crc32(fileBytes);
    const localHeader = Buffer.alloc(30);

    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(fileBytes.length, 18);
    localHeader.writeUInt32LE(fileBytes.length, 22);
    localHeader.writeUInt16LE(fileName.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localHeaders.push(localHeader, fileName, fileBytes);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(fileBytes.length, 20);
    centralHeader.writeUInt32LE(fileBytes.length, 24);
    centralHeader.writeUInt16LE(fileName.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralHeaders.push(centralHeader, fileName);

    offset += localHeader.length + fileName.length + fileBytes.length;
  }

  const centralDirectory = Buffer.concat(centralHeaders);
  const endDirectory = Buffer.alloc(endDirectorySize);

  endDirectory.writeUInt32LE(0x06054b50, 0);
  endDirectory.writeUInt16LE(0, 4);
  endDirectory.writeUInt16LE(0, 6);
  endDirectory.writeUInt16LE(entries.length, 8);
  endDirectory.writeUInt16LE(entries.length, 10);
  endDirectory.writeUInt32LE(centralDirectory.length, 12);
  endDirectory.writeUInt32LE(offset, 16);
  endDirectory.writeUInt16LE(0, 20);

  return Buffer.concat([...localHeaders, centralDirectory, endDirectory]);
}

function crc32(bytes: Buffer) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  }

  return (crc ^ 0xffffffff) >>> 0;
}

const crcTable = Array.from({ length: 256 }, (_value, index) => {
  let crc = index;

  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }

  return crc >>> 0;
});

function validatePdfSplitZipFileName(fileName: string) {
  const safeFileName = basename(fileName);
  const fileNamePattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.zip$/i;

  if (safeFileName !== fileName || !fileNamePattern.test(safeFileName)) {
    throw new PdfSplitError("Invalid download file.", 400);
  }

  return safeFileName;
}

function schedulePdfSplitDeletion(filePath: string, directory: string, label: string) {
  const timeout = setTimeout(() => {
    deleteTempFile(filePath, directory, label).catch((error) => {
      console.error(`[cleanup:${label}] Failed to delete temp file`, error);
    });
  }, pdfSplitTempRetentionMs);

  timeout.unref();
}
