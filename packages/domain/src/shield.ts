/**
 * @file shield.ts
 * Pure functional domain logic for Aurora Shield:
 * - On-device adult website & explicit content detection
 * - De-escalation pillars for harmful narratives (porn compulsion, hostile gender/incel loops, body dysmorphia)
 * - Zero-tracking Private DNS configuration profiles
 */

export const TOP_ADULT_DOMAINS: readonly string[] = [
  "pornhub.com",
  "xvideos.com",
  "xnxx.com",
  "xhamster.com",
  "redtube.com",
  "youporn.com",
  "chaturbate.com",
  "stripchat.com",
  "onlyfans.com",
  "fansly.com",
  "camsoda.com",
  "livejasmin.com",
  "bongacams.com",
  "rule34.xxx",
  "e-hentai.org",
  "nhentai.net",
  "spankbang.com",
  "tubegalore.com",
  "brazzers.com",
  "bangbros.com",
  "tnaflix.com",
  "eporner.com",
  "xcafe.com",
  "beeg.com",
  "porn.com",
  "motherless.com",
  "heavy-r.com",
  "literotica.com",
  "slutload.com",
  "hentaihaven.xxx",
  "fakku.net",
  "gelbooru.com",
  "danbooru.donmai.us",
  "hqporner.com",
  "empflix.com",
  "xmoviesforyou.com",
  "fuq.com",
  "alohatube.com",
  "daftsex.com",
  "porntrex.com",
  "czechav.com",
] as const;

export const ADULT_KEYWORDS: readonly string[] = [
  "pornhub",
  "xvideos",
  "xnxx",
  "xhamster",
  "redtube",
  "youporn",
  "chaturbate",
  "stripchat",
  "onlyfans",
  "fansly",
  "camsoda",
  "livejasmin",
  "rule34",
  "nhentai",
  "spankbang",
  "brazzers",
  "bangbros",
  "eporner",
  "pornografia",
  "hentai",
  "escort",
] as const;

/**
 * Normalizes a raw URL or domain string to extract the effective lowercased hostname or path fragment.
 */
export function normalizeInputUrl(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  try {
    const withProtocol = trimmed.includes("://") ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return trimmed.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] ?? trimmed;
  }
}

/**
 * Pure function: Checks if a hostname or URL represents a known adult site.
 */
export function isAdultDomain(hostnameOrUrl: string): boolean {
  if (!hostnameOrUrl) return false;
  const normalized = normalizeInputUrl(hostnameOrUrl);

  for (const domain of TOP_ADULT_DOMAINS) {
    if (normalized === domain || normalized.endsWith(`.${domain}`)) {
      return true;
    }
  }

  // Check explicit keyword matches within domain
  for (const keyword of ADULT_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if raw text (e.g. from an accessibility event, title, or address bar) indicates adult content.
 */
export function isAdultContent(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();

  // Match against known adult domains or adult keywords
  return isAdultDomain(lower) || ADULT_KEYWORDS.some((kw) => lower.includes(kw));
}

export type HarmfulPatternCategory =
  | "porn_compulsion"
  | "hostile_gender"
  | "body_dysmorphia"
  | "doom_comparison";

export interface DeEscalationPillar {
  readonly id: HarmfulPatternCategory;
  readonly title: { readonly en: string; readonly es: string };
  readonly subtitle: { readonly en: string; readonly es: string };
  readonly neurobiology: { readonly en: string; readonly es: string };
  readonly immediateAction: { readonly en: string; readonly es: string };
  readonly iconName: "Shield" | "Heart" | "Eye" | "Compass";
}

export const DE_ESCALATION_PILLARS: readonly DeEscalationPillar[] = [
  {
    id: "porn_compulsion",
    title: {
      en: "Porn & Compulsive Urge Shield",
      es: "Escudo contra Porno y Compulsión",
    },
    subtitle: {
      en: "Break the artificial dopamine loop and restore baseline autonomic regulation.",
      es: "Rompe el bucle de dopamina artificial y restaura la calma autonómica basal.",
    },
    neurobiology: {
      en: "High-speed novelty floods the nucleus accumbens, down-regulating D2 receptors. Controlled breathing reactivates prefrontal inhibitory control within 90 seconds.",
      es: "La novedad artificial hiperestimula el núcleo accumbens reduciendo receptores D2. La respiración controlada reactiva el control prefrontal en 90 segundos.",
    },
    immediateAction: {
      en: "Tactile Box Breathing (4-4-4-4) with eyes closed.",
      es: "Respiración Box Breathing (4-4-4-4) táctil con ojos cerrados.",
    },
    iconName: "Shield",
  },
  {
    id: "hostile_gender",
    title: {
      en: "De-radicalizing Gender Hostility",
      es: "Desactivar la Hostilidad de Género",
    },
    subtitle: {
      en: "Dismantle grievance narratives, incel rabbit holes, and virtual resentment.",
      es: "Desmonta narrativas de resentimiento, espirales incel y desprecio hacia las mujeres.",
    },
    neurobiology: {
      en: "Online algorithmic silos exploit isolation into tribal hostility. Physical eye contact, somatic grounding, and real-world presence break catastrophic attribution.",
      es: "Los algoritmos explotan la soledad transformándola en hostilidad tribal. La presencia real y el contacto humano rompen las atribuciones hostiles.",
    },
    immediateAction: {
      en: "Aurora Walk: Step into lit, active urban streets.",
      es: "Caminata Aurora: Sal a la calle en un entorno iluminado y activo.",
    },
    iconName: "Compass",
  },
  {
    id: "body_dysmorphia",
    title: {
      en: "Body Sovereignty & Dysmorphia Shield",
      es: "Soberanía Corporal frente a la Dismorfia",
    },
    subtitle: {
      en: "Halt algorithmic comparison traps, appearance anxiety, and eating distress.",
      es: "Detén las trampas de comparación estética, la angustia corporal y el malestar alimentario.",
    },
    neurobiology: {
      en: "Curated social imagery distorts insular cortex body schema. Reconnecting with physical kinesthetic sensation dissolves the comparison reflex.",
      es: "Las imágenes filtradas distorsionan la corteza insular. Reconectar con la sensación física interna disuelve el reflejo comparativo.",
    },
    immediateAction: {
      en: "Somatic sensory grounding and digital disconnect.",
      es: "Anclaje somatosensorial y desconexión digital inmediata.",
    },
    iconName: "Heart",
  },
] as const;

export interface PrivateDnsProfile {
  readonly name: string;
  readonly hostname: string;
  readonly description: { readonly en: string; readonly es: string };
  readonly zeroLogging: boolean;
}

export const PRIVATE_DNS_PROFILES: readonly PrivateDnsProfile[] = [
  {
    name: "Cloudflare 1.1.1.3 Family",
    hostname: "family.cloudflare-dns.com",
    description: {
      en: "Official Cloudflare DNS with automatic malware and adult domain blocking. Zero battery usage, system-wide.",
      es: "DNS oficial de Cloudflare con bloqueo automático de malware y sitios para adultos. Cero consumo de batería a nivel de sistema.",
    },
    zeroLogging: true,
  },
  {
    name: "CleanBrowsing Family Filter",
    hostname: "family-filter-dns.cleanbrowsing.org",
    description: {
      en: "Strict family filter blocking adult content, phishing, and mixed explicit media globally across all Android apps.",
      es: "Filtro familiar estricto que bloquea contenido para adultos y phishing en todas las aplicaciones de Android.",
    },
    zeroLogging: true,
  },
] as const;
