import { NextResponse } from "next/server";
import {
  getJpgToWebpUpload,
  JpgToWebpError,
  saveAndConvertJpgToWebp,
  validateJpgToWebpRequestContentLength,
} from "@/lib/server/jpg-to-webp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    validateJpgToWebpRequestContentLength(request);

    const formData = await request.formData();
    const upload = getJpgToWebpUpload(formData);
    const result = await saveAndConvertJpgToWebp(upload);

    return NextResponse.json(
      {
        ok: true,
        image: result,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof JpgToWebpError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status },
      );
    }

    console.error("JPG to WEBP upload or conversion failed", error);

    return NextResponse.json(
      { ok: false, error: "JPG to WEBP conversion failed. Please try again." },
      { status: 500 },
    );
  }
}
