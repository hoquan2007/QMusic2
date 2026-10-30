"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, User } from "lucide-react";
import { MusicArtist } from "@/types/music";
import { formatCount } from "@/lib/utils";

interface ArtistCardProps {
  artist: MusicArtist;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link
      href={`/artist/${artist.rawId}`}
      className="group flex flex-col items-center text-center p-4 rounded-2xl bg-[#12141d]/50 hover:bg-[#161926] border border-white/[0.04] hover:border-violet-500/30 transition-all duration-300 select-none"
    >
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-black/40 shadow-xl border-2 border-white/5 group-hover:border-violet-500/50 transition-colors">
        <Image
          src={artist.avatarUrl || "/images/placeholder-avatar.svg"}
          alt={artist.name}
          fill
          sizes="(max-width: 768px) 33vw, 20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="mt-3 flex flex-col items-center max-w-full">
        <div className="flex items-center gap-1 max-w-full">
          <span className="text-sm font-bold text-white group-hover:text-violet-300 truncate transition-colors">
            {artist.name}
          </span>
          {artist.isVerified && (
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          )}
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          {artist.followerCount > 0
            ? `${formatCount(artist.followerCount)} người theo dõi`
            : "Nghệ sĩ"}
        </p>
      </div>
    </Link>
  );
}

