"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { musicRegistry } from "@/lib/providers/registry";
import { TrackCard } from "@/components/common/TrackCard";
import { PlaylistCard } from "@/components/common/PlaylistCard";
import { SectionHeader } from "@/components/common/SectionHeader";
import { GridSkeleton } from "@/components/common/Skeleton";
import { Compass, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { name: "Nhạc Việt (V-Pop)", desc: "Top V-Pop, Ballad, Rap Việt, Nhạc Trẻ", color: "from-rose-600 to-red-700" },
  { name: "Electronic", desc: "EDM, House, Techno, Dubstep", color: "from-purple-600 to-indigo-600" },
  { name: "Hip-Hop/Rap", desc: "Trap, Boom Bap, Drill, Lo-Fi Rap", color: "from-amber-600 to-rose-600" },
  { name: "Pop", desc: "Melodic, Synth-pop, Dance", color: "from-pink-600 to-purple-600" },
  { name: "Rock", desc: "Alternative, Indie, Hard Rock", color: "from-red-600 to-orange-600" },
  { name: "Ambient", desc: "Chill, Atmospheric, Meditation", color: "from-teal-600 to-cyan-600" },
  { name: "R&B/Soul", desc: "Contemporary R&B, Neo-Soul", color: "from-blue-600 to-indigo-700" },
  { name: "Lo-Fi", desc: "Chillhop, Study Beats, Instrumental", color: "from-emerald-600 to-teal-700" },
];

export default function DiscoverPage() {
  const [selectedGenre, setSelectedGenre] = useState("Electronic");

  const { data: genreTracks = [], isLoading: isTracksLoading } = useQuery({
    queryKey: ["discoverTracks", selectedGenre],
    queryFn: () =>
      selectedGenre === "Nhạc Việt (V-Pop)"
        ? musicRegistry.getVietnameseTrendingTracks(18)
        : musicRegistry.getTrendingTracks(18, selectedGenre),
  });

  const { data: playlists = [], isLoading: isPlaylistsLoading } = useQuery({
    queryKey: ["discoverPlaylists"],
    queryFn: () => musicRegistry.getTrendingPlaylists(12),
  });

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900/60 via-indigo-950/70 to-slate-950 p-8 border border-white/10 shadow-2xl">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-600/20 border border-violet-500/30 text-xs font-semibold text-violet-300">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>KHÁM PHÁ THẾ GIỚI ÂM NHẠC</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Vũ trụ giai điệu không giới hạn
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Thưởng thức hàng triệu giai điệu đỉnh cao từ các nghệ sĩ độc lập trên Audius. Miễn phí, hợp pháp và liên tục cập nhật.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <section>
        <SectionHeader
          title="Thể loại & Không gian âm nhạc"
          subtitle="Chọn thể loại bạn muốn nghe ngay lúc này"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedGenre === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedGenre(cat.name)}
                className={cn(
                  "p-5 rounded-2xl text-left bg-gradient-to-br transition-all duration-200 select-none border relative overflow-hidden group hover:scale-[1.02]",
                  cat.color,
                  isSelected
                    ? "border-white ring-2 ring-violet-400 shadow-xl"
                    : "border-white/10 opacity-80 hover:opacity-100"
                )}
              >
                <div className="relative z-10">
                  <h3 className="font-bold text-white text-base sm:text-lg">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-white/80 mt-1 line-clamp-1">
                    {cat.desc}
                  </p>
                </div>
                <Sparkles className="absolute -bottom-2 -right-2 w-16 h-16 text-white/10 group-hover:scale-110 transition-transform pointer-events-none" />
              </button>
            );
          })}
        </div>
      </section>

      {/* Tracks in Selected Genre */}
      <section>
        <SectionHeader
          title={`Top bài hát • ${selectedGenre}`}
          subtitle={`Những ca khúc tiêu biểu của dòng nhạc ${selectedGenre}`}
        />
        {isTracksLoading ? (
          <GridSkeleton count={12} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {genreTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                queueContext={genreTracks}
              />
            ))}
          </div>
        )}
      </section>

      {/* Explore Playlists */}
      <section>
        <SectionHeader
          title="Playlist cộng đồng nổi bật"
          subtitle="Các tuyển tập nhạc đa dạng sắc thái"
        />
        {isPlaylistsLoading ? (
          <GridSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

