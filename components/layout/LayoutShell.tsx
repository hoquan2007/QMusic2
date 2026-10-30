"use client";

import { useEffect, Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { BottomPlayer } from "../player/BottomPlayer";
import { ExpandedPlayer } from "../player/ExpandedPlayer";
import { LyricsSheet } from "../player/LyricsSheet";
import { QueueDrawer } from "../player/QueueDrawer";
import { AudioEngine } from "../player/AudioEngine";
import { useLibraryStore } from "@/stores/libraryStore";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { theme } = useLibraryStore();

  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#090a0f] text-slate-100">
      {/* Audio Singleton Engine */}
      <AudioEngine />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden relative">
        <Suspense fallback={<div className="h-16 border-b border-white/5 bg-[#090a0f]/80" />}>
          <Header />
        </Suspense>

        <main className="flex-1 overflow-y-auto pb-28 md:pb-24 px-4 sm:px-6 md:px-8 py-6">
          {children}
        </main>
      </div>

      {/* Persistent Audio Player at bottom */}
      <BottomPlayer />

      {/* Fullscreen Player Modal */}
      <ExpandedPlayer />

      {/* Synced Lyrics Drawer */}
      <LyricsSheet />

      {/* Active Queue Drawer */}
      <QueueDrawer />

      {/* Mobile Tab Navigation */}
      <MobileNav />
    </div>
  );
}

