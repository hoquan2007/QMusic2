import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import { ZingMp3 } from "zingmp3-api-full";
import { MusicTrack } from "@/types/music";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "30", 10)));

  try {
    const res = await ZingMp3.getChartHome();
    const rawItems: any[] = res?.data?.RTChart?.items || [];

    const tracks: MusicTrack[] = rawItems.slice(0, limit).map((t: any) => {
      const rawId = t.encodeId;
      const artwork = t.thumbnailM || t.thumbnail || "/images/placeholder-track.svg";
      return {
        id: `zingmp3:${rawId}`,
        rawId,
        provider: "zingmp3",
        title: t.title || "Bài hát",
        artist: {
          id: `zingmp3:${t.artists?.[0]?.id || t.artists?.[0]?.link || "unknown"}`,
          rawId: t.artists?.[0]?.alias || t.artists?.[0]?.id || "unknown",
          name: t.artistsNames || t.artists?.[0]?.name || "Nghệ sĩ Việt Nam",
          handle: t.artists?.[0]?.alias || "artist",
          avatarUrl: t.artists?.[0]?.thumbnail || artwork,
          isVerified: true,
        },
        duration: t.duration || 0,
        artworkUrl: artwork,
        artworkLargeUrl: artwork,
        streamUrl: `/api/tracks/stream?id=${rawId}`,
        isStreamable: true,
        genre: "V-Pop / Nhạc Việt",
        playCount: t.listen || 0,
        favoriteCount: 0,
        license: {
          type: "Zing MP3 Official Standard",
          isCreativeCommons: false,
          attribution: t.artistsNames,
        },
      };
    });

    return NextResponse.json({ data: tracks });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch VN trending";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
