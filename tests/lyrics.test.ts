import { describe, it, expect } from "vitest";
import { parseLrc } from "@/lib/lyrics/lrclib";

describe("LRC Lyrics Parser", () => {
  it("parses standard LRC strings correctly", () => {
    const lrc = `
[00:09.69] First line of song
[00:12.18] Second line of song
[01:05.50] Third line later
    `;

    const lines = parseLrc(lrc);
    expect(lines).toHaveLength(3);

    expect(lines[0].timeMs).toBe(9690);
    expect(lines[0].text).toBe("First line of song");

    expect(lines[1].timeMs).toBe(12180);
    expect(lines[1].text).toBe("Second line of song");

    expect(lines[2].timeMs).toBe(65500);
    expect(lines[2].text).toBe("Third line later");
  });

  it("handles empty or malformed strings without throwing", () => {
    expect(parseLrc("")).toEqual([]);
    expect(parseLrc("Just plain text with no timestamps")).toEqual([]);
  });

  it("sorts lines chronologically if they appear out of order", () => {
    const lrc = `
[00:20.00] Line two
[00:10.00] Line one
    `;
    const lines = parseLrc(lrc);
    expect(lines[0].text).toBe("Line one");
    expect(lines[1].text).toBe("Line two");
  });
});

