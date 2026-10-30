import { LyricLine, SyncedLyrics } from "@/types/music";
import { fetchWithRetry } from "../api/client";

const LRCLIB_BASE_URL = "https://lrclib.net/api";

interface LrclibResponse {
  id: number;
  name?: string;
  trackName?: string;
  artistName?: string;
  albumName?: string;
  duration?: number;
  instrumental?: boolean;
  plainLyrics?: string;
  syncedLyrics?: string;
}

/**
 * Parse standard LRC formatted lyrics string into time-indexed lines
 * Example format:
 * [00:12.34] This is a lyric line
 * [01:05.120] Another lyric line
 */
export function parseLrc(lrcText: string): LyricLine[] {
  if (!lrcText) return [];

  const lines = lrcText.split("\n");
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    timeRegex.lastIndex = 0;
    const matches: { timeMs: number }[] = [];
    let match: RegExpExecArray | null;

    while ((match = timeRegex.exec(trimmed)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const frac = match[3] || "0";
      const milliseconds = frac.length === 2 ? parseInt(frac, 10) * 10 : parseInt(frac, 10);
      matches.push({ timeMs: (minutes * 60 + seconds) * 1000 + milliseconds });
    }

    const text = trimmed.replace(timeRegex, "").trim();

    for (const m of matches) {
      result.push({
        timeMs: m.timeMs,
        text,
      });
    }
  }

  // Sort chronologically
  return result.sort((a, b) => a.timeMs - b.timeMs);
}

/**
 * Clean up title and artist query for more resilient lyrics matching
 * e.g. "Song Name (feat. Artist) [Remix]" -> "Song Name"
 */
function cleanSearchQuery(text: string): string {
  return text
    .replace(/\s*[\(\[](feat\.|ft\.|with|remix|mix|official|exclusive|vip).*?[\)\]]/gi, "")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Fetch lyrics from LRCLIB with Zing MP3 fallback for Vietnamese songs
 */
export async function fetchLyrics(
  trackTitle: string,
  artistName: string,
  duration?: number,
  trackId?: string
): Promise<SyncedLyrics | null> {
  // If track is from Zing MP3, check native Zing lyrics API first
  if (trackId && trackId.startsWith("zingmp3:")) {
    const rawId = trackId.replace(/^zingmp3:/, "");
    try {
      const vnRes = await fetchWithRetry<{ data: SyncedLyrics }>(
        `/api/vietnam/lyric/${rawId}`,
        { timeoutMs: 5000, retries: 1 }
      );
      if (vnRes?.data && (vnRes.data.lines?.length > 0 || vnRes.data.plainLyrics)) {
        return vnRes.data;
      }
    } catch {
      // Fallback to LRCLIB
    }
  }

  const cleanTitle = cleanSearchQuery(trackTitle);
  const cleanArtist = cleanSearchQuery(artistName);

  // Strategy 1: Try exact matching endpoint /get
  try {
    const params = new URLSearchParams({
      track_name: cleanTitle,
      artist_name: cleanArtist,
    });
    if (duration && duration > 0) {
      params.append("duration", String(Math.round(duration)));
    }

    const url = `${LRCLIB_BASE_URL}/get?${params.toString()}`;
    const data = await fetchWithRetry<LrclibResponse>(url, {
      retries: 1,
      timeoutMs: 6000,
      headers: {
        "User-Agent": "QMusic/1.0 (https://github.com/qmusic)",
      },
    });

    if (data && (data.syncedLyrics || data.plainLyrics || data.instrumental)) {
      return {
        isSynced: !!data.syncedLyrics,
        plainLyrics: data.plainLyrics || undefined,
        lines: data.syncedLyrics ? parseLrc(data.syncedLyrics) : [],
        source: "LRCLIB",
        instrumental: !!data.instrumental,
      };
    }
  } catch {
    // Exact match failed, proceed to search
  }

  // Strategy 2: Search endpoint /search with query
  try {
    const searchParams = new URLSearchParams({
      track_name: cleanTitle,
      artist_name: cleanArtist,
    });

    const url = `${LRCLIB_BASE_URL}/search?${searchParams.toString()}`;
    const results = await fetchWithRetry<LrclibResponse[]>(url, {
      retries: 1,
      timeoutMs: 6000,
      headers: {
        "User-Agent": "QMusic/1.0 (https://github.com/qmusic)",
      },
    });

    if (Array.isArray(results) && results.length > 0) {
      // Pick best result: prioritize synced lyrics
      const best = results.find((r) => !!r.syncedLyrics) || results[0];
      return {
        isSynced: !!best.syncedLyrics,
        plainLyrics: best.plainLyrics || undefined,
        lines: best.syncedLyrics ? parseLrc(best.syncedLyrics) : [],
        source: "LRCLIB",
        instrumental: !!best.instrumental,
      };
    }
  } catch {
    // Search failed
  }

  return null;
}

