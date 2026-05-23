import { NextResponse } from "next/server";
import {
  getPngUploadFile,
  getWhiteBackgroundOption,
  PngToJpgError,
  saveAndConvertPngToJpg,
  validatePngRequestContentLength,
} from "@/lib/server/png-to-jpg";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    validatePngRequestContentLength(request);

    const formData = await request.formData();
    const file = getPngUploadFile(formData);
    const whiteBackground = getWhiteBackgroundOption(formData);
    const result = await saveAndConvertPngToJpg(file, whiteBackground);

    return NextResponse.json(
      {
        ok: true,
        image: result,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof PngToJpgError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status },
      );
    }

    console.error("PNG to JPG upload or conversion failed", error);

    return NextResponse.json(
      { ok: false, error: "PNG to JPG conversion failed. Please try again." },
      { status: 500 },
    );
  }
}
