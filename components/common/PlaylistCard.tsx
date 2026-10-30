"use client";

import Image from "next/image";
import Link from "next/link";
import { Music, Play } from "lucide-react";
import { MusicPlaylist } from "@/types/music";

interface PlaylistCardProps {
  playlist: MusicPlaylist;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <Link
      href={`/playlist/${playlist.rawId}`}
      className="group relative flex flex-col p-3 rounded-2xl bg-[#12141d]/60 hover:bg-[#161926] border border-white/[0.04] hover:border-violet-500/30 transition-all duration-300 select-none"
    >
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/40 shadow-md">
        <Image
          src={playlist.artworkUrl || "/images/placeholder-playlist.svg"}
          alt={playlist.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-lg shadow-violet-950/60 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 scale-95 hover:scale-105 transition-all duration-200">
          <Play className="w-5 h-5 fill-white ml-0.5" />
        </div>
      </div>

      <div className="mt-3 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-slate-100 group-hover:text-violet-300 truncate transition-colors">
          {playlist.title}
        </h3>
        <p className="text-xs text-slate-400 truncate mt-0.5">
          {playlist.ownerName} • {playlist.trackCount} bài
        </p>
      </div>
    </Link>
  );
}

