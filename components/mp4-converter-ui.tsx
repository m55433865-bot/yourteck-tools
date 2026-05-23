"use client";

import { DragEvent, useEffect, useRef, useState } from "react";

const maxFileSizeMb = 200;
const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;

type UploadStatus = "idle" | "processing" | "converted" | "error";

type UploadResponse = {
  ok: boolean;
  error?: string;
  upload?: {
    originalName: string;
    storedName: string;
    size: number;
    mimeType: string;
    status: string;
    outputName?: string;
    downloadUrl?: string;
  };
};

export function Mp4ConverterUi() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState(
    "Upload an MP4 file to convert it to MP3.",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  useEffect(() => {
    if (status !== "processing" || progress >= 90) {
      return;
    }

    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 90) {
          window.clearInterval(interval);
          return 90;
        }

        return Math.min(current + 5, 90);
      });
    }, 500);

    return () => window.clearInterval(interval);
  }, [progress, status]);

  async function uploadFile(file: File) {
    const validationError = validateClientFile(file);

    if (validationError) {
      showUploadError(validationError);
      return;
    }

    if (status === "processing") {
      showUploadError("Please wait for the current upload to finish.");
      return;
    }

    setFileName(file.name);
    setProgress(0);
    setStatus("processing");
    setErrorMessage("");
    setDownloadUrl("");
    setMessage("Uploading and converting your MP4 file...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/tools/mp4-to-mp3/upload", {
        method: "POST",
        body: formData,
        headers: {
          "x-upload-session-id": getUploadSessionId(),
        },
      });
      const data = (await response.json()) as UploadResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Upload failed. Please try again.");
      }

      if (!data.upload?.downloadUrl) {
        throw new Error("Conversion finished without a download link.");
      }

      setStatus("converted");
      setDownloadUrl(data.upload.downloadUrl);
      setMessage("Conversion complete. Your MP3 is ready to download.");
      setProgress(100);
    } catch (error) {
      showUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function showUploadError(error: string) {
    setStatus("error");
    setErrorMessage(error);
    setMessage("Upload an MP4 file to convert it to MP3.");
    setDownloadUrl("");
    setProgress(0);
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];

    if (!file) {
      return;
    }

    void uploadFile(file);
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
          accept="video/mp4,.mp4"
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />
        <p className="text-xl font-semibold text-slate-950">
          Drop your MP4 file here
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Maximum file size: {maxFileSizeMb} MB
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === "processing"}
          className="mt-6 h-12 rounded-md bg-cyan-700 px-5 text-sm font-semibold text-white transition enabled:hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {status === "processing" ? "Converting..." : "Choose MP4 file"}
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
              {fileName || "No file selected"}
            </p>
            <p className="text-sm text-slate-600">{message}</p>
          </div>
          {downloadUrl ? (
            <a
              href={downloadUrl}
              className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Download MP3
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="h-11 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition enabled:hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Download MP3
            </button>
          )}
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-cyan-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-right text-sm font-medium text-slate-600">
          {progress}%
        </p>
      </div>
    </section>
  );
}

function validateClientFile(file: File) {
  if (file.type !== "video/mp4") {
    return "Only MP4 video files are allowed.";
  }

  if (!file.name.toLowerCase().endsWith(".mp4")) {
    return "File extension must be .mp4.";
  }

  if (file.size > maxFileSizeBytes) {
    return "File is larger than 200 MB.";
  }

  if (file.size <= 0) {
    return "The selected file is empty.";
  }

  return "";
}

function getUploadSessionId() {
  if (sessionStorageUnavailable()) {
    return crypto.randomUUID();
  }

  let sessionId = window.sessionStorage.getItem("yourteck-upload-session-id");

  if (!sessionId) {
    sessionId = window.crypto.randomUUID();
    window.sessionStorage.setItem("yourteck-upload-session-id", sessionId);
  }

  return sessionId;
}

function sessionStorageUnavailable() {
  return typeof window === "undefined" || !window.sessionStorage;
}
