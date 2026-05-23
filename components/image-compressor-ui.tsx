"use client";

import { DragEvent, useRef, useState } from "react";

const maxImageSizeMb = 20;
const maxImageSizeBytes = maxImageSizeMb * 1024 * 1024;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

type ImageCompressionResponse = {
  ok: boolean;
  error?: string;
  image?: {
    originalName: string;
    outputName: string;
    downloadUrl: string;
    originalSize: number;
    compressedSize: number;
    percentSaved: number;
    mimeType: string;
  };
};

type CompressionStatus = "idle" | "compressing" | "complete" | "error";

export function ImageCompressorUi() {
  const inputRef = useRef<HTMLInputElement>(null);
  const autoDownloadLinkRef = useRef<HTMLAnchorElement>(null);
  const [status, setStatus] = useState<CompressionStatus>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<ImageCompressionResponse["image"]>();

  async function compressImage(file: File) {
    const validationError = validateClientImage(file);

    if (validationError) {
      showError(validationError);
      return;
    }

    setStatus("compressing");
    setFileName(file.name);
    setErrorMessage("");
    setResult(undefined);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/tools/image-compressor/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as ImageCompressionResponse;

      if (!response.ok || !data.ok || !data.image) {
        throw new Error(data.error || "Image compression failed.");
      }

      setStatus("complete");
      setResult(data.image);
      window.setTimeout(() => {
        autoDownloadLinkRef.current?.click();
      }, 0);
    } catch (error) {
      showError(error instanceof Error ? error.message : "Image compression failed.");
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

    void compressImage(file);
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
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />
        <p className="text-xl font-semibold text-slate-950">
          Drop your image here
        </p>
        <p className="mt-2 text-sm text-slate-600">
          JPG, PNG, or WebP. Maximum file size: {maxImageSizeMb} MB
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === "compressing"}
          className="mt-6 h-12 rounded-md bg-cyan-700 px-5 text-sm font-semibold text-white transition enabled:hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {status === "compressing" ? "Compressing..." : "Choose image"}
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
              {fileName || "No image selected"}
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
              Download image
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="h-11 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Download image
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Metric label="Original size" value={formatBytes(result?.originalSize)} />
          <Metric label="Compressed size" value={formatBytes(result?.compressedSize)} />
          <Metric label="Saved" value={result ? `${result.percentSaved}%` : "-"} />
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

function validateClientImage(file: File) {
  const lowerName = file.name.toLowerCase();

  if (!allowedImageTypes.includes(file.type)) {
    return "Only JPG, PNG, and WebP images are allowed.";
  }

  if (![".jpg", ".jpeg", ".png", ".webp"].some((extension) => lowerName.endsWith(extension))) {
    return "File extension must be JPG, JPEG, PNG, or WebP.";
  }

  if (file.size > maxImageSizeBytes) {
    return "Image is larger than 20 MB.";
  }

  if (file.size <= 0) {
    return "The selected image is empty.";
  }

  return "";
}

function getStatusMessage(status: CompressionStatus, hasResult: boolean) {
  if (hasResult) {
    return "Compression complete. Your download should start automatically.";
  }

  if (status === "compressing") {
    return "Compressing your image...";
  }

  return "Upload an image to reduce its file size.";
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
