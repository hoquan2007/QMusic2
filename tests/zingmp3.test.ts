import { describe, it, expect } from "vitest";
import { ZingMp3Provider } from "@/lib/providers/zingmp3";
import { musicRegistry } from "@/lib/providers/registry";

describe("ZingMp3 Vietnamese Music Provider", () => {
  const provider = new ZingMp3Provider();

  it("is always configured and ready", () => {
    expect(provider.isConfigured()).toBe(true);
    expect(provider.name).toBe("zingmp3");
    expect(provider.displayName).toContain("Zing MP3");
  });

  it("registry correctly identifies zingmp3 tracks", () => {
    const prov = musicRegistry.getProviderForTrack("zingmp3:ZWZB96AB");
    expect(prov.name).toBe("zingmp3");
  });

  it("registry correctly identifies audius tracks", () => {
    const prov = musicRegistry.getProviderForTrack("audius:W08NKdZ");
    expect(prov.name).toBe("audius");
  });
});

