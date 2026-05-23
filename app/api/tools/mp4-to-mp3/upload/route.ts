import { NextResponse } from "next/server";
import {
  assertConverterCanAcceptWork,
  beginProtectedConversion,
  ConverterProtectionError,
} from "@/lib/server/converter-protection";
import {
  cleanupOldTemporaryFiles,
  ConversionError,
  convertMp4ToMp3,
  deleteTemporaryFile,
  getUploadFile,
  uploadTempDirectory,
  saveTemporaryUpload,
  UploadValidationError,
  validateRequestContentLength,
} from "@/lib/server/uploads";
import {
  beginUploadSession,
  cleanupStaleUploadSessions,
  endConversion,
  endUploadSession,
  getValidatedUploadSessionId,
} from "@/lib/server/upload-sessions";

export const runtime = "nodejs";

const sessionHeaderName = "x-upload-session-id";

export async function POST(request: Request) {
  cleanupStaleUploadSessions(10 * 60 * 1000);
  let conversionStarted = false;

  const sessionId = getValidatedUploadSessionId(
    request.headers.get(sessionHeaderName),
  );

  if (!sessionId) {
    return NextResponse.json(
      { ok: false, error: "Upload session is missing or invalid." },
      { status: 400 },
    );
  }

  if (!beginUploadSession(sessionId)) {
    return NextResponse.json(
      { ok: false, error: "An upload is already in progress for this session." },
      { status: 429 },
    );
  }

  try {
    validateRequestContentLength(request);
    await cleanupOldTemporaryFiles();
    await assertConverterCanAcceptWork();
    await beginProtectedConversion();
    conversionStarted = true;

    const formData = await request.formData();
    const file = getUploadFile(formData);
    const upload = await saveTemporaryUpload(file);
    const output = await convertMp4ToMp3(upload.path);

    void deleteTemporaryFile(upload.path, uploadTempDirectory, "mp4-upload");

    return NextResponse.json(
      {
        ok: true,
        upload: {
          originalName: upload.originalName,
          storedName: upload.storedName,
          size: upload.size,
          mimeType: upload.mimeType,
          status: "converted",
          outputName: output.storedName,
          downloadUrl: `/api/tools/mp4-to-mp3/download/${output.storedName}`,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status },
      );
    }

    if (error instanceof ConversionError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status },
      );
    }

    if (error instanceof ConverterProtectionError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status },
      );
    }

    console.error("MP4 upload or conversion failed", error);

    return NextResponse.json(
      { ok: false, error: "Upload or conversion failed. Please try again." },
      { status: 500 },
    );
  } finally {
    if (conversionStarted) {
      endConversion();
    }

    endUploadSession(sessionId);
  }
}
