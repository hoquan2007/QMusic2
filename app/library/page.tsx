"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, Heart, History, Music2, FolderPlus } from "lucide-react";
import { useLibraryStore } from "@/stores/libraryStore";
import { CreatePlaylistModal } from "@/components/common/CreatePlaylistModal";
import { EmptyState } from "@/components/common/EmptyState";
import { PlaylistCard } from "@/components/common/PlaylistCard";

export default function LibraryPage() {
  const { playlists, favorites, history } = useLibraryStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title & Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Thư viện của bạn
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Quản lý các danh sách phát cá nhân, bài hát yêu thích và lịch sử nghe
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-violet-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tạo danh sách phát</span>
        </button>
      </div>

      {/* Quick summary cards: Favorites & History */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Favorites card */}
        <Link
          href="/favorites"
          className="p-6 rounded-2xl bg-gradient-to-br from-rose-900/40 via-violet-950/40 to-slate-900 border border-white/5 hover:border-rose-500/30 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl">
              <Heart className="w-6 h-6 fill-rose-500" />
            </div>
            <span className="text-xs font-semibold text-rose-300">
              {favorites.length} bài hát
            </span>
          </div>
          <h2 className="text-xl font-bold text-white group-hover:text-rose-300 transition-colors">
            Bài hát yêu thích
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Những giai điệu bạn đã thả tim
          </p>
        </Link>

        {/* History card */}
        <Link
          href="/history"
          className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-950 border border-white/5 hover:border-indigo-500/30 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <History className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-indigo-300">
              {history.length} bài hát
            </span>
          </div>
          <h2 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
            Lịch sử nghe
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Danh sách các ca khúc bạn đã thưởng thức
          </p>
        </Link>
      </div>

      {/* Custom Playlists Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Music2 className="w-5 h-5 text-violet-400" />
          <span>Danh sách phát của bạn ({playlists.length})</span>
        </h2>

        {playlists.length === 0 ? (
          <EmptyState
            icon={FolderPlus}
            title="Chưa có danh sách phát nào"
            description="Hãy tạo danh sách phát đầu tiên để lưu giữ những ca khúc bạn yêu thích theo tâm trạng hoặc chủ đề."
            actionText="Tạo danh sách mới"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {playlists.map((pl) => (
              <PlaylistCard
                key={pl.id}
                playlist={{
                  id: pl.id,
                  rawId: pl.id,
                  provider: "local",
                  title: pl.name,
                  description: pl.description,
                  ownerName: "Bạn",
                  trackCount: pl.tracks.length,
                  artworkUrl: pl.tracks[0]?.artworkUrl || "/images/placeholder-playlist.svg",
                }}
              />
            ))}
          </div>
        )}
      </section>

      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

