import { NextResponse } from "next/server";
import {
  getPdfUploadFiles,
  mergePdfFiles,
  PdfMergeError,
  validatePdfMergeContentLength,
} from "@/lib/server/pdf-merge";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    validatePdfMergeContentLength(request);

    const formData = await request.formData();
    const files = getPdfUploadFiles(formData);
    const result = await mergePdfFiles(files);

    return NextResponse.json(
      {
        ok: true,
        pdf: result,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof PdfMergeError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status },
      );
    }

    console.error("PDF merge upload failed", error);

    return NextResponse.json(
      { ok: false, error: "PDF merge failed. Please try again." },
      { status: 500 },
    );
  }
}
