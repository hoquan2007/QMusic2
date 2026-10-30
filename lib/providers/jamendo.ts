import {
  MusicArtist,
  MusicPlaylist,
  MusicProvider,
  MusicTrack,
} from "@/types/music";
import { fetchWithRetry } from "../api/client";

const JAMENDO_BASE_URL = "https://api.jamendo.com/v3.0";

interface JamendoTrackRaw {
  id: string;
  name: string;
  duration: number;
  artist_id: string;
  artist_name: string;
  album_id?: string;
  album_name?: string;
  audio: string;
  audiodownload?: string;
  image?: string;
  shareurl?: string;
  license_ccurl?: string;
  releasedate?: string;
}

interface JamendoResponse<T> {
  headers: {
    status: string;
    code: number;
    error_message?: string;
  };
  results: T[];
}

export class JamendoProvider implements MusicProvider {
  name = "jamendo" as const;
  displayName = "Jamendo";
  private clientId: string | null;

  constructor() {
    this.clientId = process.env.JAMENDO_CLIENT_ID || null;
  }

  isConfigured(): boolean {
    return !!this.clientId && this.clientId.trim().length > 0;
  }

  private normalizeTrack(raw: JamendoTrackRaw): MusicTrack {
    return {
      id: `jamendo:${raw.id}`,
      rawId: raw.id,
      provider: "jamendo",
      title: raw.name,
      artist: {
        id: `jamendo:${raw.artist_id}`,
        rawId: raw.artist_id,
        name: raw.artist_name,
        handle: raw.artist_name.toLowerCase().replace(/\s+/g, ""),
      },
      duration: raw.duration,
      artworkUrl: raw.image || "/images/placeholder-track.svg",
      artworkLargeUrl: raw.image,
      streamUrl: raw.audio,
      isStreamable: !!raw.audio,
      releaseDate: raw.releasedate,
      playCount: 0,
      favoriteCount: 0,
      permalink: raw.shareurl,
      license: {
        type: "Creative Commons",
        isCreativeCommons: true,
        licenseUrl: raw.license_ccurl,
        attribution: raw.artist_name,
      },
    };
  }

  async getTrendingTracks(limit = 20, genre?: string): Promise<MusicTrack[]> {
    if (!this.isConfigured()) return [];

    const params = new URLSearchParams({
      client_id: this.clientId!,
      format: "jsonpretty",
      limit: String(limit),
      order: "popularity_total",
      include: "musicinfo",
    });
    if (genre && genre !== "Tất cả") {
      params.append("tags", genre.toLowerCase());
    }

    try {
      const res = await fetchWithRetry<JamendoResponse<JamendoTrackRaw>>(
        `${JAMENDO_BASE_URL}/tracks/?${params.toString()}`
      );
      return (res.results || []).map((t) => this.normalizeTrack(t));
    } catch {
      return [];
    }
  }

  async searchTracks(query: string, limit = 20): Promise<MusicTrack[]> {
    if (!this.isConfigured() || !query.trim()) return [];

    const params = new URLSearchParams({
      client_id: this.clientId!,
      format: "jsonpretty",
      limit: String(limit),
      search: query.trim(),
    });

    try {
      const res = await fetchWithRetry<JamendoResponse<JamendoTrackRaw>>(
        `${JAMENDO_BASE_URL}/tracks/?${params.toString()}`
      );
      return (res.results || []).map((t) => this.normalizeTrack(t));
    } catch {
      return [];
    }
  }

  async searchArtists(_query: string, _limit = 15): Promise<MusicArtist[]> {
    return [];
  }

  async searchPlaylists(_query: string, _limit = 15): Promise<MusicPlaylist[]> {
    return [];
  }

  async getTrack(trackId: string): Promise<MusicTrack | null> {
    if (!this.isConfigured()) return null;
    const rawId = trackId.replace(/^jamendo:/, "");
    const params = new URLSearchParams({
      client_id: this.clientId!,
      id: rawId,
    });

    try {
      const res = await fetchWithRetry<JamendoResponse<JamendoTrackRaw>>(
        `${JAMENDO_BASE_URL}/tracks/?${params.toString()}`
      );
      return res.results[0] ? this.normalizeTrack(res.results[0]) : null;
    } catch {
      return null;
    }
  }

  async getTrackStreamUrl(trackId: string): Promise<string | null> {
    const track = await this.getTrack(trackId);
    return track?.streamUrl || null;
  }

  async getArtist(_artistId: string): Promise<MusicArtist | null> {
    return null;
  }

  async getArtistTracks(_artistId: string, _limit = 30): Promise<MusicTrack[]> {
    return [];
  }

  async getPlaylist(_playlistId: string): Promise<MusicPlaylist | null> {
    return null;
  }

  async getTrendingPlaylists(_limit = 12): Promise<MusicPlaylist[]> {
    return [];
  }
}

