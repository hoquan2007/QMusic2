import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import { ZingMp3 } from "zingmp3-api-full";
import { MusicTrack, MusicArtist, MusicPlaylist, SearchResult } from "@/types/music";

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
    const res = await ZingMp3.search(query.trim());
    const data = res?.data || {};

    const rawSongs: any[] = data.songs || [];
    const rawArtists: any[] = data.artists || [];
    const rawPlaylists: any[] = data.playlists || [];

    const tracks: MusicTrack[] = rawSongs.slice(0, limit).map((t: any) => {
      const rawId = t.encodeId;
      const artwork = t.thumbnailM || t.thumbnail || "/images/placeholder-track.svg";
      return {
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
        streamUrl: `/api/tracks/stream?id=${rawId}`,
        isStreamable: true,
        genre: "Nhạc Việt",
        playCount: 0,
        favoriteCount: 0,
        license: {
          type: "Zing MP3 Standard",
          isCreativeCommons: false,
          attribution: t.artistsNames,
        },
      };
    });

    const artists: MusicArtist[] = rawArtists.slice(0, 10).map((a: any) => ({
      id: `zingmp3:${a.alias || a.id}`,
      rawId: a.alias || a.id,
      provider: "zingmp3",
      name: a.name,
      handle: a.alias || a.name,
      avatarUrl: a.thumbnailM || a.thumbnail || "/images/placeholder-avatar.svg",
      followerCount: a.totalFollow || 0,
      trackCount: 0,
      isVerified: true,
    }));

    const playlists: MusicPlaylist[] = rawPlaylists.slice(0, 10).map((p: any) => ({
      id: `zingmp3:${p.encodeId}`,
      rawId: p.encodeId,
      provider: "zingmp3",
      title: p.title,
      description: p.sortDescription,
      artworkUrl: p.thumbnailM || p.thumbnail || "/images/placeholder-playlist.svg",
      ownerName: p.artistsNames || "Zing MP3",
      trackCount: p.song?.total || 0,
      isPublic: true,
    }));

    const result: SearchResult = {
      tracks,
      artists,
      playlists,
      query,
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

