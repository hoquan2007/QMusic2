/**
 * Universal Music Provider and Domain Models for QMusic
 */

export type MusicProviderType = "audius" | "jamendo" | "custom";

export interface MusicLicenseInfo {
  type: string;
  isCreativeCommons: boolean;
  licenseUrl?: string;
  attribution?: string;
}

export interface PlaybackSource {
  streamUrl: string;
  format?: string;
  bitrate?: number;
  duration: number;
  expiresAt?: number;
}

export interface MusicArtist {
  id: string; // Uniform ID: e.g. "audius:707937"
  rawId: string | number;
  provider: MusicProviderType;
  name: string;
  handle: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  location?: string;
  followerCount: number;
  trackCount: number;
  isVerified: boolean;
  websiteUrl?: string;
  permalink?: string;
}

export interface MusicTrack {
  id: string; // Uniform ID: e.g. "audius:W08NKdZ"
  rawId: string | number;
  provider: MusicProviderType;
  title: string;
  artist: {
    id: string;
    rawId: string | number;
    name: string;
    handle: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  album?: {
    id: string;
    title: string;
    artworkUrl?: string;
  };
  duration: number; // in seconds
  artworkUrl?: string;
  artworkLargeUrl?: string;
  streamUrl: string;
  isStreamable: boolean;
  genre?: string;
  mood?: string;
  releaseDate?: string;
  playCount: number;
  favoriteCount: number;
  repostCount?: number;
  permalink?: string;
  license?: MusicLicenseInfo;
}

export interface MusicAlbum {
  id: string;
  rawId: string | number;
  provider: MusicProviderType;
  title: string;
  artist: {
    id: string;
    name: string;
    handle: string;
  };
  artworkUrl?: string;
  releaseDate?: string;
  trackCount: number;
  tracks?: MusicTrack[];
}

export interface MusicPlaylist {
  id: string; // e.g. "audius:VpVPKGB" or "local:playlist_123"
  rawId: string | number;
  provider: MusicProviderType | "local";
  title: string;
  description?: string;
  artworkUrl?: string;
  ownerName: string;
  ownerId?: string;
  trackCount: number;
  isAlbum?: boolean;
  isPublic?: boolean;
  tracks?: MusicTrack[];
  updatedAt?: string;
}

export interface SearchResult {
  tracks: MusicTrack[];
  artists: MusicArtist[];
  playlists: MusicPlaylist[];
  query: string;
}

export interface LyricLine {
  timeMs: number; // in milliseconds
  text: string;
}

export interface SyncedLyrics {
  isSynced: boolean;
  plainLyrics?: string;
  lines: LyricLine[];
  source: string;
  instrumental?: boolean;
}

/**
 * Common Provider Abstraction
 */
export interface MusicProvider {
  name: MusicProviderType;
  displayName: string;
  isConfigured(): boolean;
  getTrendingTracks(limit?: number, genre?: string): Promise<MusicTrack[]>;
  searchTracks(query: string, limit?: number): Promise<MusicTrack[]>;
  searchArtists(query: string, limit?: number): Promise<MusicArtist[]>;
  searchPlaylists(query: string, limit?: number): Promise<MusicPlaylist[]>;
  getTrack(trackId: string): Promise<MusicTrack | null>;
  getTrackStreamUrl(trackId: string): Promise<string | null>;
  getArtist(artistId: string): Promise<MusicArtist | null>;
  getArtistTracks(artistId: string, limit?: number): Promise<MusicTrack[]>;
  getPlaylist(playlistId: string): Promise<MusicPlaylist | null>;
  getTrendingPlaylists(limit?: number): Promise<MusicPlaylist[]>;
}

