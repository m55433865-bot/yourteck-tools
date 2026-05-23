import { NextResponse } from "next/server";
import {
  getImageUploadFile,
  ImageCompressionError,
  saveAndCompressImage,
  validateImageRequestContentLength,
} from "@/lib/server/image-compressor";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    validateImageRequestContentLength(request);

    const formData = await request.formData();
    const file = getImageUploadFile(formData);
    const result = await saveAndCompressImage(file);

    return NextResponse.json(
      {
        ok: true,
        image: result,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ImageCompressionError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status },
      );
    }

    console.error("Image upload or compression failed", error);

    return NextResponse.json(
      { ok: false, error: "Image compression failed. Please try again." },
      { status: 500 },
    );
  }
}
