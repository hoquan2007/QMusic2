import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import { ZingMp3 } from "zingmp3-api-full";
import { parseLrc } from "@/lib/lyrics/lrclib";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: PageProps) {
  const { id } = await params;
  const rawId = id.replace(/^zingmp3:/, "");

  try {
    const res = await ZingMp3.getLyric(rawId);
    const data = res?.data;

    if (!data) {
      return NextResponse.json({ error: "Lyric not found" }, { status: 404 });
    }

    // If file URL exists, fetch the .lrc file
    if (data.file) {
      try {
        const fileRes = await fetch(data.file);
        if (fileRes.ok) {
          const lrcText = await fileRes.text();
          const lines = parseLrc(lrcText);
          return NextResponse.json({
            data: {
              isSynced: true,
              lines,
              source: "Zing MP3 Official",
              instrumental: false,
            },
          });
        }
      } catch {
        // Fallback to sentences
      }
    }

    // Fallback: parse sentences
    if (Array.isArray(data.sentences) && data.sentences.length > 0) {
      const lines = data.sentences.map((s: any) => {
        const text = s.words?.map((w: any) => w.data).join(" ") || "";
        const timeMs = s.words?.[0]?.startTime || 0;
        return { timeMs, text };
      });

      return NextResponse.json({
        data: {
          isSynced: true,
          lines,
          source: "Zing MP3 Official",
          instrumental: false,
        },
      });
    }

    return NextResponse.json({ error: "No lyrics available" }, { status: 404 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch lyric";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

