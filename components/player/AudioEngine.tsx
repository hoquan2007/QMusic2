"use client";

import { useEffect, useRef } from "react";
import { useAudioPlayerStore } from "@/stores/audioPlayerStore";

export function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTrackIdRef = useRef<string | null>(null);

  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    repeatMode,
    nextTrack,
    pause,
    resume,
    seek,
    prevTrack,
    _setIsPlaying,
    _setIsLoading,
    _setIsBuffering,
    _setCurrentTime,
    _setDuration,
    _setError,
  } = useAudioPlayerStore();

  // Initialize HTMLAudioElement singleton
  useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const onPlay = () => _setIsPlaying(true);
    const onPause = () => _setIsPlaying(false);
    const onWaiting = () => _setIsBuffering(true);
    const onPlaying = () => {
      _setIsBuffering(false);
      _setIsLoading(false);
    };
    const onCanPlay = () => {
      _setIsLoading(false);
      _setIsBuffering(false);
    };
    const onTimeUpdate = () => {
      if (!audio.seeking) {
        _setCurrentTime(audio.currentTime);
      }
    };
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        _setDuration(audio.duration);
      }
    };
    const onEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        nextTrack();
      }
    };
    const onError = () => {
      const err = audio.error;
      const track = useAudioPlayerStore.getState().currentTrack;
      let msg = "Không thể phát bài hát này.";
      if (err?.code === MediaError.MEDIA_ERR_NETWORK) {
        msg = "Lỗi kết nối mạng khi tải luồng âm thanh.";
      } else if (err?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
        if (track?.provider === "zingmp3") {
          msg = "Bài hát này thuộc danh mục VIP hoặc hiện không có luồng phát miễn phí.";
        } else {
          msg = "Định dạng âm thanh hoặc nguồn phát không được hỗ trợ.";
        }
      }
      _setError(msg);
      _setIsLoading(false);
      _setIsBuffering(false);
      _setIsPlaying(false);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.src = "";
    };
  }, [_setIsPlaying, _setIsLoading, _setIsBuffering, _setCurrentTime, _setDuration, _setError, repeatMode, nextTrack]);

  // Sync track source
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (lastTrackIdRef.current !== currentTrack.id) {
      lastTrackIdRef.current = currentTrack.id;
      _setIsLoading(true);
      _setError(null);

      audio.src = currentTrack.streamUrl;

      if (isPlaying) {
        audio.play().catch((err) => {
          // Autoplay policy restriction or abort
          if (err.name !== "AbortError") {
            console.warn("Playback prevented or failed:", err);
            _setIsPlaying(false);
            _setIsLoading(false);
          }
        });
      }
    }
  }, [currentTrack?.id, currentTrack?.streamUrl, isPlaying, _setIsLoading, _setError, _setIsPlaying]);

  // Sync play/pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      if (audio.paused && audio.src) {
        audio.play().catch((err) => {
          if (err.name !== "AbortError") {
            console.warn("Audio play rejected:", err);
            _setIsPlaying(false);
          }
        });
      }
    } else {
      if (!audio.paused) {
        audio.pause();
      }
    }
  }, [isPlaying]);

  // Sync volume & mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Sync seeking
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // Only update if difference is more than 1.5s to avoid fighting timeupdate loop
    if (Math.abs(audio.currentTime - currentTime) > 1.5) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  // MediaSession API Integration
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    if (currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist.name,
        album: currentTrack.album?.title || "QMusic Stream",
        artwork: [
          {
            src: currentTrack.artworkUrl || "/images/placeholder-track.svg",
            sizes: "512x512",
            type: "image/jpeg",
          },
        ],
      });

      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

      // Set action handlers
      const setHandler = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
        try {
          navigator.mediaSession.setActionHandler(action, handler);
        } catch {
          // Ignore unsupported action types
        }
      };

      setHandler("play", () => resume());
      setHandler("pause", () => pause());
      setHandler("previoustrack", () => prevTrack());
      setHandler("nexttrack", () => nextTrack());
      setHandler("seekto", (details) => {
        if (details.seekTime !== undefined) {
          seek(details.seekTime);
        }
      });
      setHandler("seekbackward", (details) => {
        const offset = details.seekOffset || 10;
        seek(Math.max(0, currentTime - offset));
      });
      setHandler("seekforward", (details) => {
        const offset = details.seekOffset || 10;
        seek(currentTime + offset);
      });
    }
  }, [currentTrack, isPlaying, currentTime, resume, pause, prevTrack, nextTrack, seek]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contentEditable element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const store = useAudioPlayerStore.getState();

      if (e.code === "Space") {
        e.preventDefault();
        store.togglePlay();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        store.seek(store.currentTime + 5);
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        store.seek(Math.max(0, store.currentTime - 5));
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        store.setVolume(Math.min(1, store.volume + 0.05));
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        store.setVolume(Math.max(0, store.volume - 0.05));
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        store.toggleMute();
      } else if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        store.setLyricsOpen(!store.isLyricsOpen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}

