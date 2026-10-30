import {
  MusicArtist,
  MusicPlaylist,
  MusicProvider,
  MusicTrack,
} from "@/types/music";
import { fetchWithRetry } from "../api/client";

const DEFAULT_AUDIUS_HOST = "https://api.audius.co";
const APP_NAME = process.env.NEXT_PUBLIC_AUDIUS_APP_NAME || "QMusic";

interface AudiusUserRaw {
  id: string;
  user_id?: number;
  name: string;
  handle: string;
  bio?: string;
  location?: string;
  follower_count?: number;
  track_count?: number;
  is_verified?: boolean;
  profile_picture?: {
    "150x150"?: string;
    "480x480"?: string;
    "1000x1000"?: string;
  };
  cover_photo?: {
    "640x"?: string;
    "2000x"?: string;
  };
  website?: string;
}

interface AudiusTrackRaw {
  id: string;
  track_id?: number;
  title: string;
  duration: number;
  genre?: string;
  mood?: string;
  play_count?: number;
  favorite_count?: number;
  repost_count?: number;
  release_date?: string;
  permalink?: string;
  is_streamable?: boolean;
  artwork?: {
    "150x150"?: string;
    "480x480"?: string;
    "1000x1000"?: string;
  };
  user?: AudiusUserRaw;
  stream?: {
    url?: string;
  };
}

interface AudiusPlaylistRaw {
  id: string;
  playlist_id?: number;
  playlist_name: string;
  description?: string;
  track_count?: number;
  is_album?: boolean;
  artwork?: {
    "150x150"?: string;
    "480x480"?: string;
    "1000x1000"?: string;
  };
  user?: AudiusUserRaw;
  tracks?: AudiusTrackRaw[];
  updated_at?: string;
}

interface AudiusApiResponse<T> {
  data: T;
}

export class AudiusProvider implements MusicProvider {
  name = "audius" as const;
  displayName = "Audius";

  private getBaseUrl(): string {
    return DEFAULT_AUDIUS_HOST;
  }

  isConfigured(): boolean {
    return true; // Read-only access with app_name is always available
  }

  private normalizeTrack(track: AudiusTrackRaw): MusicTrack {
    const rawId = track.id || String(track.track_id || "");
    const artworkUrl =
      track.artwork?.["480x480"] ||
      track.artwork?.["150x150"] ||
      track.artwork?.["1000x1000"] ||
      "/images/placeholder-track.svg";
    const artworkLargeUrl =
      track.artwork?.["1000x1000"] ||
      track.artwork?.["480x480"] ||
      artworkUrl;

    // Use direct stream or official stream redirect endpoint
    const streamUrl =
      track.stream?.url ||
      `${DEFAULT_AUDIUS_HOST}/v1/tracks/${rawId}/stream?app_name=${APP_NAME}`;

    return {
      id: `audius:${rawId}`,
      rawId,
      provider: "audius",
      title: track.title || "Bài hát không tên",
      artist: {
        id: `audius:${track.user?.id || track.user?.user_id || "unknown"}`,
        rawId: track.user?.id || track.user?.user_id || "unknown",
        name: track.user?.name || "Nghệ sĩ chưa rõ",
        handle: track.user?.handle || "artist",
        avatarUrl:
          track.user?.profile_picture?.["150x150"] ||
          track.user?.profile_picture?.["480x480"] ||
          "/images/placeholder-avatar.svg",
        isVerified: !!track.user?.is_verified,
      },
      duration: Math.max(0, track.duration || 0),
      artworkUrl,
      artworkLargeUrl,
      streamUrl,
      isStreamable: track.is_streamable !== false,
      genre: track.genre || undefined,
      mood: track.mood || undefined,
      releaseDate: track.release_date || undefined,
      playCount: track.play_count || 0,
      favoriteCount: track.favorite_count || 0,
      repostCount: track.repost_count || 0,
      permalink: track.permalink
        ? `https://audius.co${track.permalink}`
        : undefined,
      license: {
        type: "Audius Stream License",
        isCreativeCommons: false,
        attribution: track.user?.name,
      },
    };
  }

