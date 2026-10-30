import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import { ZingMp3 } from "zingmp3-api-full";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing song id" }, { status: 400 });
  }

  try {
    let targetStreamUrl: string | null = null;

    if (id.startsWith("audius:")) {
      const audiusRawId = id.replace(/^audius:/, "");
      targetStreamUrl = `https://api.audius.co/v1/tracks/${audiusRawId}/stream?app_name=QMusic`;
    } else {
      // Zing MP3 track
      const rawId = id.replace(/^zingmp3:/, "");
      const songData = await ZingMp3.getSong(rawId);
      targetStreamUrl = songData?.data?.["128"] || null;

      if (!targetStreamUrl) {
        return NextResponse.json(
          {
            error: "Bài hát này thuộc danh mục VIP hoặc hiện không có luồng phát miễn phí trên Zing MP3.",
          },
          { status: 404 }
        );
      }
    }

    // Forward the client's Range header to upstream CDN (essential for audio scrubbing & seeking)
    const rangeHeader = request.headers.get("range");
    const upstreamHeaders: HeadersInit = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    if (rangeHeader) {
      upstreamHeaders["Range"] = rangeHeader;
    }

    // Follow all intermediate 302 redirects on server side to reach the actual audio CDN
    const upstreamRes = await fetch(targetStreamUrl, {
      headers: upstreamHeaders,
      redirect: "follow",
    });

    if (!upstreamRes.ok && upstreamRes.status !== 206) {
      return NextResponse.json(
        { error: `Upstream audio error: ${upstreamRes.statusText}` },
        { status: upstreamRes.status }
      );
    }

    // Prepare response headers for browser HTML5 <audio>
    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", upstreamRes.headers.get("content-type") || "audio/mpeg");
    responseHeaders.set("Accept-Ranges", "bytes");
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Cache-Control", "public, max-age=86400, no-transform");

    const contentLength = upstreamRes.headers.get("content-length");
    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }

    const contentRange = upstreamRes.headers.get("content-range");
    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange);
    }

    // Stream audio bytes directly to the browser
    return new Response(upstreamRes.body, {
      status: upstreamRes.status, // 200 OK or 206 Partial Content
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    console.error("Stream proxy error:", err);
    const message = err instanceof Error ? err.message : "Failed to stream audio";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
