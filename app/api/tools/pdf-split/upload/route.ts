import { NextResponse } from "next/server";
import {
  getPdfSplitUpload,
  PdfSplitError,
  splitPdfFile,
  validatePdfSplitContentLength,
} from "@/lib/server/pdf-split";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    validatePdfSplitContentLength(request);

    const formData = await request.formData();
    const upload = getPdfSplitUpload(formData);
    const result = await splitPdfFile(upload);

    return NextResponse.json(
      {
        ok: true,
        pdf: result,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof PdfSplitError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status },
      );
    }

    console.error("PDF split upload failed", error);

    return NextResponse.json(
      { ok: false, error: "PDF split failed. Please try again." },
      { status: 500 },
    );
  }
}
