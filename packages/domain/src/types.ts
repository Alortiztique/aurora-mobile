export type Locale = "en" | "es";

export type SignalKind = "positive" | "caution";

export type PositiveCategory =
  | "welcoming"
  | "good_atmosphere"
  | "well_lit"
  | "active"
  | "accessible"
  | "good_transport"
  | "something_happening";

export type CautionCategory =
  | "harassment"
  | "uncomfortable"
  | "poor_lighting"
  | "isolated"
  | "aggressive_behavior"
  | "suspicious_activity"
  | "accessibility_barrier"
  | "transport_disruption";

export type SignalCategory = PositiveCategory | CautionCategory;

export interface SignalRecord {
  readonly id: string;
  readonly kind: SignalKind;
  readonly category: SignalCategory | null;
  readonly summary: string | null;
  readonly mediaKey: string | null;
  readonly latitude: number;
  readonly longitude: number;
  readonly createdAt: number;
  readonly expiresAt: number;
  readonly confirmationCount: number;
  readonly noLongerCount: number;
}

export type PulseDirection =
  | "mostly_positive"
  | "mixed"
  | "more_caution"
  | "limited_information";

export type PulseConfidence = "limited" | "emerging" | "established";

export interface PulseCell {
  readonly id: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly direction: PulseDirection;
  readonly confidence: PulseConfidence;
  readonly score: number;
  readonly positiveCount: number;
  readonly cautionCount: number;
  readonly signalCount: number;
  readonly confirmationCount: number;
  readonly noLongerCount: number;
  readonly updatedAt: number;
}

export type ResetScenarioId =
  | "doomscrolling"
  | "sexual_content"
  | "body_comparison"
  | "social_comparison"
  | "rejection"
  | "loneliness"
  | "anger"
  | "gender_war";

export interface ResetScenario {
  readonly id: ResetScenarioId;
  readonly label: Readonly<Record<Locale, string>>;
  readonly validation: Readonly<Record<Locale, string>>;
  readonly reflection: Readonly<Record<Locale, string>>;
  readonly action: Readonly<Record<Locale, string>>;
}

export type RejectionScenarioId =
  | "romantic_rejection"
  | "left_on_read"
  | "friend_exclusion"
  | "job_rejection"
  | "criticism"
  | "low_engagement"
  | "body_comparison"
  | "sexual_inadequacy"
  | "hostile_narrative";

export interface RejectionScenario {
  readonly id: RejectionScenarioId;
  readonly label: Readonly<Record<Locale, string>>;
  readonly roleplay: Readonly<Record<Locale, string>>;
  readonly exitRole: Readonly<Record<Locale, string>>;
  readonly coach: Readonly<Record<Locale, readonly string[]>>;
}
