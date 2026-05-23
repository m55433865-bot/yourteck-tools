import { readdir, stat, unlink } from "node:fs/promises";
import { basename, resolve, sep } from "node:path";

type CleanupOptions = {
  directory: string;
  maxAgeMs: number;
  label: string;
};

export async function cleanupOldTempFiles({
  directory,
  maxAgeMs,
  label,
}: CleanupOptions) {
  const safeDirectory = resolve(directory);

  try {
    const entries = await readdir(safeDirectory);
    const now = Date.now();

    await Promise.all(
      entries.map(async (entry) => {
        const safeFilePath = resolve(safeDirectory, basename(entry));

        if (!isPathInsideDirectory(safeFilePath, safeDirectory)) {
          console.warn(`[cleanup:${label}] Skipped unsafe path: ${entry}`);
          return;
        }

        const fileStats = await stat(safeFilePath);

        if (!fileStats.isFile() || now - fileStats.mtimeMs <= maxAgeMs) {
          return;
        }

        await unlink(safeFilePath);
        console.info(`[cleanup:${label}] Deleted temp file: ${safeFilePath}`);
      }),
    );
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return;
    }

    throw error;
  }
}

export async function deleteTempFile(filePath: string, directory: string, label: string) {
  const safeDirectory = resolve(directory);
  const safeFilePath = resolve(filePath);

  if (!isPathInsideDirectory(safeFilePath, safeDirectory)) {
    console.warn(`[cleanup:${label}] Refused to delete outside temp folder: ${filePath}`);
    return false;
  }

  await unlink(safeFilePath)
    .then(() => {
      console.info(`[cleanup:${label}] Deleted temp file: ${safeFilePath}`);
    })
    .catch((error) => {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) {
        throw error;
      }
    });

  return true;
}

export async function getSafeDirectorySize(directory: string) {
  const safeDirectory = resolve(directory);

  return getDirectorySize(safeDirectory, safeDirectory);
}

async function getDirectorySize(directory: string, safeRoot: string): Promise<number> {
  let entries;

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return 0;
    }

    throw error;
  }

  let size = 0;

  for (const entry of entries) {
    const safePath = resolve(directory, basename(entry.name));

    if (!isPathInsideDirectory(safePath, safeRoot) || entry.isSymbolicLink()) {
      continue;
    }

    if (entry.isDirectory()) {
      size += await getDirectorySize(safePath, safeRoot);
      continue;
    }

    if (entry.isFile()) {
      size += (await stat(safePath)).size;
    }
  }

  return size;
}

function isPathInsideDirectory(filePath: string, directory: string) {
  return filePath === directory || filePath.startsWith(`${directory}${sep}`);
}
