"use client";

import { DragEvent, useEffect, useRef, useState } from "react";

const maxFileSizeMb = 200;
const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;

type UploadStatus = "idle" | "processing" | "converted" | "error";
type ProcessingStage = "idle" | "uploading" | "processing" | "extracting" | "finalizing" | "complete";

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
  const autoDownloadLinkRef = useRef<HTMLAnchorElement>(null);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [message, setMessage] = useState(
    "Upload an MP4 file to convert it to MP3.",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadFileName, setDownloadFileName] = useState("converted.mp3");

  useEffect(() => {
    if (status !== "processing") {
      return;
    }

    const interval = window.setInterval(() => {
      setProgress((current) => {
        const nextProgress = getNextProgress(current);
        setStage(getStageForProgress(nextProgress));
        return nextProgress;
      });
    }, 420);

    return () => window.clearInterval(interval);
  }, [status]);

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
    setStage("uploading");
    setErrorMessage("");
    setDownloadUrl("");
    setDownloadFileName("converted.mp3");
    setMessage("Uploading your MP4 file...");

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
      setStage("complete");
      setDownloadUrl(data.upload.downloadUrl);
      setDownloadFileName(data.upload.outputName || buildDownloadFileName(file.name));
      setMessage("Conversion complete. Your download should start automatically.");
      setProgress(100);
      window.setTimeout(() => {
        autoDownloadLinkRef.current?.click();
      }, 0);
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
    setStage("idle");
    setErrorMessage(error);
    setMessage("Upload an MP4 file to convert it to MP3.");
    setDownloadUrl("");
    setDownloadFileName("converted.mp3");
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

  const statusMessage =
    status === "processing" ? stageMessages[stage] || stageMessages.uploading : message;

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
            <p className="text-sm text-slate-600">{statusMessage}</p>
          </div>
          {downloadUrl ? (
            <a
              ref={autoDownloadLinkRef}
              href={downloadUrl}
              download={downloadFileName}
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
        {stage !== "idle" ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {processingStages.map((item) => (
              <div
                key={item.key}
                className={`rounded-md border px-3 py-2 text-xs font-semibold transition ${
                  getStageRank(stage) >= getStageRank(item.key)
                    ? "border-cyan-200 bg-cyan-50 text-cyan-800"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                {item.label}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

const processingStages: Array<{ key: ProcessingStage; label: string }> = [
  { key: "uploading", label: "Uploading" },
  { key: "processing", label: "Processing" },
  { key: "extracting", label: "Extracting audio" },
  { key: "finalizing", label: "Finalizing" },
];

const stageMessages: Record<ProcessingStage, string> = {
  idle: "Upload an MP4 file to convert it to MP3.",
  uploading: "Uploading your MP4 file...",
  processing: "Processing the video file...",
  extracting: "Extracting audio from the MP4...",
  finalizing: "Finalizing your MP3 download...",
  complete: "Conversion complete. Your MP3 is ready to download.",
};

function getNextProgress(current: number) {
  if (current < 28) {
    return Math.min(current + 7, 28);
  }

  if (current < 58) {
    return Math.min(current + 4, 58);
  }

  if (current < 84) {
    return Math.min(current + 3, 84);
  }

  if (current < 96) {
    return Math.min(current + 1, 96);
  }

  return 96;
}

function getStageForProgress(progress: number): ProcessingStage {
  if (progress < 30) {
    return "uploading";
  }

  if (progress < 60) {
    return "processing";
  }

  if (progress < 86) {
    return "extracting";
  }

  return "finalizing";
}

function getStageRank(stage: ProcessingStage) {
  return ["idle", "uploading", "processing", "extracting", "finalizing", "complete"].indexOf(stage);
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

function buildDownloadFileName(fileName: string) {
  const baseName = fileName.replace(/\.[^/.]+$/, "").trim();
  return `${baseName || "converted"}.mp3`;
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
