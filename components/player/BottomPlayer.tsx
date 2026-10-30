"use client";

import {
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
  Maximize2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAudioPlayerStore } from "@/stores/audioPlayerStore";
import { useLibraryStore } from "@/stores/libraryStore";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";
import { cn } from "@/lib/utils";

export function BottomPlayer() {
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
    error,
    isLyricsOpen,
    isQueueOpen,
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
  } = useAudioPlayerStore();

  const { isFavorite, toggleFavorite } = useLibraryStore();

  if (!currentTrack) {
    return null;
  }

  const isFav = isFavorite(currentTrack.id);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0d14]/90 dark:bg-[#07080c]/95 backdrop-blur-xl border-t border-white/10 select-none pb-16 md:pb-0">
      {/* Mini top progress indicator on mobile */}
      <div className="md:hidden w-full h-1 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-100"
          style={{
            width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-20 md:h-22 flex items-center justify-between gap-2 sm:gap-6">
        {/* Left Section: Track metadata */}
        <div className="flex items-center gap-3 w-1/4 min-w-[140px] sm:min-w-[200px] max-w-[280px]">
          {/* Artwork clickable to expand player */}
          <div
            onClick={() => setExpanded(true)}
            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shadow-lg shadow-violet-950/40 cursor-pointer group shrink-0"
            title="Mở toàn màn hình"
          >
            <Image
              src={currentTrack.artworkUrl || "/images/placeholder-track.svg"}
              alt={currentTrack.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/track/${currentTrack.rawId}`}
                className="text-sm font-semibold text-white hover:text-violet-300 truncate transition-colors"
                title={currentTrack.title}
              >
                {currentTrack.title}
              </Link>
            </div>
            <Link
              href={`/artist/${currentTrack.artist.rawId}`}
              className="text-xs text-slate-400 hover:text-slate-200 truncate block transition-colors"
              title={currentTrack.artist.name}
            >
              {currentTrack.artist.name}
            </Link>
            {error && (
              <span className="flex items-center gap-1 text-[10px] text-rose-400 truncate mt-0.5">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {error}
              </span>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={() => toggleFavorite(currentTrack)}
            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors hidden sm:block shrink-0"
            title={isFav ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                isFav ? "text-rose-500 fill-rose-500" : ""
              )}
            />
          </button>
        </div>

        {/* Center Section: Main Playback Controls & Scrubber */}
        <div className="flex-1 max-w-xl flex flex-col items-center justify-center">
          {/* Action buttons */}
          <div className="flex items-center gap-3 sm:gap-5 mb-1">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={cn(
                "p-1.5 rounded-full transition-colors hidden sm:block",
                isShuffle ? "text-violet-400" : "text-slate-400 hover:text-white"
              )}
              title={isShuffle ? "Tắt phát ngẫu nhiên" : "Bật phát ngẫu nhiên"}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Prev */}
            <button
              onClick={prevTrack}
              className="p-1.5 text-slate-300 hover:text-white transition-colors"
              title="Bài trước đó"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:scale-105 active:scale-95 flex items-center justify-center text-white shadow-lg shadow-violet-600/30 transition-all disabled:opacity-75"
              title={isPlaying ? "Tạm dừng (Phím Cách)" : "Phát (Phím Cách)"}
            >
              {isLoading || isBuffering ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={nextTrack}
              className="p-1.5 text-slate-300 hover:text-white transition-colors"
              title="Bài tiếp theo"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Repeat */}
            <button
              onClick={cycleRepeatMode}
              className={cn(
                "p-1.5 rounded-full transition-colors hidden sm:block",
                repeatMode !== "off" ? "text-violet-400" : "text-slate-400 hover:text-white"
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
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Desktop Progress bar */}
          <div className="w-full hidden md:flex">
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={seek}
              showTime={true}
            />
          </div>
        </div>

        {/* Right Section: Volume & Panels */}
        <div className="flex items-center justify-end gap-1 sm:gap-3 w-1/4 min-w-[100px] sm:min-w-[180px]">
          {/* Lyrics toggle */}
          <button
            onClick={() => {
              setLyricsOpen(!isLyricsOpen);
              if (!isLyricsOpen) setQueueOpen(false);
            }}
            className={cn(
              "p-2 rounded-xl transition-colors",
              isLyricsOpen
                ? "bg-violet-600/30 text-violet-300 border border-violet-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
            title="Lời bài hát (L)"
          >
            <Mic2 className="w-4 h-4" />
          </button>

          {/* Queue toggle */}
          <button
            onClick={() => {
              setQueueOpen(!isQueueOpen);
              if (!isQueueOpen) setLyricsOpen(false);
            }}
            className={cn(
              "p-2 rounded-xl transition-colors",
              isQueueOpen
                ? "bg-violet-600/30 text-violet-300 border border-violet-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
            title="Hàng đợi phát"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Desktop Volume Slider */}
          <div className="hidden lg:flex items-center">
            <VolumeControl
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={setVolume}
              onToggleMute={toggleMute}
            />
          </div>

          {/* Expand Full Player Button */}
          <button
            onClick={() => setExpanded(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors hidden sm:block"
            title="Toàn màn hình"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

