"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, Sun, Moon } from "lucide-react";
import { useLibraryStore } from "@/stores/libraryStore";

export function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(initialQuery);
  const { theme, setTheme } = useLibraryStore();

  useEffect(() => {
    setSearchInput(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <header className="h-16 border-b border-white/5 bg-[#090a0f]/80 backdrop-blur-md sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Navigation history controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          title="Quay lại"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => router.forward()}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors hidden sm:flex"
          title="Tiếp tục"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Global Search Input */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex-1 max-w-md relative"
      >
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Tìm bài hát, nghệ sĩ, danh sách phát..."
          className="w-full pl-10 pr-4 py-2 bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 rounded-full text-sm text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/60 transition-all"
        />
      </form>

      {/* Actions: Theme toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-violet-400" />
          )}
        </button>

        {/* Guest Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600/10 to-cyan-500/10 border border-violet-500/20 text-xs font-medium text-violet-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Khách Vô Danh
        </div>
      </div>
    </header>
  );
}

