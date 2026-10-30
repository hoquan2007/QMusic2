import { MusicTrack } from "@/types/music";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserCustomPlaylist {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  tracks: MusicTrack[];
}

export interface HistoryItem {
  track: MusicTrack;
  playedAt: string;
}

export interface LibraryState {
  favorites: MusicTrack[];
  playlists: UserCustomPlaylist[];
  history: HistoryItem[];
  theme: "dark" | "light" | "system";
  autoAdvance: boolean;

  // Actions
  toggleFavorite: (track: MusicTrack) => void;
  isFavorite: (trackId: string) => boolean;

  createPlaylist: (name: string, description?: string) => string;
  renamePlaylist: (id: string, name: string, description?: string) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, track: MusicTrack) => boolean;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  reorderTrackInPlaylist: (playlistId: string, startIndex: number, endIndex: number) => void;

  addToHistory: (track: MusicTrack) => void;
  clearHistory: () => void;

  setTheme: (theme: "dark" | "light" | "system") => void;
  setAutoAdvance: (enabled: boolean) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      favorites: [],
      playlists: [],
      history: [],
      theme: "dark",
      autoAdvance: true,

      toggleFavorite: (track) => {
        const { favorites } = get();
        const exists = favorites.some((t) => t.id === track.id);
        if (exists) {
          set({ favorites: favorites.filter((t) => t.id !== track.id) });
        } else {
          set({ favorites: [track, ...favorites] });
        }
      },

      isFavorite: (trackId) => {
        return get().favorites.some((t) => t.id === trackId);
      },

      createPlaylist: (name, description) => {
        const id = `local_pl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const now = new Date().toISOString();
        const newPlaylist: UserCustomPlaylist = {
          id,
          name: name.trim() || "Danh sách phát mới",
          description: description?.trim() || "",
          createdAt: now,
          updatedAt: now,
          tracks: [],
        };
        set({ playlists: [newPlaylist, ...get().playlists] });
        return id;
      },

      renamePlaylist: (id, name, description) => {
        const { playlists } = get();
        const now = new Date().toISOString();
        set({
          playlists: playlists.map((pl) =>
            pl.id === id
              ? {
                  ...pl,
                  name: name.trim() || pl.name,
                  description: description !== undefined ? description.trim() : pl.description,
                  updatedAt: now,
                }
              : pl
          ),
        });
      },

      deletePlaylist: (id) => {
        set({ playlists: get().playlists.filter((pl) => pl.id !== id) });
      },

      addTrackToPlaylist: (playlistId, track) => {
        const { playlists } = get();
        const pl = playlists.find((p) => p.id === playlistId);
        if (!pl) return false;

        // Prevent duplicate in same playlist
        if (pl.tracks.some((t) => t.id === track.id)) {
          return false;
        }

        const now = new Date().toISOString();
        set({
          playlists: playlists.map((p) =>
            p.id === playlistId
              ? {
                  ...p,
                  tracks: [...p.tracks, track],
                  updatedAt: now,
                }
              : p
          ),
        });
        return true;
      },

      removeTrackFromPlaylist: (playlistId, trackId) => {
        const { playlists } = get();
        const now = new Date().toISOString();
        set({
          playlists: playlists.map((p) =>
            p.id === playlistId
              ? {
                  ...p,
                  tracks: p.tracks.filter((t) => t.id !== trackId),
                  updatedAt: now,
                }
              : p
          ),
        });
      },

      reorderTrackInPlaylist: (playlistId, startIndex, endIndex) => {
        const { playlists } = get();
        const pl = playlists.find((p) => p.id === playlistId);
        if (!pl) return;

        const result = Array.from(pl.tracks);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        const now = new Date().toISOString();
        set({
          playlists: playlists.map((p) =>
            p.id === playlistId ? { ...p, tracks: result, updatedAt: now } : p
          ),
        });
      },

      addToHistory: (track) => {
        const { history } = get();
        // Remove existing item of same track to bubble to top
        const filtered = history.filter((h) => h.track.id !== track.id);
        const updated = [
          { track, playedAt: new Date().toISOString() },
          ...filtered,
        ].slice(0, 100); // cap at 100 tracks
        set({ history: updated });
      },

      clearHistory: () => {
        set({ history: [] });
      },

      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== "undefined") {
          const isDark =
            theme === "dark" ||
            (theme === "system" &&
              window.matchMedia("(prefers-color-scheme: dark)").matches);
          if (isDark) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      },

      setAutoAdvance: (autoAdvance) => {
        set({ autoAdvance });
      },
    }),
    {
      name: "qmusic_library_v1",
      partialize: (state) => ({
        favorites: state.favorites,
        playlists: state.playlists,
        history: state.history,
        theme: state.theme,
        autoAdvance: state.autoAdvance,
      }),
    }
  )
);

