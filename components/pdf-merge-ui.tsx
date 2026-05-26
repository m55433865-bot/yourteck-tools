"use client";

import { DragEvent, useRef, useState } from "react";

const maxPdfMergeSizeMb = 100;
const maxPdfMergeSizeBytes = maxPdfMergeSizeMb * 1024 * 1024;

type PdfItem = {
  id: string;
  file: File;
};

type PdfMergeResponse = {
  ok: boolean;
  error?: string;
  pdf?: {
    outputName: string;
    downloadUrl: string;
    fileCount: number;
    totalSize: number;
    mergedSize: number;
    pageCount: number;
  };
};

type MergeStatus = "idle" | "uploading" | "merging" | "complete" | "error";

export function PdfMergeUi() {
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<XMLHttpRequest | null>(null);
  const autoDownloadLinkRef = useRef<HTMLAnchorElement>(null);
  const [items, setItems] = useState<PdfItem[]>([]);
  const [draggedItemId, setDraggedItemId] = useState("");
  const [isDraggingUpload, setIsDraggingUpload] = useState(false);
  const [status, setStatus] = useState<MergeStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<PdfMergeResponse["pdf"]>();

  const totalSize = items.reduce((total, item) => total + item.file.size, 0);
  const canMerge = items.length >= 2 && status !== "uploading" && status !== "merging";

  function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    const validationError = validatePdfFiles(files, totalSize);

    if (validationError) {
      showError(validationError);
      return;
    }

    setItems((currentItems) => [
      ...currentItems,
      ...files.map((file) => ({
        id: crypto.randomUUID(),
        file,
      })),
    ]);
    setStatus("idle");
    setErrorMessage("");
    setResult(undefined);
    setProgress(0);
  }

  function removeItem(id: string) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    setResult(undefined);
    setProgress(0);
  }

  function moveItem(id: string, direction: -1 | 1) {
    setItems((currentItems) => {
      const index = currentItems.findIndex((item) => item.id === id);
      const nextIndex = index + direction;

      if (index < 0 || nextIndex < 0 || nextIndex >= currentItems.length) {
        return currentItems;
      }

      const nextItems = [...currentItems];
      const [item] = nextItems.splice(index, 1);
      nextItems.splice(nextIndex, 0, item);

      return nextItems;
    });
    setResult(undefined);
  }

  function handleUploadDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingUpload(false);
    addFiles(event.dataTransfer.files);
  }

  function handleItemDrop(event: DragEvent<HTMLLIElement>, targetId: string) {
    event.preventDefault();

    if (!draggedItemId || draggedItemId === targetId) {
      return;
    }

    setItems((currentItems) => {
      const draggedIndex = currentItems.findIndex((item) => item.id === draggedItemId);
      const targetIndex = currentItems.findIndex((item) => item.id === targetId);

      if (draggedIndex < 0 || targetIndex < 0) {
        return currentItems;
      }

      const nextItems = [...currentItems];
      const [draggedItem] = nextItems.splice(draggedIndex, 1);
      nextItems.splice(targetIndex, 0, draggedItem);

      return nextItems;
    });
    setDraggedItemId("");
    setResult(undefined);
  }

  function mergePdfs() {
    const validationError = validateReadyToMerge(items, totalSize);

    if (validationError) {
      showError(validationError);
      return;
    }

    setStatus("uploading");
    setProgress(3);
    setErrorMessage("");
    setResult(undefined);

    const formData = new FormData();
    items.forEach((item) => formData.append("files", item.file));

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
      setStatus("merging");
      setProgress((currentProgress) => Math.max(currentProgress, 88));
    };

    request.onreadystatechange = () => {
      if (request.readyState !== XMLHttpRequest.DONE) {
        return;
      }

      requestRef.current = null;

      try {
        const data = JSON.parse(request.responseText || "{}") as PdfMergeResponse;

        if (request.status < 200 || request.status >= 300 || !data.ok || !data.pdf) {
          throw new Error(data.error || "PDF merge failed.");
        }

        setStatus("complete");
        setProgress(100);
        setResult(data.pdf);
        window.setTimeout(() => {
          autoDownloadLinkRef.current?.click();
        }, 0);
      } catch (error) {
        showError(error instanceof Error ? error.message : "PDF merge failed.");
      }
    };

    request.onerror = () => {
      requestRef.current = null;
      showError("Upload failed. Please check your connection and try again.");
    };

    request.onloadstart = () => {
      setProgress(8);
    };

    request.open("POST", "/api/tools/pdf-merge/upload");
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
          multiple
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) {
              addFiles(event.target.files);
              event.target.value = "";
            }
          }}
        />
        <p className="text-xl font-semibold text-slate-950">
          Drop PDF files here
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Upload at least 2 PDFs. Maximum total size: {maxPdfMergeSizeMb} MB
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === "uploading" || status === "merging"}
          className="mt-6 h-12 rounded-md bg-cyan-700 px-5 text-sm font-semibold text-white transition enabled:hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Choose PDFs
        </button>
      </div>

      {items.length ? (
        <div className="mt-5 rounded-lg border border-slate-200 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Files to merge
              </p>
              <p className="text-sm text-slate-600">
                {items.length} PDFs, {formatBytes(totalSize)} total
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setItems([]);
                setResult(undefined);
                setProgress(0);
                setStatus("idle");
              }}
              disabled={status === "uploading" || status === "merging"}
              className="h-10 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-950 transition enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              Clear
            </button>
          </div>

          <ol className="mt-4 grid gap-3">
            {items.map((item, index) => (
              <li
                key={item.id}
                draggable={status !== "uploading" && status !== "merging"}
                onDragStart={() => setDraggedItemId(item.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleItemDrop(event, item.id)}
                className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[auto_minmax(0,1fr)]"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-cyan-700 text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold leading-5 text-slate-950">
                      {item.file.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {formatBytes(item.file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:col-start-2">
                  <button
                    type="button"
                    onClick={() => moveItem(item.id, -1)}
                    disabled={index === 0 || status === "uploading" || status === "merging"}
                    className="h-9 rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-950 enabled:hover:bg-white disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(item.id, 1)}
                    disabled={
                      index === items.length - 1 ||
                      status === "uploading" ||
                      status === "merging"
                    }
                    className="h-9 rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-950 enabled:hover:bg-white disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={status === "uploading" || status === "merging"}
                    className="h-9 rounded-md border border-red-200 px-3 text-xs font-semibold text-red-700 enabled:hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-5 rounded-lg border border-slate-200 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              {getStatusTitle(status, items.length)}
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
              Download merged PDF
            </a>
          ) : (
            <button
              type="button"
              onClick={mergePdfs}
              disabled={!canMerge}
              className="h-11 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition enabled:hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Merge PDFs
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
          <Metric label="Files" value={result ? String(result.fileCount) : String(items.length)} />
          <Metric label="Total upload" value={formatBytes(result?.totalSize || totalSize)} />
          <Metric label="Merged size" value={formatBytes(result?.mergedSize)} />
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

function validatePdfFiles(files: File[], existingTotalSize: number) {
  if (!files.length) {
    return "Choose at least one PDF file.";
  }

  const invalidFile = files.find((file) => {
    const lowerName = file.name.toLowerCase();

    return file.type !== "application/pdf" || !lowerName.endsWith(".pdf");
  });

  if (invalidFile) {
    return "Only PDF files are allowed.";
  }

  const emptyFile = files.find((file) => file.size <= 0);

  if (emptyFile) {
    return "One of the selected PDFs is empty.";
  }

  const newTotalSize =
    existingTotalSize + files.reduce((total, file) => total + file.size, 0);

  if (newTotalSize > maxPdfMergeSizeBytes) {
    return "PDF uploads are larger than 100 MB total.";
  }

  return "";
}

function validateReadyToMerge(items: PdfItem[], totalSize: number) {
  if (items.length < 2) {
    return "Please upload at least two PDF files.";
  }

  if (totalSize > maxPdfMergeSizeBytes) {
    return "PDF uploads are larger than 100 MB total.";
  }

  return "";
}

function getStatusTitle(status: MergeStatus, fileCount: number) {
  if (status === "complete") {
    return "Merged PDF ready";
  }

  if (status === "uploading" || status === "merging") {
    return "Merging PDFs";
  }

  if (status === "error") {
    return "PDF merge needs attention";
  }

  return fileCount ? "Ready to merge" : "No PDFs selected";
}

function getStatusMessage(status: MergeStatus, hasResult: boolean) {
  if (hasResult) {
    return "Merge complete. Your download should start automatically.";
  }

  if (status === "uploading") {
    return "Uploading PDF files...";
  }

  if (status === "merging") {
    return "Combining pages into one PDF...";
  }

  return "Upload and reorder PDFs, then merge them into one file.";
}

function getProgressLabel(status: MergeStatus) {
  if (status === "complete") {
    return "Ready";
  }

  if (status === "uploading") {
    return "Uploading";
  }

  if (status === "merging") {
    return "Merging";
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
