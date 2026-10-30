"use client";

import { Volume2, VolumeX, Volume1 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (val: number) => void;
  onToggleMute: () => void;
  className?: string;
}

export function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  className = "",
}: VolumeControlProps) {
  const effectiveVolume = isMuted ? 0 : volume;

  const VolumeIcon = effectiveVolume === 0 ? VolumeX : effectiveVolume < 0.5 ? Volume1 : Volume2;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={onToggleMute}
        title={isMuted ? "Bật âm lượng (M)" : "Tắt âm (M)"}
        className="p-1.5 text-slate-400 hover:text-white transition-colors"
      >
        <VolumeIcon className="w-4 h-4" />
      </button>

      <div className="w-20 sm:w-24 flex items-center">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={effectiveVolume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}

