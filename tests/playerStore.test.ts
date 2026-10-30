import { describe, it, expect, beforeEach } from "vitest";
import { useAudioPlayerStore } from "@/stores/audioPlayerStore";
import { MusicTrack } from "@/types/music";

const mockTrack1: MusicTrack = {
  id: "audius:track1",
  rawId: "track1",
  provider: "audius",
  title: "Test Track 1",
  artist: { id: "audius:art1", rawId: "art1", name: "Artist 1", handle: "art1" },
  duration: 200,
  streamUrl: "https://example.com/stream1.mp3",
  isStreamable: true,
  playCount: 100,
  favoriteCount: 10,
};

const mockTrack2: MusicTrack = {
  id: "audius:track2",
  rawId: "track2",
  provider: "audius",
  title: "Test Track 2",
  artist: { id: "audius:art2", rawId: "art2", name: "Artist 2", handle: "art2" },
  duration: 180,
  streamUrl: "https://example.com/stream2.mp3",
  isStreamable: true,
  playCount: 200,
  favoriteCount: 20,
};

describe("Audio Player Store", () => {
  beforeEach(() => {
    useAudioPlayerStore.setState({
      currentTrack: null,
      isPlaying: false,
      queue: [],
      queueIndex: -1,
      currentTime: 0,
      duration: 0,
      repeatMode: "all",
      isShuffle: false,
    });
  });

  it("plays a track and initializes queue", () => {
    const store = useAudioPlayerStore.getState();
    store.playTrack(mockTrack1, [mockTrack1, mockTrack2]);

    const state = useAudioPlayerStore.getState();
    expect(state.currentTrack?.id).toBe(mockTrack1.id);
    expect(state.queue).toHaveLength(2);
    expect(state.queueIndex).toBe(0);
    expect(state.isPlaying).toBe(true);
  });

  it("advances to next track in queue", () => {
    const store = useAudioPlayerStore.getState();
    store.playTrack(mockTrack1, [mockTrack1, mockTrack2]);

    store.nextTrack();
    const state = useAudioPlayerStore.getState();
    expect(state.currentTrack?.id).toBe(mockTrack2.id);
    expect(state.queueIndex).toBe(1);
  });

  it("cycles to beginning if repeatMode is all", () => {
    const store = useAudioPlayerStore.getState();
    store.playTrack(mockTrack2, [mockTrack1, mockTrack2]);

    store.nextTrack();
    const state = useAudioPlayerStore.getState();
    expect(state.currentTrack?.id).toBe(mockTrack1.id);
    expect(state.queueIndex).toBe(0);
  });

  it("adjusts volume and muting correctly", () => {
    const store = useAudioPlayerStore.getState();
    store.setVolume(0.5);
    expect(useAudioPlayerStore.getState().volume).toBe(0.5);

    store.toggleMute();
    expect(useAudioPlayerStore.getState().isMuted).toBe(true);

    store.toggleMute();
    expect(useAudioPlayerStore.getState().isMuted).toBe(false);
  });
});

