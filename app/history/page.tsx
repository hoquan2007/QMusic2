"use client";

import { History, Play, Trash2, Clock } from "lucide-react";
import { useLibraryStore } from "@/stores/libraryStore";
import { useAudioPlayerStore } from "@/stores/audioPlayerStore";
import { TrackRow } from "@/components/common/TrackRow";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDate } from "@/lib/utils";

export default function HistoryPage() {
  const { history, clearHistory } = useLibraryStore();
  const { playTrack } = useAudioPlayerStore();

  const tracks = history.map((h) => h.track);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 bg-gradient-to-b from-indigo-950/50 via-[#12141f] to-transparent p-6 sm:p-8 rounded-3xl border border-white/5">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-xl shrink-0">
            <History className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Nhật ký phát nhạc
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Lịch sử nghe
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {history.length} ca khúc bạn đã nghe gần đây
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-violet-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-white ml-0.5" />
              <span>Phát lại</span>
            </button>
            <button
              onClick={() => {
                if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử nghe?")) {
                  clearHistory();
                }
              }}
              className="p-2.5 rounded-full border border-white/10 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
              title="Xóa toàn bộ lịch sử"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* History Timeline */}
      <section>
        {history.length === 0 ? (
          <EmptyState
            icon={History}
            title="Chưa có lịch sử phát nhạc"
            description="Bắt đầu nghe các bài hát bạn thích trên QMusic, lịch sử sẽ tự động được ghi nhớ tại đây."
            actionText="Nghe nhạc ngay"
            actionHref="/"
          />
        ) : (
          <div className="space-y-1">
            {history.map((item, idx) => (
              <div
                key={`${item.track.id}-${item.playedAt}-${idx}`}
                className="flex items-center justify-between group"
              >
                <div className="flex-1">
                  <TrackRow
                    track={item.track}
                    index={idx}
                    queueContext={tracks}
                  />
                </div>
                <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-500 pl-4 pr-3 shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(item.playedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

