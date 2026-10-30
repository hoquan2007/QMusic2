import { NextRequest, NextResponse } from "next/server";
import { fetchLyrics } from "@/lib/lyrics/lrclib";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const title = searchParams.get("title") || "";
  const artist = searchParams.get("artist") || "";
  const duration = searchParams.get("duration")
    ? parseFloat(searchParams.get("duration")!)
    : undefined;

  if (!title.trim() || !artist.trim()) {
    return NextResponse.json({ error: "Missing title or artist" }, { status: 400 });
  }

  try {
    const lyrics = await fetchLyrics(title, artist, duration);
    return NextResponse.json({ data: lyrics });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch lyrics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

