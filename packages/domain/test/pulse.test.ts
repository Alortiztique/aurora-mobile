import { describe, expect, it } from "vitest";
import { aggregatePulse, freshnessWeight, gridKey, PERMANENT_SIGNAL_EXPIRY, signalExpiry } from "../src";
import type { SignalRecord } from "../src";

const now = Date.UTC(2026, 7, 30, 12);

function signal(overrides: Partial<SignalRecord> = {}): SignalRecord {
  return {
    id: crypto.randomUUID(),
    kind: "positive",
    category: "welcoming",
    summary: null,
    mediaKey: null,
    latitude: 4.6486,
    longitude: -74.107,
    createdAt: now - 10 * 60_000,
    expiresAt: now + 60 * 60_000,
    confirmationCount: 0,
    noLongerCount: 0,
    ...overrides,
  };
}

describe("Aurora Pulse", () => {
  it("quantizes nearby reports into the same privacy cell", () => {
    expect(gridKey(4.64861, -74.10704)).toBe(gridKey(4.64857, -74.10698));
  });

  it("treats recency as a core signal", () => {
    expect(freshnessWeight(now - 60_000, now)).toBeGreaterThan(
      freshnessWeight(now - 12 * 60 * 60_000, now),
    );
  });

  it("reports limited information until more than one live Signal exists", () => {
    const [cell] = aggregatePulse([signal()], now);
    expect(cell?.direction).toBe("limited_information");
    expect(cell?.confidence).toBe("limited");
  });

  it("aggregates Positive and Caution Signals without claiming safety", () => {
    const cells = aggregatePulse(
      [signal(), signal(), signal({ kind: "caution", category: "poor_lighting" })],
      now,
    );
    expect(cells).toHaveLength(1);
    expect(cells[0]?.direction).toBe("mostly_positive");
    expect(cells[0]?.positiveCount).toBe(2);
    expect(cells[0]?.cautionCount).toBe(1);
  });

  it("keeps community confirmations visible at the cell level", () => {
    const [cell] = aggregatePulse([
      signal({ confirmationCount: 3, noLongerCount: 1 }),
      signal({ confirmationCount: 2, noLongerCount: 4 }),
    ], now);
    expect(cell?.confirmationCount).toBe(5);
    expect(cell?.noLongerCount).toBe(5);
  });

  it("removes expired Signals", () => {
    expect(aggregatePulse([signal({ expiresAt: now - 1 })], now)).toEqual([]);
  });

  it("keeps Signals until a review or moderation decision", () => {
    expect(signalExpiry("positive", now)).toBe(PERMANENT_SIGNAL_EXPIRY);
    expect(signalExpiry("caution", now)).toBe(PERMANENT_SIGNAL_EXPIRY);
  });
});
