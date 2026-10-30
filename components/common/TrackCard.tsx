"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Pause, Heart, MoreVertical, Plus } from "lucide-react";
import { MusicTrack } from "@/types/music";
import { useAudioPlayerStore } from "@/stores/audioPlayerStore";
import { useLibraryStore } from "@/stores/libraryStore";
import { formatDuration, cn } from "@/lib/utils";
import { AddToPlaylistModal } from "./AddToPlaylistModal";

interface TrackCardProps {
  track: MusicTrack;
  queueContext?: MusicTrack[];
}

export function TrackCard({ track, queueContext }: TrackCardProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudioPlayerStore();
  const { isFavorite, toggleFavorite } = useLibraryStore();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const isCurrent = currentTrack?.id === track.id;
  const isFav = isFavorite(track.id);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, queueContext);
    }
  };

  return (
    <>
      <div className="group relative flex flex-col p-3 rounded-2xl bg-[#12141d]/60 hover:bg-[#161926] border border-white/[0.04] hover:border-violet-500/30 transition-all duration-300">
        {/* Cover image container */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/40 shadow-md">
          <Image
            src={track.artworkUrl || "/images/placeholder-track.svg"}
            alt={track.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Play/Pause Button overlay */}
          <button
            onClick={handlePlay}
            className={cn(
              "absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-lg shadow-violet-950/60 transition-all duration-200 transform",
              isCurrent
                ? "opacity-100 scale-100"
                : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 scale-95 hover:scale-105"
            )}
            title={isCurrent && isPlaying ? "Tạm dừng" : "Phát"}
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
          </button>

          {/* Favorite Quick Action */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(track);
            }}
            className={cn(
              "absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/40 backdrop-blur-md transition-opacity duration-200",
              isFav ? "opacity-100 text-rose-500" : "opacity-0 group-hover:opacity-100 text-white hover:text-rose-400"
            )}
            title={isFav ? "Bỏ yêu thích" : "Yêu thích"}
          >
            <Heart className={cn("w-4 h-4", isFav ? "fill-rose-500" : "")} />
          </button>
        </div>

        {/* Info */}
        <div className="mt-3 flex flex-col flex-1">
          <Link
            href={`/track/${track.rawId}`}
            className="text-sm font-semibold text-slate-100 hover:text-violet-300 truncate transition-colors"
            title={track.title}
          >
            {track.title}
          </Link>

          <div className="flex items-center justify-between mt-1">
            <Link
              href={`/artist/${track.artist.rawId}`}
              className="text-xs text-slate-400 hover:text-slate-200 truncate block transition-colors max-w-[130px]"
              title={track.artist.name}
            >
              {track.artist.name}
            </Link>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsAddOpen(true);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity"
              title="Thêm vào danh sách phát"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
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

