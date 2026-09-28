import { describe, expect, it } from "vitest";
import { createSignalSchema, getRejectionScenario, getResetScenario } from "../src";

describe("Signal validation", () => {
  it("accepts a short anonymous Positive Signal", () => {
    const parsed = createSignalSchema.parse({
      kind: "positive",
      category: "welcoming",
      summary: "People are helping each other near the station.",
      latitude: 4.65,
      longitude: -74.1,
      consentToPublish: true,
    });
    expect(parsed.locale).toBe("en");
  });

  it("rejects a mismatched category", () => {
    expect(() =>
      createSignalSchema.parse({
        kind: "positive",
        category: "harassment",
        latitude: 4.65,
        longitude: -74.1,
        consentToPublish: true,
      }),
    ).toThrow();
  });
});

describe("deterministic wellbeing fallback", () => {
  it("is complete in both languages", () => {
    const reset = getResetScenario("rejection");
    const gym = getRejectionScenario("romantic_rejection");
    expect(reset.validation.en.length).toBeGreaterThan(20);
    expect(reset.validation.es.length).toBeGreaterThan(20);
    expect(gym.coach.en).toHaveLength(3);
    expect(gym.coach.es).toHaveLength(3);
  });
});
