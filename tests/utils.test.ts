import { describe, it, expect } from "vitest";
import { formatDuration, formatCount } from "@/lib/utils";

describe("Utils: formatDuration", () => {
  it("formats 0 seconds properly", () => {
    expect(formatDuration(0)).toBe("0:00");
  });

  it("formats under a minute", () => {
    expect(formatDuration(45)).toBe("0:45");
    expect(formatDuration(9)).toBe("0:09");
  });

  it("formats multiple minutes", () => {
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(234)).toBe("3:54");
  });

  it("formats hours", () => {
    expect(formatDuration(3600)).toBe("1:00:00");
    expect(formatDuration(3665)).toBe("1:01:05");
  });

  it("handles negative and NaN values gracefully", () => {
    expect(formatDuration(-5)).toBe("0:00");
    expect(formatDuration(NaN)).toBe("0:00");
  });
});

describe("Utils: formatCount", () => {
  it("formats small numbers", () => {
    expect(formatCount(123)).toBe("123");
  });

  it("formats thousands", () => {
    expect(formatCount(1400)).toBe("1.4K");
    expect(formatCount(15200)).toBe("15.2K");
  });

  it("formats millions", () => {
    expect(formatCount(2500000)).toBe("2.5M");
  });
});

