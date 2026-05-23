import { execFile } from "node:child_process";
import { statfs } from "node:fs/promises";
import { tmpdir } from "node:os";
import { parse, resolve } from "node:path";
import { promisify } from "node:util";
import { getSafeDirectorySize } from "@/lib/server/temp-cleanup";
import {
  resetOverloadAlertState,
  sendOverloadAlertOnce,
  type OverloadAlertSnapshot,
} from "@/lib/server/overload-alerts";
import {
  outputTempDirectory,
  uploadTempDirectory,
} from "@/lib/server/uploads";
import {
  beginConversion,
  getActiveConversionsCount,
} from "@/lib/server/upload-sessions";

export const uploadPauseMessage =
  "High traffic right now. Uploads are temporarily paused to keep conversions fast and stable. Please try again shortly.";

export const minimumFreeDiskBytes = 5 * 1024 * 1024 * 1024;
export const maximumTempFolderBytes = 2 * 1024 * 1024 * 1024;
export const maximumActiveConversions = 2;

const execFileAsync = promisify(execFile);

export class ConverterProtectionError extends Error {
  status: number;
  snapshot: OverloadAlertSnapshot;

  constructor(snapshot: OverloadAlertSnapshot, message = uploadPauseMessage, status = 503) {
    super(message);
    this.name = "ConverterProtectionError";
    this.status = status;
    this.snapshot = snapshot;
  }
}

export async function assertConverterCanAcceptWork() {
  const snapshot = await getProtectionSnapshot();

  if (snapshot.freeDiskBytes < minimumFreeDiskBytes) {
    const alertSnapshot = withReason(
      snapshot,
      `Free disk space is below ${formatBytes(minimumFreeDiskBytes)}.`,
    );

    console.warn(
      `[protection] Uploads paused: free disk ${snapshot.freeDiskBytes} is below ${minimumFreeDiskBytes}.`,
    );
    await blockWithAlert(alertSnapshot);
  }

  if (snapshot.tempFolderBytes > maximumTempFolderBytes) {
    const alertSnapshot = withReason(
      snapshot,
      `Temp folder size exceeds ${formatBytes(maximumTempFolderBytes)}.`,
    );

    console.warn(
      `[protection] Uploads paused: temp folder size ${snapshot.tempFolderBytes} exceeds ${maximumTempFolderBytes}.`,
    );
    await blockWithAlert(alertSnapshot);
  }

  if (snapshot.activeConversions >= maximumActiveConversions) {
    const alertSnapshot = withReason(
      snapshot,
      `Active conversions count reached ${maximumActiveConversions}.`,
    );

    console.warn(
      `[protection] Uploads paused: active conversions reached ${maximumActiveConversions}.`,
    );
    await blockWithAlert(alertSnapshot);
  }

  resetOverloadAlertState();
}

export async function beginProtectedConversion() {
  if (!beginConversion(maximumActiveConversions)) {
    const snapshot = await getProtectionSnapshot(
      `Active conversions reached ${maximumActiveConversions}.`,
    );

    console.warn(
      `[protection] Uploads paused: active conversions reached ${maximumActiveConversions}.`,
    );
    await blockWithAlert(snapshot);
  }
}

async function getProtectionSnapshot(reason = "Converter protection limits were exceeded.") {
  const [freeDiskBytes, tempFolderBytes] = await Promise.all([
    getFreeDiskBytes(tmpdir()),
    getConverterTempFolderSize(),
  ]);

  return {
    reason,
    freeDiskBytes,
    activeConversions: getActiveConversionsCount(),
    tempFolderBytes,
    timestamp: new Date().toISOString(),
  };
}

function withReason(snapshot: OverloadAlertSnapshot, reason: string) {
  return {
    ...snapshot,
    reason,
    timestamp: new Date().toISOString(),
  };
}

async function blockWithAlert(snapshot: OverloadAlertSnapshot): Promise<never> {
  await sendOverloadAlertOnce(snapshot);
  throw new ConverterProtectionError(snapshot);
}

async function getConverterTempFolderSize() {
  const [uploadSize, outputSize] = await Promise.all([
    getSafeDirectorySize(uploadTempDirectory),
    getSafeDirectorySize(outputTempDirectory),
  ]);

  return uploadSize + outputSize;
}

async function getFreeDiskBytes(targetDirectory: string) {
  try {
    const stats = await statfs(resolve(targetDirectory));
    return Number(stats.bavail) * Number(stats.bsize);
  } catch (error) {
    if (process.platform === "win32") {
      const windowsFreeDiskBytes = await getWindowsFreeDiskBytes(targetDirectory);

      if (windowsFreeDiskBytes !== null) {
        return windowsFreeDiskBytes;
      }
    }

    console.error("[protection] Unable to check free disk space.", error);
    return 0;
  }
}

async function getWindowsFreeDiskBytes(targetDirectory: string) {
  const driveName = parse(resolve(targetDirectory)).root.replace(":\\", "");

  if (!driveName) {
    return null;
  }

  try {
    const { stdout } = await execFileAsync("powershell.exe", [
      "-NoProfile",
      "-Command",
      `$drive = Get-PSDrive -Name '${driveName}'; [int64]$drive.Free`,
    ]);
    const freeBytes = Number(stdout.trim());

    return Number.isFinite(freeBytes) ? freeBytes : null;
  } catch (error) {
    console.error("[protection] Windows free disk check failed.", error);
    return null;
  }
}

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
