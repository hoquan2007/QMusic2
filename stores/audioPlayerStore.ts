import { MusicTrack } from "@/types/music";
import { create } from "zustand";
import { useLibraryStore } from "./libraryStore";

export type RepeatMode = "off" | "all" | "one";

export interface AudioPlayerState {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0 to 1
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  queue: MusicTrack[];
  queueIndex: number;
  error: string | null;

  // UI Drawer states
  isExpanded: boolean;
  isLyricsOpen: boolean;
  isQueueOpen: boolean;

  // Playback control actions
  playTrack: (track: MusicTrack, newQueue?: MusicTrack[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;

  // Queue actions
  addToQueue: (track: MusicTrack) => void;
  playNextInQueue: (track: MusicTrack) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  clearQueue: () => void;

  // Internal state setters used by Audio Engine
  _setIsPlaying: (isPlaying: boolean) => void;
  _setIsLoading: (isLoading: boolean) => void;
  _setIsBuffering: (isBuffering: boolean) => void;
  _setCurrentTime: (currentTime: number) => void;
  _setDuration: (duration: number) => void;
  _setError: (error: string | null) => void;

  // UI state actions
  setExpanded: (expanded: boolean) => void;
  setLyricsOpen: (open: boolean) => void;
  setQueueOpen: (open: boolean) => void;
}

export const useAudioPlayerStore = create<AudioPlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  isLoading: false,
  isBuffering: false,
  currentTime: 0,
  duration: 0,
  volume: 0.85,
  isMuted: false,
  repeatMode: "all",
  isShuffle: false,
  queue: [],
  queueIndex: -1,
  error: null,

  isExpanded: false,
  isLyricsOpen: false,
  isQueueOpen: false,

  playTrack: (track, newQueue) => {
    const state = get();
    let queue = newQueue || state.queue;
    let queueIndex = queue.findIndex((t) => t.id === track.id);

    if (queueIndex === -1) {
      if (newQueue) {
        queue = [track, ...newQueue];
        queueIndex = 0;
      } else {
        queue = [...queue, track];
        queueIndex = queue.length - 1;
      }
    }

    set({
      currentTrack: track,
      queue,
      queueIndex,
      currentTime: 0,
      duration: track.duration || 0,
      isPlaying: true,
      isLoading: true,
      error: null,
    });

    // Save to user listening history
    useLibraryStore.getState().addToHistory(track);
  },

  togglePlay: () => {
    const { isPlaying, currentTrack } = get();
    if (!currentTrack) return;
    set({ isPlaying: !isPlaying });
  },

  pause: () => {
    set({ isPlaying: false });
  },

  resume: () => {
    const { currentTrack } = get();
    if (currentTrack) {
      set({ isPlaying: true });
    }
  },

  nextTrack: () => {
    const { queue, queueIndex, isShuffle, repeatMode } = get();
    if (queue.length === 0) return;

    if (repeatMode === "one") {
      // Re-trigger current track seek 0
      set({ currentTime: 0, isPlaying: true });
      return;
    }

    let nextIndex: number;
    if (isShuffle && queue.length > 1) {
      // Pick random different track
      do {
        nextIndex = Math.floor(Math.random() * queue.length);
      } while (nextIndex === queueIndex && queue.length > 1);
    } else {
      nextIndex = queueIndex + 1;
    }

    if (nextIndex >= queue.length) {
      if (repeatMode === "all") {
        nextIndex = 0;
      } else {
        // Stop playback
        set({ isPlaying: false });
        return;
      }
    }

    const nextTrack = queue[nextIndex];
    if (nextTrack) {
      set({
        currentTrack: nextTrack,
        queueIndex: nextIndex,
        currentTime: 0,
        duration: nextTrack.duration || 0,
        isPlaying: true,
        isLoading: true,
        error: null,
      });
      useLibraryStore.getState().addToHistory(nextTrack);
    }
  },

  prevTrack: () => {
    const { queue, queueIndex, currentTime } = get();
    if (queue.length === 0) return;

    // If played more than 3 seconds, restart current track
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    const prevIndex = queueIndex > 0 ? queueIndex - 1 : queue.length - 1;
    const prevTrack = queue[prevIndex];
    if (prevTrack) {
      set({
        currentTrack: prevTrack,
        queueIndex: prevIndex,
        currentTime: 0,
        duration: prevTrack.duration || 0,
        isPlaying: true,
        isLoading: true,
        error: null,
      });
      useLibraryStore.getState().addToHistory(prevTrack);
    }
  },

  seek: (seconds) => {
    const { duration } = get();
    const clamped = Math.max(0, Math.min(seconds, duration || seconds));
    set({ currentTime: clamped });
  },

  setVolume: (volume) => {
    const clamped = Math.max(0, Math.min(1, volume));
    set({ volume: clamped, isMuted: clamped === 0 });
  },

  toggleMute: () => {
    set((state) => ({ isMuted: !state.isMuted }));
  },

  toggleShuffle: () => {
    set((state) => ({ isShuffle: !state.isShuffle }));
  },

  cycleRepeatMode: () => {
    const current = get().repeatMode;
    const modes: RepeatMode[] = ["off", "all", "one"];
    const nextMode = modes[(modes.indexOf(current) + 1) % modes.length];
    set({ repeatMode: nextMode });
  },

  addToQueue: (track) => {
    const { queue } = get();
    set({ queue: [...queue, track] });
  },

  playNextInQueue: (track) => {
    const { queue, queueIndex } = get();
    const newQueue = [...queue];
    newQueue.splice(queueIndex + 1, 0, track);
    set({ queue: newQueue });
  },

  removeFromQueue: (index) => {
    const { queue, queueIndex } = get();
    const newQueue = queue.filter((_, i) => i !== index);
    let newIndex = queueIndex;
    if (index < queueIndex) {
      newIndex = queueIndex - 1;
    } else if (index === queueIndex) {
      newIndex = Math.min(queueIndex, newQueue.length - 1);
    }
    set({
      queue: newQueue,
      queueIndex: newIndex,
      currentTrack: newQueue[newIndex] || null,
    });
  },

  reorderQueue: (startIndex, endIndex) => {
    const { queue, queueIndex } = get();
    const result = Array.from(queue);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Adjust current track index if affected
    let newIndex = queueIndex;
    if (queueIndex === startIndex) {
      newIndex = endIndex;
    } else if (startIndex < queueIndex && endIndex >= queueIndex) {
      newIndex = queueIndex - 1;
    } else if (startIndex > queueIndex && endIndex <= queueIndex) {
      newIndex = queueIndex + 1;
    }

    set({ queue: result, queueIndex: newIndex });
  },

  clearQueue: () => {
    const { currentTrack } = get();
    set({
      queue: currentTrack ? [currentTrack] : [],
      queueIndex: currentTrack ? 0 : -1,
    });
  },

  _setIsPlaying: (isPlaying) => set({ isPlaying }),
  _setIsLoading: (isLoading) => set({ isLoading }),
  _setIsBuffering: (isBuffering) => set({ isBuffering }),
  _setCurrentTime: (currentTime) => set({ currentTime }),
  _setDuration: (duration) => set({ duration }),
  _setError: (error) => set({ error }),

  setExpanded: (isExpanded) => set({ isExpanded }),
  setLyricsOpen: (isLyricsOpen) => set({ isLyricsOpen }),
  setQueueOpen: (isQueueOpen) => set({ isQueueOpen }),
}));

