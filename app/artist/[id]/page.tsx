"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Play,
  CheckCircle2,
  Users,
  Music,
  ExternalLink,
  MapPin,
  Globe,
} from "lucide-react";
import { musicRegistry } from "@/lib/providers/registry";
import { useAudioPlayerStore } from "@/stores/audioPlayerStore";
import { TrackRow } from "@/components/common/TrackRow";
import { formatCount } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ArtistDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const artistId = resolvedParams.id;

  const { playTrack } = useAudioPlayerStore();

  const {
    data: artist,
    isLoading: isArtistLoading,
    error: artistError,
  } = useQuery({
    queryKey: ["artistDetail", artistId],
    queryFn: () => musicRegistry.getArtist(`audius:${artistId}`),
  });

  const { data: artistTracks = [], isLoading: isTracksLoading } = useQuery({
    queryKey: ["artistTracksAll", artistId],
    queryFn: () => musicRegistry.getArtistTracks(artistId, 30),
  });

  if (isArtistLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-64 rounded-3xl bg-white/5" />
        <div className="space-y-3">
          <div className="h-8 bg-white/10 rounded w-1/3" />
          <div className="h-4 bg-white/5 rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (artistError || !artist) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          Không tìm thấy nghệ sĩ
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Nghệ sĩ này không tồn tại hoặc đã thay đổi thông tin.
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold"
        >
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (artistTracks.length > 0) {
      playTrack(artistTracks[0], artistTracks);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-violet-950/50 via-[#12141f] to-transparent p-6 sm:p-10 border border-white/5">
        {artist.bannerUrl && (
          <div className="absolute inset-0 opacity-25 overflow-hidden">
            <Image
              src={artist.bannerUrl}
              alt=""
              fill
              className="object-cover blur-sm"
            />
          </div>
        )}

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden shadow-2xl border-4 border-white/10 shrink-0 bg-black/40">
            <Image
              src={artist.avatarUrl || "/images/placeholder-avatar.svg"}
              alt={artist.name}
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                Nghệ sĩ Audius
              </span>
              {artist.isVerified && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-medium border border-cyan-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Xác minh</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight line-clamp-1">
              {artist.name}
            </h1>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Users className="w-4 h-4 text-violet-400" />
                {formatCount(artist.followerCount)} người theo dõi
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <Music className="w-4 h-4 text-cyan-400" />
                {artist.trackCount || artistTracks.length} bài hát
              </span>
              {artist.location && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {artist.location}
                  </span>
                </>
              )}
            </div>

            {artist.bio && (
              <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 max-w-xl">
                {artist.bio}
              </p>
            )}

            <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
              <button
                onClick={handlePlayAll}
                disabled={artistTracks.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-violet-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-white ml-0.5" />
                <span>Phát tất cả</span>
              </button>

              {artist.permalink && (
                <a
                  href={artist.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-full border border-white/10 hover:bg-white/10 text-white transition-colors"
                  title="Mở hồ sơ trên Audius"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Popular Tracks Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">
          Bài hát nổi bật
        </h2>

        {isTracksLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : artistTracks.length === 0 ? (
          <p className="text-sm text-slate-400 py-6">
            Nghệ sĩ này chưa phát hành bài hát công khai nào.
          </p>
        ) : (
          <div className="space-y-1">
            {artistTracks.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx}
                queueContext={artistTracks}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

