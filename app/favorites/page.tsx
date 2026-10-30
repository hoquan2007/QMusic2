"use client";

import { Heart, Play, Music } from "lucide-react";
import { useLibraryStore } from "@/stores/libraryStore";
import { useAudioPlayerStore } from "@/stores/audioPlayerStore";
import { TrackRow } from "@/components/common/TrackRow";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDuration } from "@/lib/utils";

export default function FavoritesPage() {
  const { favorites } = useLibraryStore();
  const { playTrack } = useAudioPlayerStore();

  const totalDuration = favorites.reduce((acc, t) => acc + (t.duration || 0), 0);

  const handlePlayAll = () => {
    if (favorites.length > 0) {
      playTrack(favorites[0], favorites);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 bg-gradient-to-b from-rose-950/50 via-[#14121b] to-transparent p-6 sm:p-8 rounded-3xl border border-white/5">
        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl bg-gradient-to-br from-rose-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-rose-950/70 border border-white/10 shrink-0">
          <Heart className="w-20 h-20 text-white fill-white" />
        </div>

        <div className="flex-1 min-w-0 space-y-3 text-center sm:text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
            Tuyển tập cá nhân
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Bài hát yêu thích
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {favorites.length} bài hát • {formatDuration(totalDuration)} tổng thời lượng
          </p>

          <div className="pt-2">
            <button
              onClick={handlePlayAll}
              disabled={favorites.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-violet-600 hover:from-rose-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-rose-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white ml-0.5" />
              <span>Phát tất cả</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tracks list */}
      <section>
        {favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Chưa có bài hát yêu thích"
            description="Hãy nhấn vào biểu tượng trái tim ở bất kỳ bài hát nào để lưu vào danh sách yêu thích của bạn."
            actionText="Khám phá ngay"
            actionHref="/discover"
          />
        ) : (
          <div className="space-y-1">
            {favorites.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx}
                queueContext={favorites}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

