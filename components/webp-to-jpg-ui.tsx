"use client";

import { DragEvent, useRef, useState } from "react";

const maxWebpToJpgSizeMb = 25;
const maxWebpToJpgSizeBytes = maxWebpToJpgSizeMb * 1024 * 1024;

type ConversionStatus = "idle" | "uploading" | "converting" | "complete" | "error";

type WebpToJpgResponse = {
  ok: boolean;
  error?: string;
  image?: {
    originalName: string;
    outputName: string;
    downloadUrl: string;
    originalSize: number;
    convertedSize: number;
  };
};

export function WebpToJpgUi() {
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<XMLHttpRequest | null>(null);
  const autoDownloadLinkRef = useRef<HTMLAnchorElement>(null);
  const [status, setStatus] = useState<ConversionStatus>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [originalSize, setOriginalSize] = useState<number>();
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<WebpToJpgResponse["image"]>();

  const isProcessing = status === "uploading" || status === "converting";

  function convertWebp(file: File) {
    const validationError = validateClientWebp(file);

    if (validationError) {
      showError(validationError);
      return;
    }

    setStatus("uploading");
    setFileName(file.name);
    setOriginalSize(file.size);
    setProgress(3);
    setErrorMessage("");
    setResult(undefined);

    const formData = new FormData();
    formData.append("file", file);

    const request = new XMLHttpRequest();
    requestRef.current = request;

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      setProgress(Math.min(80, Math.round((event.loaded / event.total) * 80)));
    };

    request.upload.onload = () => {
      setStatus("converting");
      setProgress((currentProgress) => Math.max(currentProgress, 88));
    };

    request.onreadystatechange = () => {
      if (request.readyState !== XMLHttpRequest.DONE) {
        return;
      }

      requestRef.current = null;

      try {
        const data = JSON.parse(request.responseText || "{}") as WebpToJpgResponse;

        if (request.status < 200 || request.status >= 300 || !data.ok || !data.image) {
          throw new Error(data.error || "WEBP to JPG conversion failed.");
        }

        setStatus("complete");
        setProgress(100);
        setResult(data.image);
        window.setTimeout(() => {
          autoDownloadLinkRef.current?.click();
        }, 0);
      } catch (error) {
        showError(
          error instanceof Error ? error.message : "WEBP to JPG conversion failed.",
        );
      } finally {
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    };

    request.onerror = () => {
      requestRef.current = null;
      showError("Upload failed. Please check your connection and try again.");
    };

    request.onloadstart = () => {
      setProgress(8);
    };

    request.open("POST", "/api/tools/webp-to-jpg/upload");
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

  function handleFiles(files: FileList | null) {
    const file = files?.[0];

    if (!file) {
      return;
    }

    convertWebp(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex min-h-56 flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition ${
          isDragging
            ? "border-cyan-500 bg-cyan-50"
            : "border-slate-300 bg-slate-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/webp,.webp"
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />
        <p className="text-xl font-semibold text-slate-950">
          Drop your WEBP file here
        </p>
        <p className="mt-2 text-sm text-slate-600">
          WEBP only. Maximum file size: {maxWebpToJpgSizeMb} MB
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isProcessing}
          className="mt-6 h-12 rounded-md bg-cyan-700 px-5 text-sm font-semibold text-white transition enabled:hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isProcessing ? "Converting..." : "Choose WEBP"}
        </button>
      </div>

      {errorMessage ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-5 rounded-lg border border-slate-200 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold text-slate-950">
              {fileName || "No WEBP selected"}
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
              Download JPG
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="h-11 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Download JPG
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

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Metric
            label="Original size"
            value={formatBytes(result?.originalSize || originalSize)}
          />
          <Metric label="Converted size" value={formatBytes(result?.convertedSize)} />
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

function validateClientWebp(file: File) {
  const lowerName = file.name.toLowerCase();

  if (file.type !== "image/webp") {
    return "Only WEBP images are allowed.";
  }

  if (!lowerName.endsWith(".webp")) {
    return "File extension must be .webp.";
  }

  if (file.size > maxWebpToJpgSizeBytes) {
    return "WEBP is larger than 25 MB.";
  }

  if (file.size <= 0) {
    return "The selected WEBP is empty.";
  }

  return "";
}

function getStatusMessage(status: ConversionStatus, hasResult: boolean) {
  if (hasResult) {
    return "Conversion complete. Your download should start automatically.";
  }

  if (status === "uploading") {
    return "Uploading WEBP image...";
  }

  if (status === "converting") {
    return "Converting WEBP to JPG...";
  }

  return "Upload a WEBP image to convert it to JPG.";
}

function getProgressLabel(status: ConversionStatus) {
  if (status === "complete") {
    return "Ready";
  }

  if (status === "uploading") {
    return "Uploading";
  }

  if (status === "converting") {
    return "Converting";
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
