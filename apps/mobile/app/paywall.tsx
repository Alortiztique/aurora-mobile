import { useState } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  Check,
  ChevronRight,
  Crown,
  Heart,
  KeyRound,
  Laptop,
  Lock,
  RotateCcw,
  Shield,
  Sparkles,
  X,
  Zap,
} from "lucide-react-native";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Card, Eyebrow } from "../src/components/ui";
import {
  isValidJudgeCode,
  purchaseRevenueCatPlan,
  restoreRevenueCatPurchases,
} from "../src/integrations";
import { useLocale } from "../src/locale";
import { isPioneer, unlockMembershipTier, updateProgress } from "../src/progress";
import { colors, radii, spacing, typography } from "../src/theme";

type PlanKey = "annual" | "monthly" | "pioneer" | "boost";

export default function PaywallScreen() {
  const { locale } = useLocale();
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("annual");
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);

  const handleSelectPlan = (plan: PlanKey) => {
    void Haptics.selectionAsync();
    setSelectedPlan(plan);
  };

  const handleSubscribe = async () => {
    setIsProcessing(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const res = await purchaseRevenueCatPlan(selectedPlan);

      if (res.success) {
        if (selectedPlan === "pioneer") {
          await unlockMembershipTier("pioneer", false);
        } else if (selectedPlan === "boost") {
          await updateProgress((curr) => ({
            ...curr,
            signalsShared: curr.signalsShared + 5,
          }));
        } else {
          await unlockMembershipTier("guardian", false);
        }
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setUnlockedSuccess(true);
      } else if (res.cancelled) {
        // User cancelled in Play Store dialog
      } else {
        // Sideloaded APK or billing unavailable
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          locale === "es" ? "Facturación de Tienda" : "Store Billing",
          locale === "es"
            ? "Para completar aportes voluntarios en vivo, la aplicación debe estar conectada con Google Play Store o Galaxy Store con cuenta de facturación activa.\n\nSi estás evaluando esta versión de Aurora App, ingresa el código oficial SHIPATON2026 para activar el acceso completo."
            : "To complete live voluntary support, the app must connect with Google Play Store or Galaxy Store with active billing.\n\nIf you are evaluating this build of Aurora App, enter the official code SHIPATON2026 to unlock full access."
        );
      }
    } catch {
      Alert.alert(
        locale === "es" ? "Error de conexión" : "Connection Error",
        locale === "es"
          ? "No se pudo conectar con el servicio de facturación. Si estás probando la app, puedes usar el código de juez SHIPATON2026."
          : "Unable to connect to billing service. If you are reviewing the app, you can use the judge code SHIPATON2026."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyJudgeCode = async () => {
    if (!promoCode.trim()) return;

    if (isValidJudgeCode(promoCode)) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await unlockMembershipTier("pioneer", true);
      setUnlockedSuccess(true);
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        locale === "es" ? "Código no reconocido" : "Unrecognized Code",
        locale === "es"
          ? "Si eres juez de RevenueCat Shipaton 2026, usa el código oficial: SHIPATON2026"
          : "If you are a RevenueCat Shipaton 2026 judge, use code: SHIPATON2026"
      );
    }
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    void Haptics.selectionAsync();
    const restored = await restoreRevenueCatPurchases();
    setIsProcessing(false);

    if (restored) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await unlockMembershipTier("guardian", false);
      setUnlockedSuccess(true);
    } else {
      Alert.alert(
        locale === "es" ? "Restauración de compras" : "Restore Purchases",
        locale === "es"
          ? "No se encontraron suscripciones activas vinculadas a tu cuenta de tienda."
          : "No active subscriptions found for this account."
      );
    }
  };

  if (unlockedSuccess) {
    return (
      <View style={styles.successRoot}>
        <View style={styles.successCard}>
          <View style={styles.successIconWrap}>
            <Crown color="#ffb703" size={48} />
          </View>
          <Text style={styles.successTitle}>
            {locale === "es" ? "¡Membresía Activada!" : "Membership Activated!"}
          </Text>
          <Text style={styles.successDesc}>
            {locale === "es"
              ? "Gracias por creer en la soberanía atencional y en el cuidado mutuo de nuestra comunidad. Tu respaldo hace posible un ecosistema libre de algoritmos adictivos."
              : "Thank you for supporting digital agency and community care. Your contribution sustains an ecosystem free of predatory algorithms."}
          </Text>
          <Pressable
            style={styles.btnSuccessClose}
            onPress={() => {
              void Haptics.selectionAsync();
              router.back();
            }}
          >
            <Check color="#ffffff" size={20} />
            <Text style={styles.btnSuccessCloseText}>
              {locale === "es" ? "Comenzar con Aurora" : "Continue to Aurora"}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBadge}>
          <Crown color={colors.zima} size={14} />
          <Text style={styles.topBadgeText}>AURORA COMMONS</Text>
        </View>

        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <X color={colors.textMuted} size={20} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero */}
        <View style={styles.heroSection}>
          <Eyebrow>PATROCINIO ÉTICO & BIENESTAR</Eyebrow>
          <Text style={styles.heroTitle}>
            {locale === "es"
              ? "Empodera tu Recuperación · Sostén el Bien Común"
              : "Empower Your Recovery · Fund the Commons"}
          </Text>
          <Text style={styles.heroSubtitle}>
            {locale === "es"
              ? "Desbloquea analíticas neurales avanzadas, sincronización multi-superficie y contribuye a mantener los servidores libres de publicidad para todos."
              : "Unlock deep neural analytics, cross-device Orion sync, and keep the public map ad-free for everyone."}
          </Text>
        </View>

        {/* Peace Prize Social Good Manifesto */}
        <View style={styles.peacePrizeCard}>
          <View style={styles.peaceHeader}>
            <Heart color={colors.violetSoft} size={16} />
            <Text style={styles.peaceTitle}>
              {locale === "es" ? "El Compromiso de Aurora Core" : "The Aurora Core Guarantee"}
            </Text>
          </View>
          <Text style={styles.peaceText}>
            {locale === "es"
              ? "Todas las herramientas vitales de sobriedad (contador, Urge Shield, respiración táctil y mapa vivo) son y serán siempre 100% gratuitas. Nadie se queda sin ayuda por motivos económicos."
              : "All vital sobriety tools (counter, Urge Shield, tactile breathing, and live signal map) remain 100% free forever. No one is ever locked out due to lack of funds."}
          </Text>
        </View>

        {/* Feature Highlights Grid */}
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIconWrap, { backgroundColor: "rgba(66, 199, 245, 0.12)" }]}>
              <Zap color={colors.zima} size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>
                {locale === "es" ? "Analíticas Neurales Circadianas" : "Circadian Neural Analytics"}
              </Text>
              <Text style={styles.featureDesc}>
                {locale === "es"
                  ? "Mapa de calor de picos de tentación y patrones de recableado dopaminérgico."
                  : "Craving peak heatmaps and dopamine recovery milestones."}
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconWrap, { backgroundColor: "rgba(169, 152, 255, 0.12)" }]}>
              <Laptop color={colors.violetSoft} size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>
                {locale === "es" ? "Escudo Multi-Superficie Orion" : "Cross-Surface Orion Shield"}
              </Text>
              <Text style={styles.featureDesc}>
                {locale === "es"
                  ? "Sincronización de tu racha y escudo protector en tu navegador Google Chrome de escritorio."
                  : "Sync your clean streak and protection to the Orion desktop Chrome extension."}
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconWrap, { backgroundColor: "rgba(101, 222, 180, 0.12)" }]}>
              <Shield color={colors.positive} size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>
                {locale === "es" ? "Aura Guardiana en el Mapa" : "Guardian Aura on Live Map"}
              </Text>
              <Text style={styles.featureDesc}>
                {locale === "es"
                  ? "Distintivo protector en tus aportes comunitarios preservando 100% tu anonimato."
                  : "A distinct protective presence when sharing anonymous street signals."}
              </Text>
            </View>
          </View>
        </View>

        {/* Pricing Tier Selector */}
        <View style={styles.tiersContainer}>
          {/* Tier 1: Guardian Annual (Recommended) */}
          <Pressable
            style={[styles.tierCard, selectedPlan === "annual" && styles.tierCardSelected]}
            onPress={() => handleSelectPlan("annual")}
          >
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedBadgeText}>
                {locale === "es" ? "MÁS POPULAR · 7 DÍAS GRATIS" : "MOST POPULAR · 7 DAYS FREE"}
              </Text>
            </View>

            <View style={styles.tierTopRow}>
              <View style={styles.tierInfo}>
                <Text style={styles.tierName}>
                  {locale === "es" ? "Aurora Guardian Anual" : "Aurora Guardian Annual"}
                </Text>
                <Text style={styles.tierBilled}>
                  {locale === "es" ? "$19.99 USD / año ($1.66/mes)" : "$19.99 USD / year ($1.66/mo)"}
                </Text>
              </View>

              <View style={styles.savingsTag}>
                <Text style={styles.savingsTagText}>-44%</Text>
              </View>
            </View>

            <Text style={styles.tierSub}>
              {locale === "es"
                ? "Prueba 7 días gratis. Cancela cuando quieras sin penalización."
                : "7-day free trial. Cancel anytime without penalty."}
            </Text>
          </Pressable>

          {/* Tier 2: Guardian Monthly */}
          <Pressable
            style={[styles.tierCard, selectedPlan === "monthly" && styles.tierCardSelected]}
            onPress={() => handleSelectPlan("monthly")}
          >
            <View style={styles.tierTopRow}>
              <View style={styles.tierInfo}>
                <Text style={styles.tierName}>
                  {locale === "es" ? "Aurora Guardian Mensual" : "Aurora Guardian Monthly"}
                </Text>
                <Text style={styles.tierBilled}>$2.99 USD / mes</Text>
              </View>

              <View style={[styles.radioCircle, selectedPlan === "monthly" && styles.radioActive]} />
            </View>

            <Text style={styles.tierSub}>
              {locale === "es" ? "Flexibilidad mes a mes." : "Flexible month-to-month support."}
            </Text>
          </Pressable>

          {/* Tier 3: Pioneer Lifetime Pass */}
          <Pressable
            style={[
              styles.tierCard,
              styles.pioneerCard,
              selectedPlan === "pioneer" && styles.pioneerCardSelected,
            ]}
            onPress={() => handleSelectPlan("pioneer")}
          >
            <View style={styles.founderBadge}>
              <Crown color="#ffb703" size={12} />
              <Text style={styles.founderBadgeText}>
                {locale === "es" ? "PASE DE FUNDADOR VITALICIO" : "LIFETIME FOUNDER PASS"}
              </Text>
            </View>

            <View style={styles.tierTopRow}>
              <View style={styles.tierInfo}>
                <Text style={[styles.tierName, { color: "#ffb703" }]}>
                  {locale === "es" ? "Aurora Pioneer Pass" : "Aurora Pioneer Pass"}
                </Text>
                <Text style={styles.tierBilled}>$39.99 USD · Pago Único</Text>
              </View>

              <View style={[styles.radioCircle, selectedPlan === "pioneer" && styles.pioneerRadio]} />
            </View>

            <Text style={styles.tierSub}>
              {locale === "es"
                ? "Acceso vitalicio permanente, insignia dorada en la esfera y mención honorífica en los anales del proyecto."
                : "Permanent lifetime access, golden clarity sphere ring, and honorary mention."}
            </Text>
          </Pressable>

          {/* Tier 4: Boost the Commons */}
          <Pressable
            style={[styles.tierCard, selectedPlan === "boost" && styles.tierCardSelected]}
            onPress={() => handleSelectPlan("boost")}
          >
            <View style={styles.tierTopRow}>
              <View style={styles.tierInfo}>
                <Text style={styles.tierName}>
                  {locale === "es" ? "Boost the Commons" : "Boost the Commons"}
                </Text>
                <Text style={styles.tierBilled}>$4.99 USD · Aporte Único</Text>
              </View>

              <View style={[styles.radioCircle, selectedPlan === "boost" && styles.radioActive]} />
            </View>

            <Text style={styles.tierSub}>
              {locale === "es"
                ? "Micro-patronazgo directo para costear el mapa y servidores libres de rastreadores."
                : "One-time micro-patronage to keep public map servers free of tracking."}
            </Text>
          </Pressable>
        </View>

        {/* CTA Button */}
        <Pressable
          style={[styles.btnSubscribe, isProcessing && styles.btnDisabled]}
          onPress={handleSubscribe}
          disabled={isProcessing}
        >
          <Sparkles color="#ffffff" size={20} />
          <Text style={styles.btnSubscribeText}>
            {selectedPlan === "annual"
              ? locale === "es"
                ? "Comenzar Prueba Gratuita de 7 Días"
                : "Start 7-Day Free Trial"
              : selectedPlan === "pioneer"
              ? locale === "es"
                ? "Obtener Pase Vitalicio Pioneer"
                : "Get Lifetime Pioneer Pass"
              : selectedPlan === "boost"
              ? locale === "es"
                ? "Hacer Aporte al Bien Común ($4.99)"
                : "Boost the Commons ($4.99)"
              : locale === "es"
              ? "Activar Guardian Mensual ($2.99)"
              : "Activate Monthly Guardian ($2.99)"}
          </Text>
        </Pressable>

        {/* Judge & Reviewer Unlock Accordion (Shipaton Testing Rule) */}
        <View style={styles.judgeSection}>
          <Pressable
            style={styles.judgeHeader}
            onPress={() => setShowPromoInput(!showPromoInput)}
          >
            <KeyRound color={colors.zima} size={15} />
            <Text style={styles.judgeHeaderText}>
              {locale === "es"
                ? "¿Eres evaluador del Shipaton 2026? Desbloquear aquí"
                : "Shipaton 2026 Judge or Promo Code?"}
            </Text>
            <ChevronRight
              color={colors.textMuted}
              size={16}
              style={{ transform: [{ rotate: showPromoInput ? "90deg" : "0deg" }] }}
            />
          </Pressable>

          {showPromoInput && (
            <View style={styles.judgeBody}>
              <Text style={styles.judgePrompt}>
                {locale === "es"
                  ? "Ingresa el código oficial de evaluador (SHIPATON2026) para desbloquear todas las funciones sin tarjeta de crédito."
                  : "Enter the official judge code (SHIPATON2026) to test all premium features without a credit card."}
              </Text>

              <View style={styles.judgeInputRow}>
                <TextInput
                  value={promoCode}
                  onChangeText={setPromoCode}
                  placeholder="SHIPATON2026"
                  placeholderTextColor={colors.textMuted}
                  style={styles.judgeInput}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                <Pressable style={styles.btnApplyJudge} onPress={handleApplyJudgeCode}>
                  <Text style={styles.btnApplyJudgeText}>
                    {locale === "es" ? "Canjear" : "Redeem"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Restore Purchases */}
        <Pressable style={styles.restoreButton} onPress={handleRestore}>
          <RotateCcw color={colors.textMuted} size={15} />
          <Text style={styles.restoreButtonText}>
            {locale === "es" ? "Restaurar Compras Previas" : "Restore Previous Purchases"}
          </Text>
        </Pressable>

        {/* Legal Disclaimers & Links */}
        <View style={styles.legalFooter}>
          <Text style={styles.legalNotice}>
            {locale === "es"
              ? "Las suscripciones se renuevan automáticamente salvo cancelación al menos 24 horas antes del fin del período actual en Google Play / Galaxy Store. Puedes gestionar tu suscripción en cualquier momento."
              : "Subscriptions renew automatically unless canceled at least 24 hours prior to the end of the current period in Google Play / Galaxy Store settings."}
          </Text>

          <View style={styles.legalLinksRow}>
            <Pressable onPress={() => router.push("/terms")}>
              <Text style={styles.legalLink}>
                {locale === "es" ? "Términos de Servicio y Política de Privacidad" : "Terms of Service & Privacy Policy"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: 54,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  topBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: "rgba(66, 199, 245, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(66, 199, 245, 0.25)",
  },
  topBadgeText: {
    color: colors.zima,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 60,
    gap: spacing.md,
    maxWidth: 680,
    width: "100%",
    alignSelf: "center",
  },
  heroSection: {
    gap: 6,
  },
  heroTitle: {
    ...typography.title,
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
  },
  heroSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },

  /* Peace Prize Guarantee Card */
  peacePrizeCard: {
    backgroundColor: "rgba(124, 60, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(124, 60, 255, 0.25)",
    borderRadius: radii.medium,
    padding: 14,
    gap: 6,
  },
  peaceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  peaceTitle: {
    color: colors.violetSoft,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  peaceText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
  },

  /* Feature Highlights */
  featuresList: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    padding: 14,
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  featureDesc: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },

  /* Tier Selector */
  tiersContainer: {
    gap: 10,
  },
  tierCard: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.medium,
    padding: 14,
    gap: 6,
    position: "relative",
  },
  tierCardSelected: {
    borderColor: colors.zima,
    backgroundColor: "rgba(66, 199, 245, 0.05)",
  },
  recommendedBadge: {
    position: "absolute",
    top: -10,
    right: 14,
    backgroundColor: colors.zima,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  recommendedBadgeText: {
    color: "#08070c",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  pioneerCard: {
    borderColor: "rgba(255, 183, 3, 0.3)",
    backgroundColor: "rgba(255, 183, 3, 0.03)",
  },
  pioneerCardSelected: {
    borderColor: "#ffb703",
    backgroundColor: "rgba(255, 183, 3, 0.08)",
  },
  founderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  founderBadgeText: {
    color: "#ffb703",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  tierTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tierInfo: {
    gap: 2,
    flex: 1,
  },
  tierName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  tierBilled: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  savingsTag: {
    backgroundColor: "rgba(101, 222, 180, 0.15)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(101, 222, 180, 0.4)",
  },
  savingsTagText: {
    color: colors.positive,
    fontSize: 10,
    fontWeight: "900",
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
  },
  radioActive: {
    borderColor: colors.zima,
    backgroundColor: colors.zima,
  },
  pioneerRadio: {
    borderColor: "#ffb703",
    backgroundColor: "#ffb703",
  },
  tierSub: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },

  /* Primary Button */
  btnSubscribe: {
    minHeight: 54,
    backgroundColor: colors.violet,
    borderRadius: radii.medium,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    shadowColor: colors.violet,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnSubscribeText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 0.4,
  },

  /* Judge Section */
  judgeSection: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: radii.medium,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    overflow: "hidden",
  },
  judgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
  },
  judgeHeaderText: {
    color: colors.zima,
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  judgeBody: {
    padding: 12,
    paddingTop: 0,
    gap: 8,
  },
  judgePrompt: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  judgeInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  judgeInput: {
    flex: 1,
    minHeight: 40,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.small,
    paddingHorizontal: 12,
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },
  btnApplyJudge: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.zima,
    borderRadius: radii.small,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnApplyJudgeText: {
    color: colors.zima,
    fontWeight: "800",
    fontSize: 12,
  },

  /* Restore */
  restoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
  },
  restoreButtonText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },

  /* Legal */
  legalFooter: {
    gap: 8,
    alignItems: "center",
    paddingTop: 6,
  },
  legalNotice: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center",
  },
  legalLinksRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legalLink: {
    color: colors.zima,
    fontSize: 11,
    fontWeight: "700",
  },
  legalDivider: {
    color: colors.textMuted,
    fontSize: 10,
  },

  /* Success Screen */
  successRoot: {
    flex: 1,
    backgroundColor: colors.ink,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  successCard: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(255, 183, 3, 0.4)",
    borderRadius: radii.large,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.md,
  },
  successIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 183, 3, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    ...typography.title,
    color: colors.text,
    textAlign: "center",
  },
  successDesc: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  btnSuccessClose: {
    width: "100%",
    minHeight: 50,
    backgroundColor: colors.violet,
    borderRadius: radii.medium,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: spacing.xs,
  },
  btnSuccessCloseText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 15,
  },
});
