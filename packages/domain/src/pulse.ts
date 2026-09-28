import type { PulseCell, PulseConfidence, PulseDirection, SignalRecord } from "./types";

const HOUR_MS = 60 * 60 * 1_000;

/** SQLite-safe sentinel used for Signals that remain until community review or moderation. */
export const PERMANENT_SIGNAL_EXPIRY = Number.MAX_SAFE_INTEGER;

export function signalExpiry(_kind: SignalRecord["kind"], _createdAt: number): number {
  return PERMANENT_SIGNAL_EXPIRY;
}

export function quantizeCoordinate(value: number, precision = 3): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

/** Public map precision: about 11 m at the equator, with less precision toward the poles. */
export const PUBLIC_LOCATION_PRECISION = 4;

export function gridKey(latitude: number, longitude: number, precision = PUBLIC_LOCATION_PRECISION): string {
  return `${quantizeCoordinate(latitude, precision).toFixed(precision)}:${quantizeCoordinate(longitude, precision).toFixed(precision)}`;
}

export function freshnessWeight(createdAt: number, now: number, halfLifeHours = 6): number {
  const ageHours = Math.max(0, now - createdAt) / HOUR_MS;
  return 0.5 ** (ageHours / halfLifeHours);
}

function directionFrom(score: number, count: number): PulseDirection {
  if (count < 2) return "limited_information";
  if (score >= 0.24) return "mostly_positive";
  if (score <= -0.24) return "more_caution";
  return "mixed";
}

function confidenceFrom(count: number): PulseConfidence {
  if (count < 3) return "limited";
  if (count < 8) return "emerging";
  return "established";
}

export function aggregatePulse(
  records: readonly SignalRecord[],
  now = Date.now(),
  precision = PUBLIC_LOCATION_PRECISION,
): readonly PulseCell[] {
  const liveRecords = records.filter((record) => record.expiresAt > now);
  const groups = new Map<string, SignalRecord[]>();

  for (const record of liveRecords) {
    const key = gridKey(record.latitude, record.longitude, precision);
    const existing = groups.get(key);
    if (existing) existing.push(record);
    else groups.set(key, [record]);
  }

  return [...groups.entries()]
    .map(([id, group]): PulseCell => {
      let weightedBalance = 0;
      let totalWeight = 0;
      let positiveCount = 0;
      let cautionCount = 0;
      let confirmationCount = 0;
      let noLongerCount = 0;
      let updatedAt = 0;

      for (const signal of group) {
        const weight = freshnessWeight(signal.createdAt, now) * (1 + Math.min(signal.confirmationCount, 5) * 0.08);
        totalWeight += weight;
        weightedBalance += signal.kind === "positive" ? weight : -weight;
        if (signal.kind === "positive") positiveCount += 1;
        else cautionCount += 1;
        confirmationCount += signal.confirmationCount;
        noLongerCount += signal.noLongerCount;
        updatedAt = Math.max(updatedAt, signal.createdAt);
      }

      const score = totalWeight === 0 ? 0 : weightedBalance / totalWeight;
      const [latitudeText, longitudeText] = id.split(":");
      const latitude = Number(latitudeText);
      const longitude = Number(longitudeText);

      return {
        id,
        latitude,
        longitude,
        direction: directionFrom(score, group.length),
        confidence: confidenceFrom(group.length),
        score,
        positiveCount,
        cautionCount,
        signalCount: group.length,
        confirmationCount,
        noLongerCount,
        updatedAt,
      };
    })
    .sort((left, right) => right.updatedAt - left.updatedAt);
}
