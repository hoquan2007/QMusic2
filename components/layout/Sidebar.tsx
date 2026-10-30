"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Home,
  Compass,
  Search,
  Library,
  Heart,
  History,
  PlusCircle,
  Music2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLibraryStore } from "@/stores/libraryStore";
import { useState } from "react";
import { CreatePlaylistModal } from "../common/CreatePlaylistModal";

export function Sidebar() {
  const pathname = usePathname();
  const { playlists } = useLibraryStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mainNav = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Khám phá", href: "/discover", icon: Compass },
    { label: "Tìm kiếm", href: "/search", icon: Search },
  ];

  const libraryNav = [
    { label: "Thư viện", href: "/library", icon: Library },
    { label: "Yêu thích", href: "/favorites", icon: Heart },
    { label: "Lịch sử nghe", href: "/history", icon: History },
  ];

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 h-screen bg-[#0c0d14]/95 dark:bg-[#090a0f]/95 border-r border-white/5 text-slate-300 select-none sticky top-0 left-0 z-30 shrink-0">
        {/* Brand / Logo */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
              <Image
                src="/images/logo.svg"
                alt="QMusic Logo"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                QMusic
              </span>
              <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase -mt-0.5">
                Hi-Res Streaming
              </span>
            </div>
          </Link>
        </div>

        {/* Main Navigation */}
        <div className="px-3 py-2 space-y-1">
          <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Menu chính
          </div>
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-gradient-to-r from-violet-600/30 to-indigo-600/20 text-violet-300 shadow-sm border border-violet-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110",
                    isActive ? "text-violet-400" : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Library Navigation */}
        <div className="px-3 py-2 space-y-1">
          <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Bộ sưu tập
          </div>
          {libraryNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-gradient-to-r from-violet-600/30 to-indigo-600/20 text-violet-300 shadow-sm border border-violet-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110",
                    isActive ? "text-violet-400" : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Playlists */}
        <div className="flex-1 flex flex-col min-h-0 px-3 py-3 border-t border-white/5 mt-2">
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Danh sách phát
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              title="Tạo danh sách phát mới"
              className="p-1 text-slate-400 hover:text-violet-400 hover:bg-white/5 rounded-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 mt-1 pr-1">
            {playlists.length === 0 ? (
              <div className="px-3 py-4 text-xs text-slate-400 text-center">
                Chưa có danh sách phát nào. Nhấn vào dấu + để tạo.
              </div>
            ) : (
              playlists.map((pl) => (
                <Link
                  key={pl.id}
                  href={`/playlist/${pl.id}`}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm truncate transition-colors",
                    pathname === `/playlist/${pl.id}`
                      ? "text-violet-300 bg-white/5 font-medium"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                  )}
                >
                  <Music2 className="w-4 h-4 shrink-0 text-slate-400" />
                  <span className="truncate">{pl.name}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Bottom footer link: Settings */}
        <div className="p-3 border-t border-white/5">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
              pathname === "/settings"
                ? "text-violet-300 bg-white/5"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Cài đặt</span>
          </Link>
        </div>
      </aside>

      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

