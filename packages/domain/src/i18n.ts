import type { Locale, SignalCategory } from "./types";

export const localeNames: Readonly<Record<Locale, string>> = {
  en: "English",
  es: "Español",
};

export const signalCategoryLabels: Readonly<Record<SignalCategory, Readonly<Record<Locale, string>>>> = {
  well_lit: { en: "Well lit street", es: "Bien iluminado" },
  active: { en: "Busy & populated", es: "Muy concurrido" },
  welcoming: { en: "Active shops & businesses", es: "Comercio abierto y activo" },
  good_atmosphere: { en: "Good vibe / Event", es: "Buena vibra / Evento" },
  something_happening: { en: "Calm & peaceful area", es: "Zona tranquila" },
  accessible: { en: "Walkable & clear sidewalk", es: "Caminable y despejado" },
  good_transport: { en: "Good transport nearby", es: "Buen transporte cerca" },
  poor_lighting: { en: "Dark / Poor lighting", es: "Calle oscura / Poca luz" },
  isolated: { en: "Deserted / Isolated street", es: "Zona muy solitaria" },
  uncomfortable: { en: "Theft / Pickpocket risk", es: "Riesgo de hurto / Raponazo" },
  suspicious_activity: { en: "Suspicious activity", es: "Actividad sospechosa" },
  harassment: { en: "Street harassment", es: "Acoso callejero" },
  aggressive_behavior: { en: "Aggressive behavior / Fight", es: "Pelea / Personas agresivas" },
  transport_disruption: { en: "Unsafe / Disrupted transport", es: "Transporte inseguro / Colapsado" },
  accessibility_barrier: { en: "Blocked path / Dangerous hazard", es: "Paso cerrado u obra peligrosa" },
};

export const appCopy = {
  en: {
    brand: "Aurora App",
    mapTagline: "See what the community has experienced around each place.",
    all: "All",
    positive: "Positive",
    caution: "Caution",
    now: "Now",
    createSignal: "Share a Signal",
    howIsIt: "How is it here right now?",
    addContext: "Add context",
    skip: "Skip",
    publish: "Share with the map",
    anonymous: "No account needed. Your public location is made less precise.",
    limited: "Not enough recent community information here yet.",
    reset: "I need a reset",
    aroundMe: "Around me",
    auroraWalk: "Aurora Walk",
    support: "Support Aurora App",
    legalSupport: "Support for speaking up",
    privacy: "Privacy",
    terms: "Terms",
  },
  es: {
    brand: "Aurora App",
    mapTagline: "Descubre lo que la comunidad ha vivido alrededor de cada lugar.",
    all: "Todo",
    positive: "Positivo",
    caution: "Precaución",
    now: "Ahora",
    createSignal: "Compartir una Señal",
    howIsIt: "¿Cómo se siente este lugar ahora?",
    addContext: "Añadir contexto",
    skip: "Omitir",
    publish: "Compartir en el mapa",
    anonymous: "No necesitas cuenta. Tu ubicación pública pierde precisión.",
    limited: "Todavía no hay suficiente información comunitaria reciente aquí.",
    reset: "Necesito reiniciar",
    aroundMe: "A mi alrededor",
    auroraWalk: "Caminata Aurora",
    support: "Apoyar a Aurora App",
    legalSupport: "Apoyo para alzar la voz",
    privacy: "Privacidad",
    terms: "Términos",
  },
} as const;

export function copyFor(locale: Locale) {
  return appCopy[locale];
}
