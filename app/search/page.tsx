"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, Music, Users, ListMusic } from "lucide-react";
import { musicRegistry } from "@/lib/providers/registry";
import { TrackRow } from "@/components/common/TrackRow";
import { TrackCard } from "@/components/common/TrackCard";
import { ArtistCard } from "@/components/common/ArtistCard";
import { PlaylistCard } from "@/components/common/PlaylistCard";
import { EmptyState } from "@/components/common/EmptyState";
import { TrackRowSkeleton, GridSkeleton } from "@/components/common/Skeleton";
import { cn } from "@/lib/utils";

type SearchTab = "all" | "tracks" | "artists" | "playlists";

function SearchContent() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") || "";

  const [inputVal, setInputVal] = useState(urlQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(urlQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>("all");

  // Sync url param
  useEffect(() => {
    setInputVal(urlQuery);
    setDebouncedQuery(urlQuery);
  }, [urlQuery]);

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputVal.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [inputVal]);

  const {
    data: searchResults,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => musicRegistry.searchAll(debouncedQuery, 30),
    enabled: debouncedQuery.length > 0,
  });

  const tracks = searchResults?.tracks || [];
  const artists = searchResults?.artists || [];
  const playlists = searchResults?.playlists || [];

  const hasAnyResults = tracks.length > 0 || artists.length > 0 || playlists.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Search Input Bar */}
      <div className="relative max-w-2xl">
        <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Tìm bài hát, nghệ sĩ hoặc danh sách phát..."
          className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-base text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 shadow-xl transition-all"
        />
      </div>

      {/* Tabs */}
      {debouncedQuery && (
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          {[
            { id: "all", label: "Tất cả" },
            { id: "tracks", label: `Bài hát (${tracks.length})` },
            { id: "artists", label: `Nghệ sĩ (${artists.length})` },
            { id: "playlists", label: `Danh sách phát (${playlists.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SearchTab)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors",
                activeTab === tab.id
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content states */}
      {!debouncedQuery ? (
        <EmptyState
          icon={SearchIcon}
          title="Bắt đầu tìm kiếm"
          description="Nhập từ khóa về bài hát, giai điệu hoặc nghệ sĩ bạn yêu thích để khám phá."
        />
      ) : isLoading ? (
        <div className="space-y-4">
          <TrackRowSkeleton />
          <TrackRowSkeleton />
          <TrackRowSkeleton />
          <TrackRowSkeleton />
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-sm text-rose-400">
          Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại.
        </div>
      ) : !hasAnyResults ? (
        <EmptyState
          icon={Music}
          title="Không tìm thấy kết quả phù hợp"
          description={`Không tìm thấy nội dung nào khớp với "${debouncedQuery}". Vui lòng thử từ khóa khác.`}
        />
      ) : (
        <div className="space-y-8">
          {/* Tab: All or Tracks */}
          {(activeTab === "all" || activeTab === "tracks") && tracks.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Music className="w-5 h-5 text-violet-400" />
                <span>Bài hát</span>
              </h2>
              <div className="space-y-1">
                {tracks.slice(0, activeTab === "all" ? 6 : tracks.length).map((track, idx) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    index={idx}
                    queueContext={tracks}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Tab: All or Artists */}
          {(activeTab === "all" || activeTab === "artists") && artists.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-400" />
                <span>Nghệ sĩ</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {artists.slice(0, activeTab === "all" ? 6 : artists.length).map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </section>
          )}

          {/* Tab: All or Playlists */}
          {(activeTab === "all" || activeTab === "playlists") && playlists.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-violet-400" />
                <span>Danh sách phát</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {playlists.slice(0, activeTab === "all" ? 6 : playlists.length).map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-500">Đang tải tìm kiếm...</div>}>
      <SearchContent />
    </Suspense>
  );
}

