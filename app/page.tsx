"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Play, Pause, Sparkles, Flame, Radio, Heart, Music } from "lucide-react";
import { musicRegistry } from "@/lib/providers/registry";
import { useAudioPlayerStore } from "@/stores/audioPlayerStore";
import { useLibraryStore } from "@/stores/libraryStore";
import { TrackCard } from "@/components/common/TrackCard";
import { ArtistCard } from "@/components/common/ArtistCard";
import { PlaylistCard } from "@/components/common/PlaylistCard";
import { SectionHeader } from "@/components/common/SectionHeader";
import { GridSkeleton } from "@/components/common/Skeleton";
import { MusicTrack } from "@/types/music";
import { cn } from "@/lib/utils";

const GENRES = [
  "Tất cả",
  "Nhạc Việt (V-Pop)",
  "Electronic",
  "Hip-Hop/Rap",
  "Pop",
  "Rock",
  "Ambient",
  "R&B/Soul",
  "Lo-Fi",
  "Acoustic",
];

export default function HomePage() {
  const [selectedGenre, setSelectedGenre] = useState("Tất cả");
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudioPlayerStore();
  const { history, isFavorite, toggleFavorite } = useLibraryStore();

  // Fetch Vietnamese trending chart tracks
  const { data: vnTrendingTracks = [], isLoading: isVnLoading } = useQuery({
    queryKey: ["vietnamTrendingHome"],
    queryFn: () => musicRegistry.getVietnameseTrendingTracks(12),
  });

  // Fetch international trending tracks
  const {
    data: trendingTracks = [],
    isLoading: isTracksLoading,
    error: tracksError,
  } = useQuery({
    queryKey: ["trendingTracks", selectedGenre],
    queryFn: () =>
      selectedGenre === "Nhạc Việt (V-Pop)"
        ? musicRegistry.getVietnameseTrendingTracks(24)
        : musicRegistry.getTrendingTracks(
            24,
            selectedGenre === "Tất cả" ? undefined : selectedGenre
          ),
  });

  // Fetch trending playlists
  const { data: trendingPlaylists = [], isLoading: isPlaylistsLoading } = useQuery({
    queryKey: ["trendingPlaylists"],
    queryFn: () => musicRegistry.getTrendingPlaylists(6),
  });

  const heroTrack: MusicTrack | undefined = vnTrendingTracks[0] || trendingTracks[0];
  const isHeroPlaying = currentTrack?.id === heroTrack?.id && isPlaying;
  const isHeroFav = heroTrack ? isFavorite(heroTrack.id) : false;

  const handleHeroPlay = () => {
    if (!heroTrack) return;
    if (currentTrack?.id === heroTrack.id) {
      togglePlay();
    } else {
      playTrack(heroTrack, vnTrendingTracks.length > 0 ? vnTrendingTracks : trendingTracks);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Hero Banner with Featured Track */}
      {heroTrack ? (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-950/70 via-[#131525] to-[#0c0d16] border border-white/10 p-6 sm:p-10 shadow-2xl">
          {/* Subtle blurred artwork background */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 blur-3xl pointer-events-none overflow-hidden">
            <Image
              src={heroTrack.artworkLargeUrl || heroTrack.artworkUrl || "/images/placeholder-track.svg"}
              alt=""
              fill
              className="object-cover"
            />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-600/20 border border-violet-500/30 text-xs font-semibold text-violet-300">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>NỔI BẬT HÔM NAY • {heroTrack.genre || "TRENDING"}</span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight line-clamp-2">
                  {heroTrack.title}
                </h1>
                <Link
                  href={`/artist/${heroTrack.artist.rawId}`}
                  className="text-base sm:text-lg text-slate-300 hover:text-white font-medium inline-block mt-2 transition-colors"
                >
                  {heroTrack.artist.name}
                </Link>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={handleHeroPlay}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-violet-600/40 hover:scale-105 active:scale-95 transition-all"
                >
                  {isHeroPlaying ? (
                    <>
                      <Pause className="w-5 h-5 fill-white" />
                      <span>Tạm dừng</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                      <span>Phát ngay</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleFavorite(heroTrack)}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title={isHeroFav ? "Bỏ yêu thích" : "Yêu thích"}
                >
                  <Heart
                    className={cn(
                      "w-5 h-5",
                      isHeroFav ? "text-rose-500 fill-rose-500" : ""
                    )}
                  />
                </button>

                <Link
                  href={`/track/${heroTrack.rawId}`}
                  className="px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Chi tiết
                </Link>
              </div>
            </div>

            {/* Hero Artwork Box */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0">
              <Image
                src={heroTrack.artworkLargeUrl || heroTrack.artworkUrl || "/images/placeholder-track.svg"}
                alt={heroTrack.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </section>
      ) : isTracksLoading ? (
        <div className="h-72 rounded-3xl bg-white/5 animate-pulse" />
      ) : null}

      {/* Genre Pills */}
      <section>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={cn(
                "px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all",
                selectedGenre === g
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                  : "bg-white/5 hover:bg-white/10 text-slate-300"
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </section>

      {/* Top Vietnamese Music Section (#zingchart) */}
      <section>
        <SectionHeader
          title="Bảng xếp hạng Nhạc Việt (#zingchart)"
          subtitle="Top ca khúc Việt Nam được yêu thích nhất thời điểm hiện tại"
          actionHref="/discover"
        />

        {isVnLoading ? (
          <GridSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {vnTrendingTracks.slice(0, 12).map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                queueContext={vnTrendingTracks}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recently Played from Listening History */}
      {history.length > 0 && (
        <section>
          <SectionHeader
            title="Nghe gần đây"
            subtitle="Tiếp tục thưởng thức các bài hát bạn đã khám phá"
            actionHref="/history"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {history.slice(0, 6).map((item, idx) => (
              <TrackCard
                key={`${item.track.id}-hist-${idx}`}
                track={item.track}
                queueContext={history.map((h) => h.track)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Trending Now Section */}
      <section>
        <SectionHeader
          title={`Thịnh hành • ${selectedGenre}`}
          subtitle="Những ca khúc đang được nghe nhiều nhất"
          actionHref="/discover"
        />

        {isTracksLoading ? (
          <GridSkeleton count={12} />
        ) : tracksError ? (
          <div className="text-center py-12 text-sm text-rose-400">
            Không thể tải danh sách thịnh hành. Vui lòng thử lại.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {trendingTracks.slice(0, 18).map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                queueContext={trendingTracks}
              />
            ))}
          </div>
        )}
      </section>

      {/* Featured Playlists */}
      {trendingPlaylists.length > 0 && (
        <section>
          <SectionHeader
            title="Danh sách phát tuyển chọn"
            subtitle="Playlist công khai được tuyển chọn bởi cộng đồng âm nhạc"
            actionHref="/discover"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trendingPlaylists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
