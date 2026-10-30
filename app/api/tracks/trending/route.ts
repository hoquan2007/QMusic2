import { NextRequest, NextResponse } from "next/server";
import { musicRegistry } from "@/lib/providers/registry";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const genre = searchParams.get("genre") || undefined;
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "24", 10)));

  try {
    const tracks = await musicRegistry.getTrendingTracks(limit, genre);
    return NextResponse.json({ data: tracks });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch trending tracks";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

