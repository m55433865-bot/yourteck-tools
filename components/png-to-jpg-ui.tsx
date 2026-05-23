"use client";

import { DragEvent, useRef, useState } from "react";

const maxPngSizeMb = 20;
const maxPngSizeBytes = maxPngSizeMb * 1024 * 1024;

type PngToJpgResponse = {
  ok: boolean;
  error?: string;
  image?: {
    originalName: string;
    outputName: string;
    downloadUrl: string;
    originalSize: number;
    convertedSize: number;
    whiteBackground: boolean;
  };
};

type ConversionStatus = "idle" | "converting" | "complete" | "error";

export function PngToJpgUi() {
  const inputRef = useRef<HTMLInputElement>(null);
  const autoDownloadLinkRef = useRef<HTMLAnchorElement>(null);
  const [status, setStatus] = useState<ConversionStatus>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [whiteBackground, setWhiteBackground] = useState(true);
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<PngToJpgResponse["image"]>();

  async function convertPng(file: File) {
    const validationError = validateClientPng(file);

    if (validationError) {
      showError(validationError);
      return;
    }

    setStatus("converting");
    setFileName(file.name);
    setErrorMessage("");
    setResult(undefined);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("whiteBackground", String(whiteBackground));

      const response = await fetch("/api/tools/png-to-jpg/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as PngToJpgResponse;

      if (!response.ok || !data.ok || !data.image) {
        throw new Error(data.error || "PNG to JPG conversion failed.");
      }

      setStatus("complete");
      setResult(data.image);
      window.setTimeout(() => {
        autoDownloadLinkRef.current?.click();
      }, 0);
    } catch (error) {
      showError(error instanceof Error ? error.message : "PNG to JPG conversion failed.");
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function showError(message: string) {
    setStatus("error");
    setErrorMessage(message);
    setResult(undefined);
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];

    if (!file) {
      return;
    }

    void convertPng(file);
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
        className={`flex min-h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition ${
          isDragging
            ? "border-cyan-500 bg-cyan-50"
            : "border-slate-300 bg-slate-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,.png"
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />
        <p className="text-xl font-semibold text-slate-950">
          Drop your PNG file here
        </p>
        <p className="mt-2 text-sm text-slate-600">
          PNG only. Maximum file size: {maxPngSizeMb} MB
        </p>
        <label className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={whiteBackground}
            onChange={(event) => setWhiteBackground(event.target.checked)}
            className="size-4 accent-cyan-700"
          />
          Use white background for transparent PNGs
        </label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === "converting"}
          className="mt-6 h-12 rounded-md bg-cyan-700 px-5 text-sm font-semibold text-white transition enabled:hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {status === "converting" ? "Converting..." : "Choose PNG"}
        </button>
      </div>

      {errorMessage ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-5 rounded-lg border border-slate-200 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              {fileName || "No PNG selected"}
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

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Metric label="Original size" value={formatBytes(result?.originalSize)} />
          <Metric label="Converted size" value={formatBytes(result?.convertedSize)} />
          <Metric label="Background" value={result?.whiteBackground ? "White" : "Dark"} />
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

function validateClientPng(file: File) {
  if (file.type !== "image/png") {
    return "Only PNG images are allowed.";
  }

  if (!file.name.toLowerCase().endsWith(".png")) {
    return "File extension must be .png.";
  }

  if (file.size > maxPngSizeBytes) {
    return "PNG is larger than 20 MB.";
  }

  if (file.size <= 0) {
    return "The selected PNG is empty.";
  }

  return "";
}

function getStatusMessage(status: ConversionStatus, hasResult: boolean) {
  if (hasResult) {
    return "Conversion complete. Your download should start automatically.";
  }

  if (status === "converting") {
    return "Converting PNG to high-quality JPG...";
  }

  return "Upload a PNG file to convert it to JPG.";
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
