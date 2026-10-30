"use client";

import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Mic2,
  ListMusic,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import { useAudioPlayerStore } from "@/stores/audioPlayerStore";
import { useLibraryStore } from "@/stores/libraryStore";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";
import { cn } from "@/lib/utils";

export function ExpandedPlayer() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    isBuffering,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffle,
    isExpanded,
    error,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    setExpanded,
    setLyricsOpen,
    setQueueOpen,
    isLyricsOpen,
    isQueueOpen,
  } = useAudioPlayerStore();

  const { isFavorite, toggleFavorite } = useLibraryStore();

  if (!isExpanded || !currentTrack) return null;

  const isFav = isFavorite(currentTrack.id);

  return (
    <div className="fixed inset-0 z-50 bg-[#07080d]/95 backdrop-blur-2xl flex flex-col text-slate-100 p-6 md:p-12 overflow-y-auto animate-in slide-in-from-bottom duration-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-4xl w-full mx-auto mb-6">
        <button
          onClick={() => setExpanded(false)}
          className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="Thu nhỏ"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
            Đang phát từ {currentTrack.provider.toUpperCase()}
          </span>
          <p className="text-xs text-slate-400 font-medium">
            {currentTrack.genre || "Âm nhạc bản quyền chính thức"}
          </p>
        </div>

        <button
          onClick={() => toggleFavorite(currentTrack)}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          title={isFav ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
        >
          <Heart
            className={cn(
              "w-6 h-6 transition-colors",
              isFav ? "text-rose-500 fill-rose-500" : "text-slate-400 hover:text-white"
            )}
          />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 max-w-4xl w-full mx-auto my-auto">
        {/* Large Album Artwork */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl shadow-violet-950/60 border border-white/10 shrink-0">
          <Image
            src={currentTrack.artworkLargeUrl || currentTrack.artworkUrl || "/images/placeholder-track.svg"}
            alt={currentTrack.title}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Metadata & Controls Column */}
        <div className="flex-1 w-full max-w-md flex flex-col justify-center space-y-6">
          {/* Title & Artist */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight line-clamp-2">
              {currentTrack.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-400 font-medium line-clamp-1">
              {currentTrack.artist.name}
            </p>
          </div>

          {/* Error notice if present */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Progress Bar */}
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={seek}
            showTime={true}
          />

          {/* Primary Controls */}
          <div className="flex items-center justify-between px-2">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={cn(
                "p-2 rounded-full transition-colors",
                isShuffle ? "text-violet-400 bg-violet-500/10" : "text-slate-400 hover:text-white"
              )}
              title={isShuffle ? "Tắt phát ngẫu nhiên" : "Bật phát ngẫu nhiên"}
            >
              <Shuffle className="w-5 h-5" />
            </button>

            {/* Prev */}
            <button
              onClick={prevTrack}
              className="p-3 text-slate-300 hover:text-white hover:scale-110 active:scale-95 transition-all"
              title="Bài trước đó"
            >
              <SkipBack className="w-7 h-7" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 hover:scale-105 active:scale-95 flex items-center justify-center text-white shadow-xl shadow-violet-600/40 transition-all disabled:opacity-75"
              title={isPlaying ? "Tạm dừng" : "Phát"}
            >
              {isLoading || isBuffering ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-7 h-7 fill-white" />
              ) : (
                <Play className="w-7 h-7 fill-white ml-1" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={nextTrack}
              className="p-3 text-slate-300 hover:text-white hover:scale-110 active:scale-95 transition-all"
              title="Bài tiếp theo"
            >
              <SkipForward className="w-7 h-7" />
            </button>

            {/* Repeat */}
            <button
              onClick={cycleRepeatMode}
              className={cn(
                "p-2 rounded-full transition-colors",
                repeatMode !== "off" ? "text-violet-400 bg-violet-500/10" : "text-slate-400 hover:text-white"
              )}
              title={
                repeatMode === "one"
                  ? "Lặp lại bài này"
                  : repeatMode === "all"
                  ? "Lặp lại danh sách"
                  : "Không lặp lại"
              }
            >
              {repeatMode === "one" ? (
                <Repeat1 className="w-5 h-5" />
              ) : (
                <Repeat className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-between pt-2">
            <VolumeControl
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={setVolume}
              onToggleMute={toggleMute}
              className="w-full justify-center"
            />
          </div>

          {/* Bottom Action Drawer Toggles */}
          <div className="flex items-center justify-around pt-4 border-t border-white/5">
            <button
              onClick={() => {
                setLyricsOpen(!isLyricsOpen);
                if (!isLyricsOpen) setQueueOpen(false);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-colors",
                isLyricsOpen
                  ? "bg-violet-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Mic2 className="w-4 h-4" />
              <span>Lời bài hát</span>
            </button>

            <button
              onClick={() => {
                setQueueOpen(!isQueueOpen);
                if (!isQueueOpen) setLyricsOpen(false);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-colors",
                isQueueOpen
                  ? "bg-violet-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <ListMusic className="w-4 h-4" />
              <span>Hàng đợi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

