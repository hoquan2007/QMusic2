import { NextRequest, NextResponse } from "next/server";
import { musicRegistry } from "@/lib/providers/registry";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query") || searchParams.get("q") || "";
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

  if (!query.trim()) {
    return NextResponse.json({
      tracks: [],
      artists: [],
      playlists: [],
      query: "",
    });
  }

  try {
    const results = await musicRegistry.searchAll(query, limit);
    return NextResponse.json(results);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

