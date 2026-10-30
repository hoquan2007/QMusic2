import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import { ZingMp3 } from "zingmp3-api-full";
import { MusicPlaylist, MusicTrack } from "@/types/music";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: PageProps) {
  const { id } = await params;
  const rawId = id.replace(/^zingmp3:/, "");

  try {
    const res = await ZingMp3.getDetailPlaylist(rawId);
    const p = res?.data;
    if (!p) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    const rawSongs: any[] = p.song?.items || [];
    const tracks: MusicTrack[] = rawSongs.map((t: any) => {
      const artwork = t.thumbnailM || t.thumbnail || "/images/placeholder-track.svg";
      return {
        id: `zingmp3:${t.encodeId}`,
        rawId: t.encodeId,
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
        streamUrl: `/api/tracks/stream?id=${t.encodeId}`,
        isStreamable: true,
        genre: "Nhạc Việt",
        playCount: t.listen || 0,
        favoriteCount: 0,
      };
    });

    const playlist: MusicPlaylist = {
      id: `zingmp3:${rawId}`,
      rawId,
      provider: "zingmp3",
      title: p.title || "Danh sách phát",
      description: p.description || p.sortDescription,
      artworkUrl: p.thumbnailM || p.thumbnail || "/images/placeholder-playlist.svg",
      ownerName: p.artistsNames || "Zing MP3",
      trackCount: tracks.length,
      isPublic: true,
      tracks,
    };

    return NextResponse.json({ data: playlist });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to get playlist";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