  private normalizeArtist(user: AudiusUserRaw): MusicArtist {
    const rawId = user.id || String(user.user_id || "");
    const avatarUrl =
      user.profile_picture?.["480x480"] ||
      user.profile_picture?.["150x150"] ||
      user.profile_picture?.["1000x1000"] ||
      "/images/placeholder-avatar.svg";
    const bannerUrl =
      user.cover_photo?.["2000x"] ||
      user.cover_photo?.["640x"] ||
      undefined;

    return {
      id: `audius:${rawId}`,
      rawId,
      provider: "audius",
      name: user.name || "Nghệ sĩ",
      handle: user.handle || "user",
      avatarUrl,
      bannerUrl,
      bio: user.bio || undefined,
      location: user.location || undefined,
      followerCount: user.follower_count || 0,
      trackCount: user.track_count || 0,
      isVerified: !!user.is_verified,
      websiteUrl: user.website || undefined,
      permalink: user.handle ? `https://audius.co/${user.handle}` : undefined,
    };
  }

  private normalizePlaylist(playlist: AudiusPlaylistRaw): MusicPlaylist {
    const rawId = playlist.id || String(playlist.playlist_id || "");
    const artworkUrl =
      playlist.artwork?.["480x480"] ||
      playlist.artwork?.["150x150"] ||
      playlist.artwork?.["1000x1000"] ||
      "/images/placeholder-playlist.svg";

    return {
      id: `audius:${rawId}`,
      rawId,
      provider: "audius",
      title: playlist.playlist_name || "Danh sách phát",
      description: playlist.description || undefined,
      artworkUrl,
      ownerName: playlist.user?.name || "Audius Curator",
      ownerId: playlist.user?.id || String(playlist.user?.user_id || ""),
      trackCount: playlist.track_count || playlist.tracks?.length || 0,
      isAlbum: !!playlist.is_album,
      isPublic: true,
      tracks: playlist.tracks?.map((t) => this.normalizeTrack(t)),
      updatedAt: playlist.updated_at || undefined,
    };
  }

  async getTrendingTracks(limit = 20, genre?: string): Promise<MusicTrack[]> {
    const params = new URLSearchParams({
      app_name: APP_NAME,
      limit: String(limit),
    });
    if (genre && genre !== "Tất cả") {
      params.append("genre", genre);
    }

    const url = `${DEFAULT_AUDIUS_HOST}/v1/tracks/trending?${params.toString()}`;
    const res = await fetchWithRetry<AudiusApiResponse<AudiusTrackRaw[]>>(url);
    return (res.data || []).map((t) => this.normalizeTrack(t));
  }

  async searchTracks(query: string, limit = 20): Promise<MusicTrack[]> {
    if (!query.trim()) return [];
    const params = new URLSearchParams({
      query: query.trim(),
      app_name: APP_NAME,
      limit: String(limit),
    });
    const url = `${DEFAULT_AUDIUS_HOST}/v1/tracks/search?${params.toString()}`;
    const res = await fetchWithRetry<AudiusApiResponse<AudiusTrackRaw[]>>(url);
    return (res.data || []).map((t) => this.normalizeTrack(t));
  }

  async searchArtists(query: string, limit = 15): Promise<MusicArtist[]> {
    if (!query.trim()) return [];
    const params = new URLSearchParams({
      query: query.trim(),
      app_name: APP_NAME,
      limit: String(limit),
    });
    const url = `${DEFAULT_AUDIUS_HOST}/v1/users/search?${params.toString()}`;
    const res = await fetchWithRetry<AudiusApiResponse<AudiusUserRaw[]>>(url);
    return (res.data || []).map((u) => this.normalizeArtist(u));
  }

