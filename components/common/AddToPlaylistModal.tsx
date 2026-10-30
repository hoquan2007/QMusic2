"use client";

import { useState } from "react";
import { X, Check, Plus, FolderPlus } from "lucide-react";
import { useLibraryStore } from "@/stores/libraryStore";
import { MusicTrack } from "@/types/music";

interface AddToPlaylistModalProps {
  track: MusicTrack | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AddToPlaylistModal({ track, isOpen, onClose }: AddToPlaylistModalProps) {
  const { playlists, addTrackToPlaylist, createPlaylist } = useLibraryStore();
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !track) return null;

  const handleAddToPlaylist = (playlistId: string, playlistName: string) => {
    const added = addTrackToPlaylist(playlistId, track);
    if (added) {
      setSuccessMsg(`Đã thêm vào "${playlistName}"`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1000);
    } else {
      setSuccessMsg(`Bài hát đã có trong "${playlistName}"`);
      setTimeout(() => setSuccessMsg(null), 2000);
    }
  };

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const id = createPlaylist(newPlaylistName.trim());
    addTrackToPlaylist(id, track);
    setNewPlaylistName("");
    setIsCreatingNew(false);
    setSuccessMsg(`Đã tạo và thêm vào "${newPlaylistName}"`);
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-[#12141f] border border-white/10 rounded-2xl p-5 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-bold text-white text-base mb-1">Thêm vào danh sách phát</h3>
        <p className="text-xs text-slate-400 mb-4 line-clamp-1">
          Bài hát: <span className="text-violet-300 font-medium">{track.title}</span>
        </p>

        {successMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-xs text-violet-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Existing playlists list */}
        <div className="max-h-56 overflow-y-auto space-y-1 mb-4 pr-1">
          {playlists.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">
              Chưa có danh sách phát nào
            </p>
          ) : (
            playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => handleAddToPlaylist(pl.id, pl.name)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-left transition-colors group"
              >
                <span className="text-sm font-medium text-slate-200 group-hover:text-violet-300 truncate">
                  {pl.name}
                </span>
                <span className="text-xs text-slate-500">
                  {pl.tracks.length} bài
                </span>
              </button>
            ))
          )}
        </div>

        {/* Quick create new playlist */}
        {isCreatingNew ? (
          <form onSubmit={handleCreateAndAdd} className="space-y-2 pt-2 border-t border-white/5">
            <input
              type="text"
              autoFocus
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Tên danh sách mới..."
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!newPlaylistName.trim()}
                className="px-3 py-1.5 text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-lg disabled:opacity-50"
              >
                Tạo & Thêm
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreatingNew(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-white/10 hover:border-violet-500/50 hover:bg-white/5 text-xs font-medium text-slate-300 hover:text-white transition-all"
          >
            <FolderPlus className="w-4 h-4 text-violet-400" />
            <span>Tạo danh sách phát mới</span>
          </button>
        )}
      </div>
    </div>
  );
}

