import { NextResponse } from "next/server";
import {
  getWebpToJpgUploadFile,
  saveAndConvertWebpToJpg,
  validateWebpToJpgRequestContentLength,
  WebpToJpgError,
} from "@/lib/server/webp-to-jpg";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    validateWebpToJpgRequestContentLength(request);

    const formData = await request.formData();
    const file = getWebpToJpgUploadFile(formData);
    const result = await saveAndConvertWebpToJpg(file);

    return NextResponse.json(
      {
        ok: true,
        image: result,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof WebpToJpgError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status },
      );
    }

    console.error("WEBP to JPG upload or conversion failed", error);

    return NextResponse.json(
      { ok: false, error: "WEBP to JPG conversion failed. Please try again." },
      { status: 500 },
    );
  }
}
