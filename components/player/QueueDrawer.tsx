"use client";

import { X, Trash2, Music } from "lucide-react";
import Image from "next/image";
import { useAudioPlayerStore } from "@/stores/audioPlayerStore";
import { formatDuration } from "@/lib/utils";

export function QueueDrawer() {
  const {
    queue,
    queueIndex,
    currentTrack,
    isQueueOpen,
    setQueueOpen,
    playTrack,
    removeFromQueue,
    clearQueue,
  } = useAudioPlayerStore();

  if (!isQueueOpen) return null;

  return (
    <aside className="fixed right-0 top-0 bottom-24 w-80 md:w-96 bg-[#0f111a]/95 backdrop-blur-xl border-l border-white/10 z-40 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-violet-400" />
          <h2 className="font-bold text-white text-base">Hàng đợi phát ({queue.length})</h2>
        </div>
        <div className="flex items-center gap-1">
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              title="Xóa danh sách hàng đợi"
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setQueueOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Currently playing */}
        {currentTrack && (
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Đang phát
            </div>
            <div className="flex items-center gap-3 p-2 rounded-xl bg-violet-600/15 border border-violet-500/30">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={currentTrack.artworkUrl || "/images/placeholder-track.svg"}
                  alt={currentTrack.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-violet-200 truncate">
                  {currentTrack.title}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {currentTrack.artist.name}
                </p>
              </div>
              <div className="flex items-end gap-0.5 h-4 px-2">
                <span className="w-1 bg-violet-400 rounded-full animate-wave-1" />
                <span className="w-1 bg-violet-400 rounded-full animate-wave-2" />
                <span className="w-1 bg-violet-400 rounded-full animate-wave-3" />
              </div>
            </div>
          </div>
        )}

        {/* Up Next tracks */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
            Tiếp theo
          </div>

          {queue.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Chưa có bài hát nào trong hàng đợi
            </div>
          ) : (
            <div className="space-y-1">
              {queue.map((track, idx) => {
                const isCurrent = idx === queueIndex;
                if (isCurrent) return null; // already shown above

                return (
                  <div
                    key={`${track.id}-${idx}`}
                    className="group flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <button
                      onClick={() => playTrack(track, queue)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/5">
                        <Image
                          src={track.artworkUrl || "/images/placeholder-track.svg"}
                          alt={track.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-200 group-hover:text-violet-300 truncate transition-colors">
                          {track.title}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {track.artist.name}
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center gap-2 pl-2">
                      <span className="text-xs text-slate-400 font-mono">
                        {formatDuration(track.duration)}
                      </span>
                      <button
                        onClick={() => removeFromQueue(idx)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity"
                        title="Xóa khỏi hàng đợi"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

