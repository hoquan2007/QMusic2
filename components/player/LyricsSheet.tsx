"use client";

import { useEffect, useState, useRef } from "react";
import { X, Mic2, AlertCircle } from "lucide-react";
import { useAudioPlayerStore } from "@/stores/audioPlayerStore";
import { fetchLyrics } from "@/lib/lyrics/lrclib";
import { SyncedLyrics } from "@/types/music";
import { cn } from "@/lib/utils";

export function LyricsSheet() {
  const {
    currentTrack,
    currentTime,
    seek,
    isLyricsOpen,
    setLyricsOpen,
  } = useAudioPlayerStore();

  const [lyricsData, setLyricsData] = useState<SyncedLyrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Fetch lyrics when currentTrack changes
  useEffect(() => {
    if (!currentTrack || !isLyricsOpen) return;

    let isMounted = true;
    setLoading(true);

    fetchLyrics(currentTrack.title, currentTrack.artist.name, currentTrack.duration)
      .then((data) => {
        if (isMounted) {
          setLyricsData(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLyricsData(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentTrack?.id, isLyricsOpen]);

  // Determine active lyric line based on currentTime (in ms)
  useEffect(() => {
    if (!lyricsData?.isSynced || lyricsData.lines.length === 0) return;

    const currentMs = currentTime * 1000;
    const lines = lyricsData.lines;

    // Find the latest line whose timeMs is <= currentMs
    let index = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].timeMs <= currentMs) {
        index = i;
      } else {
        break;
      }
    }

    if (index !== activeLineIndex) {
      setActiveLineIndex(index);
    }
  }, [currentTime, lyricsData, activeLineIndex]);

  // Auto-scroll active line into center
  useEffect(() => {
    if (activeLineRef.current && scrollContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeLineIndex]);

  if (!isLyricsOpen) return null;

  return (
    <aside className="fixed right-0 top-0 bottom-24 w-full sm:w-[420px] bg-[#0c0d14]/95 backdrop-blur-2xl border-l border-white/10 z-40 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic2 className="w-5 h-5 text-violet-400" />
          <h2 className="font-bold text-white text-base">Lời bài hát</h2>
        </div>
        <button
          onClick={() => setLyricsOpen(false)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Lyrics body */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Đang tìm kiếm lời bài hát...</p>
          </div>
        ) : !lyricsData ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center px-4">
            <AlertCircle className="w-10 h-10 text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-300">
              Không tìm thấy lời bài hát
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Chưa có dữ liệu lời cho bài hát này trên LRCLIB.
            </p>
          </div>
        ) : lyricsData.instrumental ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-base font-semibold text-violet-300">
              Bản nhạc không lời (Instrumental)
            </p>
          </div>
        ) : lyricsData.isSynced ? (
          /* Synced Lyrics */
          <div className="space-y-4 py-8">
            {lyricsData.lines.map((line, idx) => {
              const isActive = idx === activeLineIndex;
              return (
                <div
                  key={`${line.timeMs}-${idx}`}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => seek(line.timeMs / 1000)}
                  className={cn(
                    "cursor-pointer text-base md:text-lg font-medium transition-all duration-300 select-none py-1.5 px-3 rounded-xl",
                    isActive
                      ? "text-white scale-105 font-bold bg-violet-600/20 text-shadow-glow"
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {line.text || "♪ ♪ ♪"}
                </div>
              );
            })}
          </div>
        ) : (
          /* Plain Unsynced Lyrics */
          <div className="whitespace-pre-line text-sm md:text-base leading-relaxed text-slate-300 py-4 font-normal">
            {lyricsData.plainLyrics}
          </div>
        )}
      </div>

      {lyricsData && (
        <div className="p-3 border-t border-white/5 text-[11px] text-slate-400 text-center">
          Nguồn lời: {lyricsData.source}
        </div>
      )}
    </aside>
  );
}

