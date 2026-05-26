"use client";

import { DragEvent, useRef, useState } from "react";

const maxPdfSplitSizeMb = 100;
const maxPdfSplitSizeBytes = maxPdfSplitSizeMb * 1024 * 1024;

type SplitMode = "every-page" | "selected-pages";
type SplitStatus = "idle" | "uploading" | "splitting" | "complete" | "error";

type PdfSplitResponse = {
  ok: boolean;
  error?: string;
  pdf?: {
    outputName: string;
    downloadUrl: string;
    originalSize: number;
    zipSize: number;
    pageCount: number;
    outputCount: number;
    selectedPages: number;
  };
};

export function PdfSplitUi() {
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<XMLHttpRequest | null>(null);
  const autoDownloadLinkRef = useRef<HTMLAnchorElement>(null);
  const [file, setFile] = useState<File>();
  const [mode, setMode] = useState<SplitMode>("every-page");
  const [pages, setPages] = useState("");
  const [isDraggingUpload, setIsDraggingUpload] = useState(false);
  const [status, setStatus] = useState<SplitStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<PdfSplitResponse["pdf"]>();

  const isProcessing = status === "uploading" || status === "splitting";
  const canSplit = Boolean(file) && !isProcessing;

  function chooseFile(nextFile?: File) {
    if (!nextFile) {
      return;
    }

    const validationError = validatePdfFile(nextFile);

    if (validationError) {
      showError(validationError);
      return;
    }

    setFile(nextFile);
    setStatus("idle");
    setErrorMessage("");
    setResult(undefined);
    setProgress(0);
  }

  function handleUploadDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingUpload(false);
    chooseFile(event.dataTransfer.files[0]);
  }

  function splitPdf() {
    const validationError = validateReadyToSplit(file, mode, pages);

    if (validationError) {
      showError(validationError);
      return;
    }

    setStatus("uploading");
    setProgress(3);
    setErrorMessage("");
    setResult(undefined);

    const formData = new FormData();
    formData.append("file", file as File);
    formData.append("mode", mode);
    formData.append("pages", pages);

    const request = new XMLHttpRequest();
    requestRef.current = request;

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      const uploadProgress = Math.min(80, Math.round((event.loaded / event.total) * 80));
      setProgress(uploadProgress);
    };

    request.upload.onload = () => {
      setStatus("splitting");
      setProgress((currentProgress) => Math.max(currentProgress, 88));
    };

    request.onreadystatechange = () => {
      if (request.readyState !== XMLHttpRequest.DONE) {
        return;
      }

      requestRef.current = null;

      try {
        const data = JSON.parse(request.responseText || "{}") as PdfSplitResponse;

        if (request.status < 200 || request.status >= 300 || !data.ok || !data.pdf) {
          throw new Error(data.error || "PDF split failed.");
        }

        setStatus("complete");
        setProgress(100);
        setResult(data.pdf);
        window.setTimeout(() => {
          autoDownloadLinkRef.current?.click();
        }, 0);
      } catch (error) {
        showError(error instanceof Error ? error.message : "PDF split failed.");
      }
    };

    request.onerror = () => {
      requestRef.current = null;
      showError("Upload failed. Please check your connection and try again.");
    };

    request.onloadstart = () => {
      setProgress(8);
    };

    request.open("POST", "/api/tools/pdf-split/upload");
    request.send(formData);
  }

  function showError(message: string) {
    requestRef.current?.abort();
    requestRef.current = null;
    setStatus("error");
    setErrorMessage(message);
    setResult(undefined);
    setProgress(0);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDraggingUpload(true);
        }}
        onDragLeave={() => setIsDraggingUpload(false)}
        onDrop={handleUploadDrop}
        className={`flex min-h-56 flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition ${
          isDraggingUpload
            ? "border-cyan-500 bg-cyan-50"
            : "border-slate-300 bg-slate-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(event) => {
            chooseFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <p className="text-xl font-semibold text-slate-950">Drop one PDF here</p>
        <p className="mt-2 text-sm text-slate-600">
          Maximum file size: {maxPdfSplitSizeMb} MB
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isProcessing}
          className="mt-6 h-12 rounded-md bg-cyan-700 px-5 text-sm font-semibold text-white transition enabled:hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Choose PDF
        </button>
      </div>

      {file ? (
        <div className="mt-5 rounded-lg border border-slate-200 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="break-words text-sm font-semibold text-slate-950">
                {file.name}
              </p>
              <p className="mt-1 text-sm text-slate-600">{formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(undefined);
                setResult(undefined);
                setProgress(0);
                setStatus("idle");
                setErrorMessage("");
              }}
              disabled={isProcessing}
              className="h-10 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-950 transition enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-5 rounded-lg border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-950">Split option</p>
        <div className="mt-3 grid gap-3">
          <label className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <input
              type="radio"
              name="pdf-split-mode"
              value="every-page"
              checked={mode === "every-page"}
              disabled={isProcessing}
              onChange={() => setMode("every-page")}
              className="mt-1"
            />
            <span>
              <span className="block font-semibold text-slate-950">
                Split every page into separate PDF files
              </span>
              <span className="mt-1 block">
                Each page becomes its own PDF inside the ZIP download.
              </span>
            </span>
          </label>
          <label className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <input
              type="radio"
              name="pdf-split-mode"
              value="selected-pages"
              checked={mode === "selected-pages"}
              disabled={isProcessing}
              onChange={() => setMode("selected-pages")}
              className="mt-1"
            />
            <span className="w-full">
              <span className="block font-semibold text-slate-950">
                Extract selected pages
              </span>
              <span className="mt-1 block">
                Enter pages like 1,3,5-8. The selected pages are saved as one PDF.
              </span>
            </span>
          </label>
        </div>

        {mode === "selected-pages" ? (
          <div className="mt-4">
            <label
              htmlFor="pdf-page-selection"
              className="text-sm font-semibold text-slate-950"
            >
              Pages to extract
            </label>
            <input
              id="pdf-page-selection"
              type="text"
              value={pages}
              onChange={(event) => setPages(event.target.value)}
              disabled={isProcessing}
              placeholder="1,3,5-8"
              className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100 disabled:bg-slate-100"
            />
          </div>
        ) : null}
      </div>

      {errorMessage ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-5 rounded-lg border border-slate-200 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              {getStatusTitle(status, Boolean(file))}
            </p>
            <p className="text-sm text-slate-600">
              {getStatusMessage(status, Boolean(result))}
            </p>
          </div>
          {result ? (
            <a
              ref={autoDownloadLinkRef}
              href={result.downloadUrl}
              download={result.outputName}
              className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Download ZIP
            </a>
          ) : (
            <button
              type="button"
              onClick={splitPdf}
              disabled={!canSplit}
              className="h-11 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition enabled:hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Split PDF
            </button>
          )}
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-cyan-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 text-sm font-medium text-slate-600">
          <span>{getProgressLabel(status)}</span>
          <span>{progress}%</span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Metric label="Original size" value={formatBytes(result?.originalSize || file?.size)} />
          <Metric label="ZIP size" value={formatBytes(result?.zipSize)} />
          <Metric label="Output files" value={result ? String(result.outputCount) : "-"} />
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function validatePdfFile(file: File) {
  const lowerName = file.name.toLowerCase();

  if (file.type !== "application/pdf" || !lowerName.endsWith(".pdf")) {
    return "Only PDF files are allowed.";
  }

  if (file.size <= 0) {
    return "The selected PDF is empty.";
  }

  if (file.size > maxPdfSplitSizeBytes) {
    return "PDF upload is larger than 100 MB.";
  }

  return "";
}

function validateReadyToSplit(
  file: File | undefined,
  mode: SplitMode,
  pages: string,
) {
  if (!file) {
    return "Please upload one PDF file.";
  }

  const fileError = validatePdfFile(file);

  if (fileError) {
    return fileError;
  }

  if (mode === "selected-pages" && !pages.trim()) {
    return "Enter the pages you want to extract, like 1,3,5-8.";
  }

  if (mode === "selected-pages" && !/^\s*\d+\s*(?:-\s*\d+\s*)?(?:,\s*\d+\s*(?:-\s*\d+\s*)?)*\s*$/.test(pages)) {
    return "Use page numbers and ranges like 1,3,5-8.";
  }

  return "";
}

function getStatusTitle(status: SplitStatus, hasFile: boolean) {
  if (status === "complete") {
    return "Split PDF ready";
  }

  if (status === "uploading" || status === "splitting") {
    return "Splitting PDF";
  }

  if (status === "error") {
    return "PDF split needs attention";
  }

  return hasFile ? "Ready to split" : "No PDF selected";
}

function getStatusMessage(status: SplitStatus, hasResult: boolean) {
  if (hasResult) {
    return "Split complete. Your ZIP download should start automatically.";
  }

  if (status === "uploading") {
    return "Uploading PDF file...";
  }

  if (status === "splitting") {
    return "Creating PDF files and packaging ZIP...";
  }

  return "Upload one PDF, choose a split option, then download the ZIP file.";
}

function getProgressLabel(status: SplitStatus) {
  if (status === "complete") {
    return "Ready";
  }

  if (status === "uploading") {
    return "Uploading";
  }

  if (status === "splitting") {
    return "Splitting";
  }

  return "Waiting";
}

function formatBytes(bytes?: number) {
  if (!bytes) {
    return "-";
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  return `${(bytes / 1024).toFixed(1)} KB`;
}
