import * as z from "zod";

export const signalKindSchema = z.enum(["positive", "caution"]);

export const positiveCategorySchema = z.enum([
  "welcoming",
  "good_atmosphere",
  "well_lit",
  "active",
  "accessible",
  "good_transport",
  "something_happening",
]);

export const cautionCategorySchema = z.enum([
  "harassment",
  "uncomfortable",
  "poor_lighting",
  "isolated",
  "aggressive_behavior",
  "suspicious_activity",
  "accessibility_barrier",
  "transport_disruption",
]);

export const signalCategorySchema = z.union([
  positiveCategorySchema,
  cautionCategorySchema,
]);

const coordinateSchema = z.number().finite();

export const createSignalSchema = z
  .object({
    kind: signalKindSchema,
    category: signalCategorySchema.nullable().default(null),
    summary: z.string().trim().min(1).max(280).nullable().default(null),
    pseudonym: z.string().trim().min(2).max(32).nullable().default(null),
    latitude: coordinateSchema.min(-90).max(90),
    longitude: coordinateSchema.min(-180).max(180),
    accuracyMeters: z.number().finite().min(0).max(10_000).nullable().default(null),
    mediaKey: z
      .string()
      .regex(/^pending\/[a-zA-Z0-9_-]{10,80}\.(?:jpg|jpeg|png|webp|mp4|webm)$/)
      .nullable()
      .default(null),
    locale: z.enum(["en", "es"]).default("en"),
    consentToPublish: z.literal(true),
  })
  .superRefine((value, context) => {
    const categoryMatchesKind =
      value.category === null ||
      (value.kind === "positive"
        ? positiveCategorySchema.safeParse(value.category).success
        : cautionCategorySchema.safeParse(value.category).success);

    if (!categoryMatchesKind) {
      context.addIssue({
        code: "custom",
        path: ["category"],
        message: "Category does not match Signal kind",
      });
    }
  });

export type CreateSignalInput = z.infer<typeof createSignalSchema>;

export const pulseQuerySchema = z.object({
  west: z.coerce.number().finite().min(-180).max(180),
  south: z.coerce.number().finite().min(-90).max(90),
  east: z.coerce.number().finite().min(-180).max(180),
  north: z.coerce.number().finite().min(-90).max(90),
  // 0 means all available Signals; positive values apply a recency window.
  sinceHours: z.coerce.number().int().min(0).max(8_760).default(0),
  kind: z.enum(["all", "positive", "caution"]).default("all"),
});

export const confirmationSchema = z.object({
  value: z.enum(["still_true", "helpful", "no_longer_happening"]),
});

export const moderationReportSchema = z.object({
  signalId: z.string().uuid(),
  reason: z.enum([
    "personal_information",
    "targets_a_person",
    "false_or_misleading",
    "harassment_or_hate",
    "graphic_content",
    "spam",
    "other",
  ]),
  details: z.string().trim().max(500).nullable().default(null),
});

export const supportRequestSchema = z.object({
  locale: z.enum(["en", "es"]),
  topic: z.enum(["speaking_up", "content_removal", "legal_process_fear", "other"]),
  message: z.string().trim().min(20).max(2_000),
  contactEmail: z.string().trim().email().max(254),
  consentToContact: z.literal(true),
});

export const createWalkShareSchema = z.object({
  durationMinutes: z.number().int().min(5).max(240),
  label: z.string().trim().min(1).max(80),
});

export const updateWalkShareSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  accuracyMeters: z.number().finite().min(0).max(10_000).nullable().default(null),
  status: z.enum(["active", "arrived", "ended"]).default("active"),
});
