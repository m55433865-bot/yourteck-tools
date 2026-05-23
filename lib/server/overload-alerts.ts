import { sendSmtpMail } from "@/lib/server/smtp-alerts";

export type OverloadAlertSnapshot = {
  reason: string;
  freeDiskBytes: number;
  activeConversions: number;
  tempFolderBytes: number;
  timestamp: string;
};

const alertSubject = "YourTeck Converter Alert: Uploads Temporarily Paused";
let overloadAlertSent = false;

export async function sendOverloadAlertOnce(snapshot: OverloadAlertSnapshot) {
  if (overloadAlertSent) {
    return;
  }

  overloadAlertSent = true;

  const sent = await sendSmtpMail({
    subject: alertSubject,
    text: buildOverloadAlertBody(snapshot),
  }).catch((error) => {
    console.error("[alert] Failed to send overload alert email.", error);
    return false;
  });

  if (sent) {
    console.info("[alert] Overload alert email sent.");
  }
}

export function resetOverloadAlertState() {
  if (overloadAlertSent) {
    console.info("[alert] Converter recovered; overload alert state reset.");
  }

  overloadAlertSent = false;
}

function buildOverloadAlertBody(snapshot: OverloadAlertSnapshot) {
  return [
    "YourTeck converter uploads were temporarily paused.",
    "",
    `Reason: ${snapshot.reason}`,
    `Free disk space: ${formatBytes(snapshot.freeDiskBytes)}`,
    `Active conversions count: ${snapshot.activeConversions}`,
    `Temp folder size: ${formatBytes(snapshot.tempFolderBytes)}`,
    `Timestamp: ${snapshot.timestamp}`,
  ].join("\n");
}

function formatBytes(bytes: number) {
  const gib = bytes / 1024 / 1024 / 1024;
  return `${gib.toFixed(2)} GB (${bytes} bytes)`;
}
