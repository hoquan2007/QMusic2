"use client";

import { useState, useRef, useEffect } from "react";
import { formatDuration } from "@/lib/utils";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  showTime?: boolean;
  className?: string;
}

export function ProgressBar({
  currentTime,
  duration,
  onSeek,
  showTime = true,
  className = "",
}: ProgressBarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [localProgress, setLocalProgress] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  const effectiveDuration = duration > 0 ? duration : 0;
  const currentProgress = isDragging
    ? localProgress
    : effectiveDuration > 0
    ? (currentTime / effectiveDuration) * 100
    : 0;

  useEffect(() => {
    if (!isDragging) {
      setLocalProgress(effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0);
    }
  }, [currentTime, effectiveDuration, isDragging]);

  const calculateTimeFromEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || effectiveDuration <= 0) return 0;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    return pos * effectiveDuration;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || effectiveDuration <= 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * effectiveDuration);
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const targetSeconds = calculateTimeFromEvent(e);
    onSeek(targetSeconds);
  };

  return (
    <div className={`flex items-center gap-2.5 w-full select-none ${className}`}>
      {showTime && (
        <span className="text-[11px] font-mono text-slate-400 w-10 text-right tabular-nums">
          {formatDuration(isDragging ? (localProgress / 100) * effectiveDuration : currentTime)}
        </span>
      )}

      <div
        ref={progressRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex-1 h-3 flex items-center cursor-pointer group"
      >
        {/* Track background */}
        <div className="w-full h-1 group-hover:h-1.5 bg-white/10 rounded-full overflow-hidden transition-all duration-150">
          {/* Progress fill */}
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-75 relative"
            style={{ width: `${Math.min(100, Math.max(0, currentProgress))}%` }}
          />
        </div>

        {/* Hover preview marker */}
        {hoverTime !== null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/40 pointer-events-none"
            style={{ left: `${hoverPosition}%` }}
          />
        )}

        {/* Scrubber thumb */}
        <div
          className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-md shadow-violet-500/50 scale-0 group-hover:scale-100 transition-transform duration-150 -ml-1.5 pointer-events-none"
          style={{ left: `${Math.min(100, Math.max(0, currentProgress))}%` }}
        />

        {/* Hover timestamp tooltip */}
        {hoverTime !== null && (
          <div
            className="absolute -top-7 transform -translate-x-1/2 px-2 py-0.5 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[10px] text-white font-mono pointer-events-none shadow"
            style={{ left: `${hoverPosition}%` }}
          >
            {formatDuration(hoverTime)}
          </div>
        )}
      </div>

      {showTime && (
        <span className="text-[11px] font-mono text-slate-400 w-10 tabular-nums">
          {formatDuration(effectiveDuration)}
        </span>
      )}
    </div>
  );
}

