"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Pause, Heart, Plus, Music } from "lucide-react";
import { MusicTrack } from "@/types/music";
import { useAudioPlayerStore } from "@/stores/audioPlayerStore";
import { useLibraryStore } from "@/stores/libraryStore";
import { formatDuration, formatCount, cn } from "@/lib/utils";
import { AddToPlaylistModal } from "./AddToPlaylistModal";

interface TrackRowProps {
  track: MusicTrack;
  index: number;
  queueContext?: MusicTrack[];
  showAlbum?: boolean;
}

export function TrackRow({
  track,
  index,
  queueContext,
  showAlbum = true,
}: TrackRowProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudioPlayerStore();
  const { isFavorite, toggleFavorite } = useLibraryStore();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const isCurrent = currentTrack?.id === track.id;
  const isFav = isFavorite(track.id);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, queueContext);
    }
  };

  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] transition-colors select-none text-slate-300 text-sm",
          isCurrent ? "bg-violet-600/10 text-violet-200" : ""
        )}
      >
        {/* Index or Play icon */}
        <div className="w-8 flex items-center justify-center shrink-0">
          {isCurrent && isPlaying ? (
            <div className="flex items-end gap-0.5 h-3.5">
              <span className="w-0.5 bg-violet-400 rounded-full animate-wave-1" />
              <span className="w-0.5 bg-violet-400 rounded-full animate-wave-2" />
              <span className="w-0.5 bg-violet-400 rounded-full animate-wave-3" />
            </div>
          ) : (
            <>
              <span className="group-hover:hidden text-xs text-slate-500 font-mono">
                {index + 1}
              </span>
              <button
                onClick={handlePlay}
                className="hidden group-hover:flex items-center justify-center text-slate-100 hover:text-violet-400"
                title={isCurrent && isPlaying ? "Tạm dừng" : "Phát"}
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail artwork */}
        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-black/40 shrink-0">
          <Image
            src={track.artworkUrl || "/images/placeholder-track.svg"}
            alt={track.title}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>

        {/* Title & Artist */}
        <div className="flex-1 min-w-0 pr-2">
          <Link
            href={`/track/${track.rawId}`}
            className={cn(
              "font-semibold truncate block hover:underline transition-colors",
              isCurrent ? "text-violet-300" : "text-white group-hover:text-violet-200"
            )}
            title={track.title}
          >
            {track.title}
          </Link>
          <Link
            href={`/artist/${track.artist.rawId}`}
            className="text-xs text-slate-400 hover:text-slate-200 truncate block transition-colors mt-0.5"
            title={track.artist.name}
          >
            {track.artist.name}
          </Link>
        </div>

        {/* Genre / Provider tag */}
        {showAlbum && (
          <div className="hidden md:block w-36 truncate text-xs text-slate-400">
            {track.genre || "Bản quyền chính thức"}
          </div>
        )}

        {/* Play count */}
        {track.playCount > 0 && (
          <div className="hidden lg:block w-24 text-right text-xs font-mono text-slate-400">
            {formatCount(track.playCount)}
          </div>
        )}

        {/* Actions: Heart + Plus */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleFavorite(track)}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              isFav
                ? "text-rose-500"
                : "opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white"
            )}
            title={isFav ? "Bỏ yêu thích" : "Yêu thích"}
          >
            <Heart className={cn("w-4 h-4", isFav ? "fill-rose-500" : "")} />
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-white rounded-lg transition-opacity"
            title="Thêm vào danh sách phát"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Duration */}
        <div className="w-12 text-right text-xs font-mono text-slate-400">
          {formatDuration(track.duration)}
        </div>
      </div>

      <AddToPlaylistModal
        track={track}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />
    </>
  );
}

