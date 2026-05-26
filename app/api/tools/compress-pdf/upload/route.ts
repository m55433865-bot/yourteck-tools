import { NextResponse } from "next/server";
import {
  compressPdfFile,
  CompressPdfError,
  getCompressPdfUpload,
  validateCompressPdfContentLength,
} from "@/lib/server/compress-pdf";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    validateCompressPdfContentLength(request);

    const formData = await request.formData();
    const upload = getCompressPdfUpload(formData);
    const result = await compressPdfFile(upload);

    return NextResponse.json(
      {
        ok: true,
        pdf: result,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof CompressPdfError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status },
      );
    }

    console.error("PDF compression upload failed", error);

    return NextResponse.json(
      { ok: false, error: "PDF compression failed. Please try again." },
      { status: 500 },
    );
  }
}
