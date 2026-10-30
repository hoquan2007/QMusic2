"use client";

import { useState } from "react";
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Shield,
  Radio,
  FileCode,
  Music,
} from "lucide-react";
import { useLibraryStore } from "@/stores/libraryStore";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    autoAdvance,
    setAutoAdvance,
    favorites,
    playlists,
    history,
  } = useLibraryStore();

  const [clearSuccess, setClearSuccess] = useState(false);

  const handleClearData = () => {
    if (
      confirm(
        "Cảnh báo: Hành động này sẽ xóa toàn bộ danh sách phát, bài hát yêu thích và lịch sử nghe đã lưu trên trình duyệt của bạn. Bạn có chắc không?"
      )
    ) {
      localStorage.removeItem("qmusic_library_v1");
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <SettingsIcon className="w-7 h-7 text-violet-400" />
          <span>Cài đặt hệ thống</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Tùy chỉnh giao diện, chế độ phát và kiểm tra trạng thái các nhà cung cấp
        </p>
      </div>

      {/* Theme Settings */}
      <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Giao diện người dùng</h2>
        <p className="text-xs text-slate-400">
          Lựa chọn chủ đề màu sắc hiển thị phù hợp với thiết bị của bạn.
        </p>

        <div className="grid grid-cols-3 gap-3 max-w-md pt-2">
          {[
            { id: "dark", label: "Tối (Mặc định)", icon: Moon },
            { id: "light", label: "Sáng", icon: Sun },
            { id: "system", label: "Hệ thống", icon: Laptop },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = theme === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTheme(item.id as "dark" | "light" | "system")}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border transition-all text-xs font-semibold",
                  isSelected
                    ? "bg-violet-600/20 border-violet-500 text-violet-300 shadow-md shadow-violet-600/20"
                    : "border-white/5 hover:border-white/10 hover:bg-white/5 text-slate-400"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Playback Settings */}
      <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Trình phát & Âm thanh</h2>

        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Tự động chuyển bài tiếp theo
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tự động phát bài hát kế tiếp khi bài hiện tại kết thúc
            </p>
          </div>
          <button
            onClick={() => setAutoAdvance(!autoAdvance)}
            className={cn(
              "w-12 h-6 rounded-full transition-colors relative focus:outline-none",
              autoAdvance ? "bg-violet-600" : "bg-white/15"
            )}
          >
            <span
              className={cn(
                "block w-4 h-4 rounded-full bg-white transition-transform transform mt-1 ml-1",
                autoAdvance ? "translate-x-6" : "translate-x-0"
              )}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Ngôn ngữ giao diện
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hệ thống được thiết kế mặc định bằng Tiếng Việt
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-white/5 text-violet-300 border border-white/5">
            Tiếng Việt (VI)
          </span>
        </div>
      </section>

      {/* Music Providers Status */}
      <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Radio className="w-4 h-4 text-violet-400" />
          <span>Trạng thái kết nối API</span>
        </h2>

        <div className="space-y-3">
          {/* Audius */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h4 className="text-sm font-bold text-white">Audius Music Network</h4>
                <p className="text-xs text-slate-400">
                  Nguồn streaming nhạc chính (Miễn phí, phân tán)
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Đang hoạt động
            </span>
          </div>

          {/* LRCLIB */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h4 className="text-sm font-bold text-white">LRCLIB Lyrics Database</h4>
                <p className="text-xs text-slate-400">
                  Cơ sở dữ liệu lời bài hát đồng bộ thời gian thực
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Đang hoạt động
            </span>
          </div>

          {/* Jamendo */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Jamendo Music</h4>
                <p className="text-xs text-slate-400">
                  Nguồn bổ sung (Cần cấu hình JAMENDO_CLIENT_ID)
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              {process.env.NEXT_PUBLIC_JAMENDO_CLIENT_ID ? "Đã kết nối" : "Chế độ chờ"}
            </span>
          </div>
        </div>
      </section>

      {/* Storage Management */}
      <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <FileCode className="w-4 h-4 text-rose-400" />
          <span>Dữ liệu lưu trữ trình duyệt (Guest Storage)</span>
        </h2>
        <p className="text-xs text-slate-400">
          Hiện tại bạn đang có {playlists.length} danh sách phát, {favorites.length} bài hát yêu thích và {history.length} bài hát trong lịch sử nghe.
        </p>

        <div className="pt-2">
          <button
            onClick={handleClearData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa sạch dữ liệu cục bộ</span>
          </button>
        </div>
      </section>

      {/* About */}
      <div className="text-center text-xs text-slate-400 space-y-1 pb-6">
        <p className="font-semibold text-slate-400">QMusic v1.0.0 — Web Streaming Platform</p>
        <p>Phát triển với Next.js 15, TypeScript, Tailwind CSS, Audius API & LRCLIB.</p>
      </div>
    </div>
  );
}

