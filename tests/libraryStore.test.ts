import { describe, it, expect, beforeEach } from "vitest";
import { useLibraryStore } from "@/stores/libraryStore";
import { MusicTrack } from "@/types/music";

const mockTrack: MusicTrack = {
  id: "audius:test_track",
  rawId: "test_track",
  provider: "audius",
  title: "Library Test Track",
  artist: { id: "audius:art", rawId: "art", name: "Artist", handle: "art" },
  duration: 150,
  streamUrl: "https://example.com/audio.mp3",
  isStreamable: true,
  playCount: 50,
  favoriteCount: 5,
};

describe("Library Store", () => {
  beforeEach(() => {
    useLibraryStore.setState({
      favorites: [],
      playlists: [],
      history: [],
      theme: "dark",
      autoAdvance: true,
    });
  });

  it("toggles favorite track correctly", () => {
    const store = useLibraryStore.getState();
    expect(store.isFavorite(mockTrack.id)).toBe(false);

    store.toggleFavorite(mockTrack);
    expect(useLibraryStore.getState().isFavorite(mockTrack.id)).toBe(true);

    store.toggleFavorite(mockTrack);
    expect(useLibraryStore.getState().isFavorite(mockTrack.id)).toBe(false);
  });

  it("creates, modifies, and deletes custom user playlists", () => {
    const store = useLibraryStore.getState();
    const plId = store.createPlaylist("Chill Night", "Relaxing vibes");

    let state = useLibraryStore.getState();
    expect(state.playlists).toHaveLength(1);
    expect(state.playlists[0].name).toBe("Chill Night");

    // Add track
    const added = store.addTrackToPlaylist(plId, mockTrack);
    expect(added).toBe(true);

    state = useLibraryStore.getState();
    expect(state.playlists[0].tracks).toHaveLength(1);

    // Duplicate check
    const duplicateAdd = store.addTrackToPlaylist(plId, mockTrack);
    expect(duplicateAdd).toBe(false);

    // Rename
    store.renamePlaylist(plId, "Chill Night VIP");
    state = useLibraryStore.getState();
    expect(state.playlists[0].name).toBe("Chill Night VIP");

    // Remove track
    store.removeTrackFromPlaylist(plId, mockTrack.id);
    state = useLibraryStore.getState();
    expect(state.playlists[0].tracks).toHaveLength(0);

    // Delete playlist
    store.deletePlaylist(plId);
    state = useLibraryStore.getState();
    expect(state.playlists).toHaveLength(0);
  });

  it("adds tracks to history without unbounded duplicates", () => {
    const store = useLibraryStore.getState();
    store.addToHistory(mockTrack);
    store.addToHistory(mockTrack);

    const state = useLibraryStore.getState();
    expect(state.history).toHaveLength(1);
    expect(state.history[0].track.id).toBe(mockTrack.id);
  });
});

