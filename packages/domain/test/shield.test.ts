import { describe, expect, it } from "vitest";
import {
  DE_ESCALATION_PILLARS,
  PRIVATE_DNS_PROFILES,
  isAdultContent,
  isAdultDomain,
  normalizeInputUrl,
} from "../src/shield";

describe("Aurora Shield Domain Logic", () => {
  it("normalizes diverse URL and hostname formats", () => {
    expect(normalizeInputUrl("https://www.Pornhub.com/video/123")).toBe("pornhub.com");
    expect(normalizeInputUrl("HTTP://XVideos.com")).toBe("xvideos.com");
    expect(normalizeInputUrl("chaturbate.com/broadcast")).toBe("chaturbate.com");
    expect(normalizeInputUrl("  www.stripchat.com  ")).toBe("stripchat.com");
  });

  it("detects known adult domains and subdomains", () => {
    expect(isAdultDomain("https://www.pornhub.com")).toBe(true);
    expect(isAdultDomain("video.xvideos.com")).toBe(true);
    expect(isAdultDomain("chaturbate.com")).toBe(true);
    expect(isAdultDomain("xnxx.com")).toBe(true);
    expect(isAdultDomain("https://onlyfans.com/user")).toBe(true);
    expect(isAdultDomain("rule34.xxx")).toBe(true);
  });

  it("permits safe, non-adult domains", () => {
    expect(isAdultDomain("https://google.com")).toBe(false);
    expect(isAdultDomain("https://wikipedia.org")).toBe(false);
    expect(isAdultDomain("https://miaurora.app")).toBe(false);
    expect(isAdultDomain("https://nytimes.com")).toBe(false);
  });

  it("detects adult keywords in text and browser address events", () => {
    expect(isAdultContent("https://www.pornhub.com/view_video.php?viewkey=123")).toBe(true);
    expect(isAdultContent("Searching for hentai uncensored")).toBe(true);
    expect(isAdultContent("Reading about cognitive behavioral therapy")).toBe(false);
  });

  it("provides complete de-escalation pillars with bilingual i18n", () => {
    expect(DE_ESCALATION_PILLARS.length).toBeGreaterThanOrEqual(3);
    for (const pillar of DE_ESCALATION_PILLARS) {
      expect(pillar.title.en.length).toBeGreaterThan(0);
      expect(pillar.title.es.length).toBeGreaterThan(0);
      expect(pillar.neurobiology.en.length).toBeGreaterThan(0);
      expect(pillar.immediateAction.es.length).toBeGreaterThan(0);
    }
  });

  it("defines zero-logging private DNS profiles", () => {
    expect(PRIVATE_DNS_PROFILES.length).toBeGreaterThanOrEqual(2);
    for (const profile of PRIVATE_DNS_PROFILES) {
      expect(profile.zeroLogging).toBe(true);
      expect(profile.hostname.endsWith(".com") || profile.hostname.endsWith(".org")).toBe(true);
    }
  });
});
