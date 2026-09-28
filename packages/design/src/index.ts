export const colors = {
  // Official Aurora App Brand Palette
  auroraBlue: "#7584C1",      // RGB (117, 132, 193) - Azul Aurora principal
  auroraBlueLight: "#7786C2", // RGB (119, 134, 194) - Azul Aurora claro
  auroraBlueDark: "#7483C0",  // RGB (116, 131, 192) - Azul Aurora oscuro
  auroraPink: "#F5AEDB",      // RGB (245, 174, 219) - Rosa Aurora
  auroraCream: "#FFFAF1",     // RGB (255, 250, 241) - Crema / blanco cálido
  notebookGrey: "#E7E8EE",    // RGB (231, 232, 238) - Gris Notebook recomendado
  pureWhite: "#FFFFFF",

  // Dark Notebook Paper Surfaces
  ink: "#121217",
  night: "#181820",
  surface: "#1E1E28",
  surfaceRaised: "#272736",

  // Accents mapped to brand
  purple: "#7584C1",
  purpleLight: "#F5AEDB",
  purpleDeep: "#24253A",
  violet: "#7584C1",
  violetSoft: "#F5AEDB",
  zima: "#7584C1",
  zimaSoft: "#7786C2",
  positive: "#4ADE80",
  caution: "#FBBF24",
  danger: "#F43F5E",

  // Typography & Borders
  text: "#FFFAF1",
  textSecondary: "#E7E8EE",
  textMuted: "#9CA3AF",
  border: "#323244",
  borderActive: "#7584C1",
  borderStrong: "#45455E",
} as const;

export const radii = {
  small: 12,
  medium: 18,
  large: 26,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
