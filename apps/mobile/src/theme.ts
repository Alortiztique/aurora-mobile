import { colors, radii, spacing } from "@aurora/design";

export { colors, radii, spacing };

export const typography = {
  display: { fontSize: 36, lineHeight: 40, fontWeight: "700" as const, letterSpacing: -1.2 },
  title: { fontSize: 24, lineHeight: 29, fontWeight: "700" as const, letterSpacing: -0.5 },
  heading: { fontSize: 18, lineHeight: 23, fontWeight: "700" as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: "400" as const },
  label: { fontSize: 12, lineHeight: 16, fontWeight: "700" as const, letterSpacing: 0.8 },
} as const;
