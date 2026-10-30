import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import { ZingMp3 } from "zingmp3-api-full";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing song id" }, { status: 400 });
  }

  const rawId = id.replace(/^zingmp3:/, "");

  try {
    const songData = await ZingMp3.getSong(rawId);
    const streamUrl = songData?.data?.["128"];

    if (!streamUrl) {
      return NextResponse.json(
        { error: "Audio stream not available or VIP restricted" },
        { status: 404 }
      );
    }

    // Redirect to the actual CDN stream URL
    return NextResponse.redirect(streamUrl, 302);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to resolve stream";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
