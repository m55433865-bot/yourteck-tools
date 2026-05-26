"use client";

import { DragEvent, useRef, useState } from "react";

const maxCompressPdfSizeMb = 100;
const maxCompressPdfSizeBytes = maxCompressPdfSizeMb * 1024 * 1024;

type CompressionLevel = "low" | "recommended" | "high";
type CompressStatus = "idle" | "uploading" | "compressing" | "complete" | "error";

type CompressPdfResponse = {
  ok: boolean;
  error?: string;
  pdf?: {
    outputName: string;
    downloadUrl: string;
    originalSize: number;
    compressedSize: number;
    reductionPercent: number;
    pageCount: number;
    level: CompressionLevel;
    levelLabel: string;
  };
};

const compressionLevels: Array<{
  value: CompressionLevel;
  title: string;
  description: string;
}> = [
  {
    value: "low",
    title: "Low compression",
    description: "Keeps the PDF closest to the original while optimizing structure.",
  },
  {
    value: "recommended",
    title: "Recommended",
    description: "Balanced compression for most documents and everyday sharing.",
  },
  {
    value: "high",
    title: "High compression",
    description: "Uses stronger optimization for the smallest practical output.",
  },
];

export function CompressPdfUi() {
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<XMLHttpRequest | null>(null);
  const autoDownloadLinkRef = useRef<HTMLAnchorElement>(null);
  const [file, setFile] = useState<File>();
  const [level, setLevel] = useState<CompressionLevel>("recommended");
  const [isDraggingUpload, setIsDraggingUpload] = useState(false);
  const [status, setStatus] = useState<CompressStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<CompressPdfResponse["pdf"]>();

  const isProcessing = status === "uploading" || status === "compressing";
  const canCompress = Boolean(file) && !isProcessing;

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

  function compressPdf() {
    const validationError = validateReadyToCompress(file);

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
    formData.append("level", level);

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
      setStatus("compressing");
      setProgress((currentProgress) => Math.max(currentProgress, 88));
    };

    request.onreadystatechange = () => {
      if (request.readyState !== XMLHttpRequest.DONE) {
        return;
      }

      requestRef.current = null;

      try {
        const data = JSON.parse(request.responseText || "{}") as CompressPdfResponse;

        if (request.status < 200 || request.status >= 300 || !data.ok || !data.pdf) {
          throw new Error(data.error || "PDF compression failed.");
        }

        setStatus("complete");
        setProgress(100);
        setResult(data.pdf);
        window.setTimeout(() => {
          autoDownloadLinkRef.current?.click();
        }, 0);
      } catch (error) {
        showError(
          error instanceof Error ? error.message : "PDF compression failed.",
        );
      }
    };

    request.onerror = () => {
      requestRef.current = null;
      showError("Upload failed. Please check your connection and try again.");
    };

    request.onloadstart = () => {
      setProgress(8);
    };

    request.open("POST", "/api/tools/compress-pdf/upload");
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
          Maximum file size: {maxCompressPdfSizeMb} MB
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
        <p className="text-sm font-semibold text-slate-950">Compression level</p>
        <div className="mt-3 grid gap-3">
          {compressionLevels.map((option) => (
            <label
              key={option.value}
              className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
            >
              <input
                type="radio"
                name="pdf-compression-level"
                value={option.value}
                checked={level === option.value}
                disabled={isProcessing}
                onChange={() => setLevel(option.value)}
                className="mt-1"
              />
              <span>
                <span className="block font-semibold text-slate-950">
                  {option.title}
                </span>
                <span className="mt-1 block">{option.description}</span>
              </span>
            </label>
          ))}
        </div>
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
              Download compressed PDF
            </a>
          ) : (
            <button
              type="button"
              onClick={compressPdf}
              disabled={!canCompress}
              className="h-11 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition enabled:hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Compress PDF
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
          <Metric
            label="Original size"
            value={formatBytes(result?.originalSize || file?.size)}
          />
          <Metric label="Compressed size" value={formatBytes(result?.compressedSize)} />
          <Metric
            label="Reduced"
            value={result ? `${result.reductionPercent}%` : "-"}
          />
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

  if (file.size > maxCompressPdfSizeBytes) {
    return "PDF upload is larger than 100 MB.";
  }

  return "";
}

function validateReadyToCompress(file: File | undefined) {
  if (!file) {
    return "Please upload one PDF file.";
  }

  return validatePdfFile(file);
}

function getStatusTitle(status: CompressStatus, hasFile: boolean) {
  if (status === "complete") {
    return "Compressed PDF ready";
  }

  if (status === "uploading" || status === "compressing") {
    return "Compressing PDF";
  }

  if (status === "error") {
    return "PDF compression needs attention";
  }

  return hasFile ? "Ready to compress" : "No PDF selected";
}

function getStatusMessage(status: CompressStatus, hasResult: boolean) {
  if (hasResult) {
    return "Compression complete. Your download should start automatically.";
  }

  if (status === "uploading") {
    return "Uploading PDF file...";
  }

  if (status === "compressing") {
    return "Optimizing PDF structure...";
  }

  return "Upload one PDF, choose a compression level, then download the result.";
}

function getProgressLabel(status: CompressStatus) {
  if (status === "complete") {
    return "Ready";
  }

  if (status === "uploading") {
    return "Uploading";
  }

  if (status === "compressing") {
    return "Compressing";
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
