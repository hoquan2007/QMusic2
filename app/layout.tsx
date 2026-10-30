import type { Metadata, Viewport } from "next";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { LayoutShell } from "@/components/layout/LayoutShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "QMusic — Nền tảng Streaming Âm Nhạc Bản Quyền",
  description:
    "Trải nghiệm nghe nhạc trực tuyến chất lượng cao, khám phá bài hát thịnh hành, đồng bộ lời bài hát thời gian thực và quản lý thư viện cá nhân.",
  icons: {
    icon: "/images/logo.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#090a0f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="antialiased selection:bg-violet-600 selection:text-white">
        <QueryProvider>
          <LayoutShell>{children}</LayoutShell>
        </QueryProvider>
      </body>
    </html>
  );
}