  async searchPlaylists(query: string, limit = 15): Promise<MusicPlaylist[]> {
    if (!query.trim()) return [];
    const params = new URLSearchParams({
      query: query.trim(),
      app_name: APP_NAME,
      limit: String(limit),
    });
    const url = `${DEFAULT_AUDIUS_HOST}/v1/playlists/search?${params.toString()}`;
    const res = await fetchWithRetry<AudiusApiResponse<AudiusPlaylistRaw[]>>(url);
    return (res.data || []).map((p) => this.normalizePlaylist(p));
  }

  async getTrack(trackId: string): Promise<MusicTrack | null> {
    const rawId = trackId.replace(/^audius:/, "");
    const url = `${DEFAULT_AUDIUS_HOST}/v1/tracks/${rawId}?app_name=${APP_NAME}`;
    try {
      const res = await fetchWithRetry<AudiusApiResponse<AudiusTrackRaw>>(url);
      if (!res.data) return null;
      return this.normalizeTrack(res.data);
    } catch {
      return null;
    }
  }

  async getTrackStreamUrl(trackId: string): Promise<string | null> {
    const rawId = trackId.replace(/^audius:/, "");
    return `${DEFAULT_AUDIUS_HOST}/v1/tracks/${rawId}/stream?app_name=${APP_NAME}`;
  }

  async getArtist(artistId: string): Promise<MusicArtist | null> {
    const rawId = artistId.replace(/^audius:/, "");
    const url = `${DEFAULT_AUDIUS_HOST}/v1/users/${rawId}?app_name=${APP_NAME}`;
    try {
      const res = await fetchWithRetry<AudiusApiResponse<AudiusUserRaw>>(url);
      if (!res.data) return null;
      return this.normalizeArtist(res.data);
    } catch {
      return null;
    }
  }

  async getArtistTracks(artistId: string, limit = 30): Promise<MusicTrack[]> {
    const rawId = artistId.replace(/^audius:/, "");
    const url = `${DEFAULT_AUDIUS_HOST}/v1/users/${rawId}/tracks?app_name=${APP_NAME}&limit=${limit}`;
    try {
      const res = await fetchWithRetry<AudiusApiResponse<AudiusTrackRaw[]>>(url);
      return (res.data || []).map((t) => this.normalizeTrack(t));
    } catch {
      return [];
    }
  }

  async getPlaylist(playlistId: string): Promise<MusicPlaylist | null> {
    const rawId = playlistId.replace(/^audius:/, "");
    const url = `${DEFAULT_AUDIUS_HOST}/v1/playlists/${rawId}?app_name=${APP_NAME}`;
    try {
      const res = await fetchWithRetry<AudiusApiResponse<AudiusPlaylistRaw[] | AudiusPlaylistRaw>>(url);
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      if (!data) return null;

      // If tracks are not embedded, fetch /tracks
      let playlistNormalized = this.normalizePlaylist(data);
      if (!playlistNormalized.tracks || playlistNormalized.tracks.length === 0) {
        const tracksUrl = `${DEFAULT_AUDIUS_HOST}/v1/playlists/${rawId}/tracks?app_name=${APP_NAME}`;
        try {
          const tracksRes = await fetchWithRetry<AudiusApiResponse<AudiusTrackRaw[]>>(tracksUrl);
          playlistNormalized.tracks = (tracksRes.data || []).map((t) => this.normalizeTrack(t));
        } catch {
          // ignore track fetch error
        }
      }
      return playlistNormalized;
    } catch {
      return null;
    }
  }

  async getTrendingPlaylists(limit = 12): Promise<MusicPlaylist[]> {
    const url = `${DEFAULT_AUDIUS_HOST}/v1/playlists/trending?app_name=${APP_NAME}&limit=${limit}`;
    try {
      const res = await fetchWithRetry<AudiusApiResponse<AudiusPlaylistRaw[]>>(url);
      return (res.data || []).map((p) => this.normalizePlaylist(p));
    } catch {
      return [];
    }
  }
}
