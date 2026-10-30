import {
  MusicArtist,
  MusicPlaylist,
  MusicProvider,
  MusicTrack,
  SearchResult,
} from "@/types/music";
import { AudiusProvider } from "./audius";
import { JamendoProvider } from "./jamendo";
import { ZingMp3Provider } from "./zingmp3";

class ProviderRegistry {
  private audius: AudiusProvider;
  private jamendo: JamendoProvider;
  private zingmp3: ZingMp3Provider;

  constructor() {
    this.audius = new AudiusProvider();
    this.jamendo = new JamendoProvider();
    this.zingmp3 = new ZingMp3Provider();
  }

  getPrimaryProvider(): MusicProvider {
    return this.audius;
  }

  getVietnameseProvider(): ZingMp3Provider {
    return this.zingmp3;
  }

  getProviderForTrack(trackId: string): MusicProvider {
    if (trackId.startsWith("zingmp3:")) {
      return this.zingmp3;
    }
    if (trackId.startsWith("jamendo:") && this.jamendo.isConfigured()) {
      return this.jamendo;
    }
    return this.audius;
  }

  async getVietnameseTrendingTracks(limit = 24): Promise<MusicTrack[]> {
    return this.zingmp3.getTrendingTracks(limit);
  }

  async getTrendingTracks(limit = 20, genre?: string): Promise<MusicTrack[]> {
    if (genre === "V-Pop / Nhạc Việt" || genre === "Nhạc Việt") {
      return this.zingmp3.getTrendingTracks(limit);
    }

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
    const [audiusResults, vnResults] = await Promise.all([
      Promise.all([
        this.audius.searchTracks(query, limit),
        this.audius.searchArtists(query, 8),
        this.audius.searchPlaylists(query, 8),
      ]),
      Promise.all([
        this.zingmp3.searchTracks(query, limit),
        this.zingmp3.searchArtists(query, 8),
        this.zingmp3.searchPlaylists(query, 8),
      ]).catch(() => [[], [], []]),
    ]);

    const [tracks, artists, playlists] = audiusResults;
    const [vnTracks, vnArtists, vnPlaylists] = vnResults;

    // Prioritize Vietnamese tracks if query contains Vietnamese terms, or interleave results
    const combinedTracks = [...(vnTracks || []), ...tracks].slice(0, limit);
    const combinedArtists = [...(vnArtists || []), ...artists].slice(0, 12);
    const combinedPlaylists = [...(vnPlaylists || []), ...playlists].slice(0, 12);

    return {
      tracks: combinedTracks,
      artists: combinedArtists,
      playlists: combinedPlaylists,
      query,
    };
  }

  async getTrack(trackId: string): Promise<MusicTrack | null> {
    if (trackId.startsWith("zingmp3:")) {
      return this.zingmp3.getTrack(trackId);
    }
    if (trackId.startsWith("audius:")) {
      return this.audius.getTrack(trackId);
    }
    if (trackId.startsWith("jamendo:")) {
      return this.jamendo.getTrack(trackId);
    }

    // If bare ID, try Zing MP3 then Audius
    const vnTrack = await this.zingmp3.getTrack(`zingmp3:${trackId}`);
    if (vnTrack) return vnTrack;
    return this.audius.getTrack(`audius:${trackId}`);
  }

  async getArtist(artistId: string): Promise<MusicArtist | null> {
    if (artistId.startsWith("zingmp3:")) {
      return this.zingmp3.getArtist(artistId);
    }
    if (artistId.startsWith("audius:")) {
      return this.audius.getArtist(artistId);
    }
    const vnArtist = await this.zingmp3.getArtist(`zingmp3:${artistId}`);
    if (vnArtist) return vnArtist;
    return this.audius.getArtist(`audius:${artistId}`);
  }

  async getArtistTracks(artistId: string, limit = 30): Promise<MusicTrack[]> {
    if (artistId.startsWith("zingmp3:")) {
      return this.zingmp3.getArtistTracks(artistId, limit);
    }
    if (artistId.startsWith("audius:")) {
      return this.audius.getArtistTracks(artistId, limit);
    }
    const vnTracks = await this.zingmp3.getArtistTracks(`zingmp3:${artistId}`, limit);
    if (vnTracks.length > 0) return vnTracks;
    return this.audius.getArtistTracks(`audius:${artistId}`, limit);
  }

  async getPlaylist(playlistId: string): Promise<MusicPlaylist | null> {
    if (playlistId.startsWith("zingmp3:")) {
      return this.zingmp3.getPlaylist(playlistId);
    }
    if (playlistId.startsWith("audius:")) {
      return this.audius.getPlaylist(playlistId);
    }
    const vnPl = await this.zingmp3.getPlaylist(`zingmp3:${playlistId}`);
    if (vnPl) return vnPl;
    return this.audius.getPlaylist(`audius:${playlistId}`);
  }

  async getTrendingPlaylists(limit = 12): Promise<MusicPlaylist[]> {
    return this.audius.getTrendingPlaylists(limit);
  }
}

export const musicRegistry = new ProviderRegistry();
