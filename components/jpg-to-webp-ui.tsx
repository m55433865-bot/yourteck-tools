"use client";

import { DragEvent, useRef, useState } from "react";

const maxJpgToWebpSizeMb = 25;
const maxJpgToWebpSizeBytes = maxJpgToWebpSizeMb * 1024 * 1024;

type WebpQuality = "high" | "recommended" | "smallest";
type ConversionStatus = "idle" | "uploading" | "converting" | "complete" | "error";

type JpgToWebpResponse = {
  ok: boolean;
  error?: string;
  image?: {
    originalName: string;
    outputName: string;
    downloadUrl: string;
    originalSize: number;
    convertedSize: number;
    quality: WebpQuality;
    qualityLabel: string;
  };
};

const qualityOptions: Array<{
  value: WebpQuality;
  title: string;
  description: string;
}> = [
  {
    value: "high",
    title: "High Quality",
    description: "Best visual quality with a moderate file size reduction.",
  },
  {
    value: "recommended",
    title: "Recommended",
    description: "Balanced WEBP output for most photos and web use.",
  },
  {
    value: "smallest",
    title: "Smallest File Size",
    description: "Stronger compression for smaller downloads and faster pages.",
  },
];

export function JpgToWebpUi() {
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<XMLHttpRequest | null>(null);
  const autoDownloadLinkRef = useRef<HTMLAnchorElement>(null);
  const [quality, setQuality] = useState<WebpQuality>("recommended");
  const [status, setStatus] = useState<ConversionStatus>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [originalSize, setOriginalSize] = useState<number>();
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<JpgToWebpResponse["image"]>();

  const isProcessing = status === "uploading" || status === "converting";

  function convertJpg(file: File) {
    const validationError = validateClientJpg(file);

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
    formData.append("quality", quality);

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
        const data = JSON.parse(request.responseText || "{}") as JpgToWebpResponse;

        if (request.status < 200 || request.status >= 300 || !data.ok || !data.image) {
          throw new Error(data.error || "JPG to WEBP conversion failed.");
        }

        setStatus("complete");
        setProgress(100);
        setResult(data.image);
        window.setTimeout(() => {
          autoDownloadLinkRef.current?.click();
        }, 0);
      } catch (error) {
        showError(
          error instanceof Error ? error.message : "JPG to WEBP conversion failed.",
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

    request.open("POST", "/api/tools/jpg-to-webp/upload");
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

    convertJpg(file);
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
          accept="image/jpeg,.jpg,.jpeg"
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />
        <p className="text-xl font-semibold text-slate-950">
          Drop your JPG file here
        </p>
        <p className="mt-2 text-sm text-slate-600">
          JPG or JPEG only. Maximum file size: {maxJpgToWebpSizeMb} MB
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isProcessing}
          className="mt-6 h-12 rounded-md bg-cyan-700 px-5 text-sm font-semibold text-white transition enabled:hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isProcessing ? "Converting..." : "Choose JPG"}
        </button>
      </div>

      <div className="mt-5 rounded-lg border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-950">WEBP quality</p>
        <div className="mt-3 grid gap-3">
          {qualityOptions.map((option) => (
            <label
              key={option.value}
              className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
            >
              <input
                type="radio"
                name="webp-quality"
                value={option.value}
                checked={quality === option.value}
                disabled={isProcessing}
                onChange={() => setQuality(option.value)}
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
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold text-slate-950">
              {fileName || "No JPG selected"}
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
              Download WEBP
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="h-11 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Download WEBP
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

function validateClientJpg(file: File) {
  const lowerName = file.name.toLowerCase();

  if (file.type !== "image/jpeg") {
    return "Only JPG and JPEG images are allowed.";
  }

  if (!lowerName.endsWith(".jpg") && !lowerName.endsWith(".jpeg")) {
    return "File extension must be .jpg or .jpeg.";
  }

  if (file.size > maxJpgToWebpSizeBytes) {
    return "JPG is larger than 25 MB.";
  }

  if (file.size <= 0) {
    return "The selected JPG is empty.";
  }

  return "";
}

function getStatusMessage(status: ConversionStatus, hasResult: boolean) {
  if (hasResult) {
    return "Conversion complete. Your download should start automatically.";
  }

  if (status === "uploading") {
    return "Uploading JPG image...";
  }

  if (status === "converting") {
    return "Converting JPG to WEBP...";
  }

  return "Upload a JPG or JPEG file to convert it to WEBP.";
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
