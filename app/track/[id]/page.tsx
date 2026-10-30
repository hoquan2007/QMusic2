"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Play,
  Pause,
  Heart,
  Plus,
  Share2,
  Calendar,
  Clock,
  Radio,
  ExternalLink,
  ShieldCheck,
  Disc3,
} from "lucide-react";
import { musicRegistry } from "@/lib/providers/registry";
import { fetchLyrics } from "@/lib/lyrics/lrclib";
import { useAudioPlayerStore } from "@/stores/audioPlayerStore";
import { useLibraryStore } from "@/stores/libraryStore";
import { TrackRow } from "@/components/common/TrackRow";
import { AddToPlaylistModal } from "@/components/common/AddToPlaylistModal";
import { formatDuration, formatCount, formatDate, cn } from "@/lib/utils";
import { SyncedLyrics } from "@/types/music";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TrackDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const trackId = resolvedParams.id;

  const { currentTrack, isPlaying, playTrack, togglePlay, seek } = useAudioPlayerStore();
  const { isFavorite, toggleFavorite } = useLibraryStore();
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Fetch track details
  const {
    data: track,
    isLoading: isTrackLoading,
    error: trackError,
  } = useQuery({
    queryKey: ["trackDetail", trackId],
    queryFn: () => musicRegistry.getTrack(trackId),
  });

  // Fetch more tracks from this artist
  const { data: artistTracks = [] } = useQuery({
    queryKey: ["artistTracks", track?.artist?.rawId],
    queryFn: () =>
      track?.artist?.rawId
        ? musicRegistry.getArtistTracks(String(track.artist.rawId), 8)
        : Promise.resolve([]),
    enabled: !!track?.artist?.rawId,
  });

  // Fetch lyrics
  const { data: lyricsData, isLoading: isLyricsLoading } = useQuery<SyncedLyrics | null>({
    queryKey: ["trackLyrics", track?.title, track?.artist?.name, track?.id],
    queryFn: () =>
      track
        ? fetchLyrics(track.title, track.artist.name, track.duration, track.id)
        : Promise.resolve(null),
    enabled: !!track,
  });

  if (isTrackLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-64 h-64 rounded-3xl bg-white/5" />
          <div className="flex-1 space-y-4 w-full">
            <div className="h-8 bg-white/10 rounded w-3/4" />
            <div className="h-5 bg-white/5 rounded w-1/3" />
            <div className="h-10 bg-white/10 rounded w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (trackError || !track) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          Không tìm thấy bài hát
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Bài hát này có thể không tồn tại hoặc đã bị gỡ bỏ khỏi Audius.
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

  const isCurrent = currentTrack?.id === track.id;
  const isFav = isFavorite(track.id);

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, [track, ...artistTracks]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-8 bg-gradient-to-b from-violet-950/40 via-surface-900/60 to-transparent p-6 sm:p-8 rounded-3xl border border-white/5">
        {/* Large Artwork */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden shadow-2xl shadow-violet-950/70 border border-white/10 shrink-0">
          <Image
            src={track.artworkLargeUrl || track.artworkUrl || "/images/placeholder-track.svg"}
            alt={track.title}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Metadata */}
        <div className="flex-1 min-w-0 space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-600/20 border border-violet-500/30 text-xs font-semibold text-violet-300">
            <Radio className="w-3.5 h-3.5" />
            <span>{track.genre || "ÂM NHẠC"}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight line-clamp-2">
            {track.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs sm:text-sm text-slate-300">
            <Link
              href={`/artist/${track.artist.rawId}`}
              className="font-bold text-white hover:text-violet-300 hover:underline transition-colors"
            >
              {track.artist.name}
            </Link>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {formatDuration(track.duration)}
            </span>
            {track.releaseDate && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(track.releaseDate)}
                </span>
              </>
            )}
            {track.playCount > 0 && (
              <>
                <span>•</span>
                <span>{formatCount(track.playCount)} lượt nghe</span>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
            <button
              onClick={handlePlay}
              className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-violet-600/30 hover:scale-105 active:scale-95 transition-all"
            >
              {isCurrent && isPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-white" />
                  <span>Tạm dừng</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                  <span>Phát bài hát</span>
                </>
              )}
            </button>

            <button
              onClick={() => toggleFavorite(track)}
              className={cn(
                "p-3 rounded-full border border-white/10 hover:bg-white/10 transition-colors",
                isFav ? "text-rose-500 border-rose-500/30 bg-rose-500/10" : "text-white"
              )}
              title={isFav ? "Bỏ yêu thích" : "Yêu thích"}
            >
              <Heart className={cn("w-5 h-5", isFav ? "fill-rose-500" : "")} />
            </button>

            <button
              onClick={() => setIsAddOpen(true)}
              className="p-3 rounded-full border border-white/10 hover:bg-white/10 text-white transition-colors"
              title="Thêm vào danh sách phát"
            >
              <Plus className="w-5 h-5" />
            </button>

            {track.permalink && (
              <a
                href={track.permalink}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-full border border-white/10 hover:bg-white/10 text-white transition-colors"
                title="Xem trên Audius chính thức"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Lyrics Section */}
      <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Disc3 className="w-5 h-5 text-violet-400" />
          <span>Lời bài hát</span>
        </h2>

        {isLyricsLoading ? (
          <div className="py-12 text-center text-sm text-slate-400 animate-pulse">
            Đang tìm kiếm lời bài hát từ LRCLIB...
          </div>
        ) : !lyricsData ? (
          <p className="text-sm text-slate-400 py-4">
            Không tìm thấy dữ liệu lời bài hát cho ca khúc này.
          </p>
        ) : lyricsData.instrumental ? (
          <p className="text-sm text-violet-300 font-semibold py-4">
            Bản nhạc không lời (Instrumental)
          </p>
        ) : lyricsData.isSynced ? (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {lyricsData.lines.map((line, idx) => (
              <p
                key={idx}
                onClick={() => seek(line.timeMs / 1000)}
                className="text-base text-slate-300 hover:text-white hover:bg-white/5 p-2 rounded-xl cursor-pointer transition-colors"
              >
                {line.text}
              </p>
            ))}
          </div>
        ) : (
          <div className="whitespace-pre-line text-slate-300 text-sm leading-relaxed max-h-96 overflow-y-auto">
            {lyricsData.plainLyrics}
          </div>
        )}
      </section>

      {/* More tracks from Artist */}
      {artistTracks.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            Thêm từ {track.artist.name}
          </h2>
          <div className="space-y-1">
            {artistTracks.map((t, idx) => (
              <TrackRow
                key={t.id}
                track={t}
                index={idx}
                queueContext={artistTracks}
              />
            ))}
          </div>
        </section>
      )}

      {/* License Info */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <span className="font-semibold text-slate-200">Bản quyền & Giấy phép: </span>
          Bài hát được phát trực tuyến hợp pháp thông qua Audius Decentralized Protocol API.
        </div>
      </div>

      <AddToPlaylistModal
        track={track}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />
    </div>
  );
}

