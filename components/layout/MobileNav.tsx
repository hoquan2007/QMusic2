"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Search, Library, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Khám phá", href: "/discover", icon: Compass },
    { label: "Tìm kiếm", href: "/search", icon: Search },
    { label: "Yêu thích", href: "/favorites", icon: Heart },
    { label: "Thư viện", href: "/library", icon: Library },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-[#090a0f]/95 backdrop-blur-lg border-t border-white/5 flex items-center justify-around px-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-14 py-1 rounded-xl transition-colors",
              isActive ? "text-violet-400 font-medium" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

