import { NextResponse } from "next/server";
import {
  getTemporaryMp3Download,
  UploadValidationError,
} from "@/lib/server/uploads";

export const runtime = "nodejs";

type DownloadContext = {
  params: Promise<{
    file: string;
  }>;
};

export async function GET(_request: Request, context: DownloadContext) {
  try {
    const { file } = await context.params;
    const download = await getTemporaryMp3Download(file);

    if (!download) {
      return NextResponse.json(
        { ok: false, error: "Download file was not found." },
        { status: 404 },
      );
    }

    return new Response(download.stream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(download.size),
        "Content-Disposition": `attachment; filename="${download.fileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { ok: false, error: "Download failed. Please try again." },
      { status: 500 },
    );
  }
}
