import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import { ZingMp3 } from "zingmp3-api-full";
import { MusicArtist, MusicTrack } from "@/types/music";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: PageProps) {
  const { id } = await params;
  const rawId = id.replace(/^zingmp3:/, "");

  try {
    const res = await ZingMp3.getArtist(rawId);
    const a = res?.data;
    if (!a) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    const artist: MusicArtist = {
      id: `zingmp3:${a.alias || a.id}`,
      rawId: a.alias || a.id,
      provider: "zingmp3",
      name: a.name || "Nghệ sĩ",
      handle: a.alias || "artist",
      avatarUrl: a.thumbnailM || a.thumbnail || "/images/placeholder-avatar.svg",
      bannerUrl: a.cover,
      bio: a.biography ? a.biography.replace(/<[^>]*>?/gm, "") : undefined,
      followerCount: a.totalFollow || 0,
      trackCount: 0,
      isVerified: true,
    };

    // Extract top songs from sections
    const songSection = a.sections?.find((s: any) => s.sectionType === "song" || s.title?.includes("Bài hát"));
    const rawSongs: any[] = songSection?.items || [];

    const tracks: MusicTrack[] = rawSongs.map((t: any) => {
      const artwork = t.thumbnailM || t.thumbnail || "/images/placeholder-track.svg";
      return {
        id: `zingmp3:${t.encodeId}`,
        rawId: t.encodeId,
        provider: "zingmp3",
        title: t.title || "Bài hát",
        artist: {
          id: `zingmp3:${a.alias || a.id}`,
          rawId: a.alias || a.id,
          name: a.name,
          handle: a.alias || "artist",
          avatarUrl: a.thumbnailM || a.thumbnail,
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

    return NextResponse.json({ data: { artist, tracks } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to get artist";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
