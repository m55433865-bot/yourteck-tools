import { NextResponse } from "next/server";
import {
  getJpgUploadFile,
  JpgToPngError,
  saveAndConvertJpgToPng,
  validateJpgRequestContentLength,
} from "@/lib/server/jpg-to-png";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    validateJpgRequestContentLength(request);

    const formData = await request.formData();
    const file = getJpgUploadFile(formData);
    const result = await saveAndConvertJpgToPng(file);

    return NextResponse.json(
      {
        ok: true,
        image: result,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof JpgToPngError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status },
      );
    }

    console.error("JPG to PNG upload or conversion failed", error);

    return NextResponse.json(
      { ok: false, error: "JPG to PNG conversion failed. Please try again." },
      { status: 500 },
    );
  }
}
