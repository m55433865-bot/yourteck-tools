const activeUploadSessions = new Map<string, number>();
let activeConversions = 0;

const sessionIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getValidatedUploadSessionId(value: string | null) {
  if (!value || !sessionIdPattern.test(value)) {
    return null;
  }

  return value;
}

export function beginUploadSession(sessionId: string) {
  if (activeUploadSessions.has(sessionId)) {
    return false;
  }

  activeUploadSessions.set(sessionId, Date.now());
  return true;
}

export function endUploadSession(sessionId: string) {
  activeUploadSessions.delete(sessionId);
}

export function cleanupStaleUploadSessions(maxAgeMs: number) {
  const now = Date.now();

  for (const [sessionId, startedAt] of activeUploadSessions) {
    if (now - startedAt > maxAgeMs) {
      activeUploadSessions.delete(sessionId);
    }
  }
}

export function getActiveConversionsCount() {
  return activeConversions;
}

export function beginConversion(maxActiveConversions: number) {
  if (activeConversions >= maxActiveConversions) {
    return false;
  }

  activeConversions += 1;
  return true;
}

export function endConversion() {
  activeConversions = Math.max(0, activeConversions - 1);
}
