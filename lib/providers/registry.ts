import {
  MusicArtist,
  MusicPlaylist,
  MusicProvider,
  MusicTrack,
  SearchResult,
} from "@/types/music";
import { AudiusProvider } from "./audius";
import { JamendoProvider } from "./jamendo";

class ProviderRegistry {
  private audius: AudiusProvider;
  private jamendo: JamendoProvider;

  constructor() {
    this.audius = new AudiusProvider();
    this.jamendo = new JamendoProvider();
  }

  getPrimaryProvider(): MusicProvider {
    return this.audius;
  }

  getProviderForTrack(trackId: string): MusicProvider {
    if (trackId.startsWith("jamendo:") && this.jamendo.isConfigured()) {
      return this.jamendo;
    }
    return this.audius;
  }

  async getTrendingTracks(limit = 20, genre?: string): Promise<MusicTrack[]> {
    // Primary: Audius
    const tracks = await this.audius.getTrendingTracks(limit, genre);
    if (this.jamendo.isConfigured() && tracks.length < limit) {
      try {
        const jamendoTracks = await this.jamendo.getTrendingTracks(
          limit - tracks.length,
          genre
        );
        return [...tracks, ...jamendoTracks];
      } catch {
        // Fallback to audius only
      }
    }
    return tracks;
  }

  async searchAll(query: string, limit = 20): Promise<SearchResult> {
    const [tracks, artists, playlists] = await Promise.all([
      this.audius.searchTracks(query, limit),
      this.audius.searchArtists(query, 12),
      this.audius.searchPlaylists(query, 12),
    ]);

    if (this.jamendo.isConfigured()) {
      try {
        const jamendoTracks = await this.jamendo.searchTracks(query, 10);
        tracks.push(...jamendoTracks);
      } catch {
        // ignore
      }
    }

    return {
      tracks,
      artists,
      playlists,
      query,
    };
  }

  async getTrack(trackId: string): Promise<MusicTrack | null> {
    const provider = this.getProviderForTrack(trackId);
    return provider.getTrack(trackId);
  }

  async getArtist(artistId: string): Promise<MusicArtist | null> {
    return this.audius.getArtist(artistId);
  }

  async getArtistTracks(artistId: string, limit = 30): Promise<MusicTrack[]> {
    return this.audius.getArtistTracks(artistId, limit);
  }

  async getPlaylist(playlistId: string): Promise<MusicPlaylist | null> {
    return this.audius.getPlaylist(playlistId);
  }

  async getTrendingPlaylists(limit = 12): Promise<MusicPlaylist[]> {
    return this.audius.getTrendingPlaylists(limit);
  }
}

export const musicRegistry = new ProviderRegistry();

