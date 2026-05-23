"use client";

import { sendGAEvent } from "@next/third-parties/google";

type AnalyticsParams = Record<string, string | number | boolean | undefined>;

export function trackAnalyticsEvent(name: string, params: AnalyticsParams = {}) {
  if (!process.env.NEXT_PUBLIC_GA_ID) {
    return;
  }

  sendGAEvent("event", name, params);
}

export function trackConversionPageVisit() {
  trackAnalyticsEvent("conversion_page_visit", {
    tool: "mp4_to_mp3",
  });
}

export function trackSuccessfulConversion(params: {
  fileSize: number;
  outputName?: string;
}) {
  trackAnalyticsEvent("conversion_success", {
    tool: "mp4_to_mp3",
    file_size: params.fileSize,
    output_name: params.outputName,
  });
}

export function trackUploadFailure(params: {
  reason: string;
  fileSize?: number;
}) {
  trackAnalyticsEvent("upload_failure", {
    tool: "mp4_to_mp3",
    reason: params.reason,
    file_size: params.fileSize,
  });
}
