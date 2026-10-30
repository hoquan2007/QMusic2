import {
  MusicArtist,
  MusicPlaylist,
  MusicProvider,
  MusicTrack,
} from "@/types/music";
import { fetchWithRetry } from "../api/client";

export class ZingMp3Provider implements MusicProvider {
  name = "zingmp3" as const;
  displayName = "Zing MP3 (Nhạc Việt)";

  isConfigured(): boolean {
    return true;
  }

  private getBaseUrl(): string {
    if (typeof window !== "undefined") {
      return "";
    }
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }

  async getTrendingTracks(limit = 30): Promise<MusicTrack[]> {
    try {
      const res = await fetchWithRetry<{ data: MusicTrack[] }>(
        `${this.getBaseUrl()}/api/vietnam/trending?limit=${limit}`
      );
      return res.data || [];
    } catch (err) {
      console.warn("ZingMp3 getTrendingTracks failed:", err);
      return [];
    }
  }

  async searchTracks(query: string, limit = 20): Promise<MusicTrack[]> {
    if (!query.trim()) return [];
    try {
      const res = await fetchWithRetry<{ tracks: MusicTrack[] }>(
        `${this.getBaseUrl()}/api/vietnam/search?query=${encodeURIComponent(query)}&limit=${limit}`
      );
      return res.tracks || [];
    } catch {
      return [];
    }
  }

  async searchArtists(query: string, limit = 10): Promise<MusicArtist[]> {
    if (!query.trim()) return [];
    try {
      const res = await fetchWithRetry<{ artists: MusicArtist[] }>(
        `${this.getBaseUrl()}/api/vietnam/search?query=${encodeURIComponent(query)}&limit=${limit}`
      );
      return res.artists || [];
    } catch {
      return [];
    }
  }

  async searchPlaylists(query: string, limit = 10): Promise<MusicPlaylist[]> {
    if (!query.trim()) return [];
    try {
      const res = await fetchWithRetry<{ playlists: MusicPlaylist[] }>(
        `${this.getBaseUrl()}/api/vietnam/search?query=${encodeURIComponent(query)}&limit=${limit}`
      );
      return res.playlists || [];
    } catch {
      return [];
    }
  }

  async getTrack(trackId: string): Promise<MusicTrack | null> {
    const rawId = trackId.replace(/^zingmp3:/, "");
    try {
      const res = await fetchWithRetry<{ data: MusicTrack }>(
        `${this.getBaseUrl()}/api/vietnam/song/${rawId}`
      );
      return res.data || null;
    } catch {
      return null;
    }
  }

  async getTrackStreamUrl(trackId: string): Promise<string | null> {
    const rawId = trackId.replace(/^zingmp3:/, "");
    return `${this.getBaseUrl()}/api/tracks/stream?id=${rawId}`;
  }

  async getArtist(artistId: string): Promise<MusicArtist | null> {
    const rawId = artistId.replace(/^zingmp3:/, "");
    try {
      const res = await fetchWithRetry<{ data: { artist: MusicArtist } }>(
        `${this.getBaseUrl()}/api/vietnam/artist/${rawId}`
      );
      return res.data?.artist || null;
    } catch {
      return null;
    }
  }

  async getArtistTracks(artistId: string, _limit = 30): Promise<MusicTrack[]> {
    const rawId = artistId.replace(/^zingmp3:/, "");
    try {
      const res = await fetchWithRetry<{ data: { tracks: MusicTrack[] } }>(
        `${this.getBaseUrl()}/api/vietnam/artist/${rawId}`
      );
      return res.data?.tracks || [];
    } catch {
      return [];
    }
  }

  async getPlaylist(playlistId: string): Promise<MusicPlaylist | null> {
    const rawId = playlistId.replace(/^zingmp3:/, "");
    try {
      const res = await fetchWithRetry<{ data: MusicPlaylist }>(
        `${this.getBaseUrl()}/api/vietnam/playlist/${rawId}`
      );
      return res.data || null;
    } catch {
      return null;
    }
  }

  async getTrendingPlaylists(_limit = 12): Promise<MusicPlaylist[]> {
    return [];
  }
}
