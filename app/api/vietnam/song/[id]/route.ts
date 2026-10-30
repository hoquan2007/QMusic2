import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import { ZingMp3 } from "zingmp3-api-full";
import { MusicTrack } from "@/types/music";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: PageProps) {
  const { id } = await params;
  const rawId = id.replace(/^zingmp3:/, "");

  try {
    const [infoRes, streamRes] = await Promise.all([
      ZingMp3.getInfoSong(rawId),
      ZingMp3.getSong(rawId).catch(() => null),
    ]);

    const t = infoRes?.data;
    if (!t) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    const artwork = t.thumbnailM || t.thumbnail || "/images/placeholder-track.svg";
    const directStream = streamRes?.data?.["128"];

    const track: MusicTrack = {
      id: `zingmp3:${rawId}`,
      rawId,
      provider: "zingmp3",
      title: t.title || "Bài hát",
      artist: {
        id: `zingmp3:${t.artists?.[0]?.id || "unknown"}`,
        rawId: t.artists?.[0]?.alias || "unknown",
        name: t.artistsNames || t.artists?.[0]?.name || "Nghệ sĩ",
        handle: t.artists?.[0]?.alias || "artist",
        avatarUrl: t.artists?.[0]?.thumbnail || artwork,
        isVerified: true,
      },
      duration: t.duration || 0,
      artworkUrl: artwork,
      artworkLargeUrl: artwork,
      streamUrl: directStream || `/api/tracks/stream?id=${rawId}`,
      isStreamable: !!directStream,
      genre: t.genre?.name || "Nhạc Việt",
      releaseDate: t.releaseDate ? new Date(t.releaseDate * 1000).toISOString() : undefined,
      playCount: t.listen || 0,
      favoriteCount: t.like || 0,
      license: {
        type: "Zing MP3 Standard",
        isCreativeCommons: false,
        attribution: t.artistsNames,
      },
    };

    return NextResponse.json({ data: track });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to get song info";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

