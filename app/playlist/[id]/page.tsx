"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Play,
  Music,
  Trash2,
  Edit2,
  Share2,
  Clock,
  ListMusic,
  Check,
  X,
} from "lucide-react";
import { musicRegistry } from "@/lib/providers/registry";
import { useAudioPlayerStore } from "@/stores/audioPlayerStore";
import { useLibraryStore } from "@/stores/libraryStore";
import { TrackRow } from "@/components/common/TrackRow";
import { formatDuration } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PlaylistDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const playlistId = resolvedParams.id;
  const router = useRouter();

  const { playTrack } = useAudioPlayerStore();
  const { playlists, deletePlaylist, renamePlaylist, removeTrackFromPlaylist } = useLibraryStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const isLocal = playlistId.startsWith("local_pl_");
  const localPlaylist = isLocal
    ? playlists.find((p) => p.id === playlistId)
    : null;

  // If remote Audius playlist, query API
  const {
    data: remotePlaylist,
    isLoading: isRemoteLoading,
    error: remoteError,
  } = useQuery({
    queryKey: ["playlistDetail", playlistId],
    queryFn: () => musicRegistry.getPlaylist(`audius:${playlistId}`),
    enabled: !isLocal,
  });

  const playlist = isLocal
    ? localPlaylist
      ? {
          id: localPlaylist.id,
          rawId: localPlaylist.id,
          title: localPlaylist.name,
          description: localPlaylist.description,
          ownerName: "Bạn (Cá nhân)",
          trackCount: localPlaylist.tracks.length,
          tracks: localPlaylist.tracks,
          artworkUrl: localPlaylist.tracks[0]?.artworkUrl || "/images/placeholder-playlist.svg",
        }
      : null
    : remotePlaylist;

  if (isLocal && !localPlaylist) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          Không tìm thấy danh sách phát
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Danh sách phát cá nhân này có thể đã bị xóa.
        </p>
        <Link
          href="/library"
          className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold"
        >
          Về thư viện
        </Link>
      </div>
    );
  }

  if (!isLocal && isRemoteLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <div className="w-56 h-56 rounded-3xl bg-white/5" />
          <div className="flex-1 space-y-3 w-full">
            <div className="h-8 bg-white/10 rounded w-2/3" />
            <div className="h-4 bg-white/5 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!isLocal && (remoteError || !playlist)) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          Không tìm thấy danh sách phát
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Playlist này không tồn tại hoặc đã bị gỡ trên Audius.
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

  const tracks = playlist?.tracks || [];
  const totalDuration = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  const handleDelete = () => {
    if (confirm(`Bạn có chắc muốn xóa danh sách phát "${playlist?.title}"?`)) {
      deletePlaylist(playlistId);
      router.push("/library");
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    renamePlaylist(playlistId, editName.trim(), editDesc.trim());
    setIsEditing(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 bg-gradient-to-b from-violet-950/40 via-surface-900/60 to-transparent p-6 sm:p-8 rounded-3xl border border-white/5">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-2xl shadow-violet-950/70 border border-white/10 shrink-0 bg-black/40">
          <Image
            src={playlist?.artworkUrl || "/images/placeholder-playlist.svg"}
            alt={playlist?.title || "Playlist"}
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 space-y-3 text-center sm:text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-300">
            {isLocal ? "Danh sách phát cá nhân" : "Tuyển tập Audius"}
          </span>

          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-2 max-w-md">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-1.5 bg-black/50 border border-violet-500 rounded-lg text-lg font-bold text-white focus:outline-none"
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Mô tả..."
                rows={2}
                className="w-full px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-xs text-white focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-3 py-1 bg-violet-600 text-white rounded text-xs font-semibold"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-white/10 text-white rounded text-xs"
                >
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight line-clamp-2">
                {playlist?.title}
              </h1>
              {playlist?.description && (
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
                  {playlist.description}
                </p>
              )}
            </>
          )}

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs sm:text-sm text-slate-300">
            <span className="font-medium text-white">{playlist?.ownerName}</span>
            <span>•</span>
            <span>{tracks.length} bài hát</span>
            {totalDuration > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {formatDuration(totalDuration)}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
            <button
              onClick={handlePlayAll}
              disabled={tracks.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-violet-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white ml-0.5" />
              <span>Phát tất cả</span>
            </button>

            {isLocal && (
              <>
                <button
                  onClick={() => {
                    setEditName(playlist?.title || "");
                    setEditDesc(playlist?.description || "");
                    setIsEditing(true);
                  }}
                  className="p-2.5 rounded-full border border-white/10 hover:bg-white/10 text-white transition-colors"
                  title="Chỉnh sửa thông tin"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2.5 rounded-full border border-white/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                  title="Xóa danh sách phát"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tracks Table */}
      <section className="space-y-2">
        {tracks.length === 0 ? (
          <div className="text-center py-16 text-sm text-slate-400">
            Chưa có bài hát nào trong danh sách phát này.
          </div>
        ) : (
          <div className="space-y-1">
            {tracks.map((track, idx) => (
              <div key={`${track.id}-${idx}`} className="flex items-center justify-between">
                <div className="flex-1">
                  <TrackRow
                    track={track}
                    index={idx}
                    queueContext={tracks}
                  />
                </div>
                {isLocal && (
                  <button
                    onClick={() => removeTrackFromPlaylist(playlistId, track.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors mr-2"
                    title="Xóa khỏi playlist"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

