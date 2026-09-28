import { useState } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import {
  Bell,
  Check,
  Compass,
  Flame,
  Globe2,
  HeartHandshake,
  MapPin,
  Shield,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Utensils,
  Lock,
} from "lucide-react-native";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Card, Eyebrow, PrimaryButton, Screen, SecondaryButton, Title } from "../src/components/ui";
import { requestUsefulNotifications, scheduleMilestoneAndSupportReminders } from "../src/integrations";
import { useLocale } from "../src/locale";
import { updateProgress } from "../src/progress";
import { colors, radii, spacing, typography } from "../src/theme";

type OnboardingStep = "language" | "mission" | "focus" | "commitment" | "permissions";

export default function OnboardingScreen() {
  const { locale, setLocale } = useLocale();
  const [step, setStep] = useState<OnboardingStep>("language");
  const [selectedFocus, setSelectedFocus] = useState<string>("porn");
  const [personalCommitment, setPersonalCommitment] = useState("");

  const [shieldRequested, setShieldRequested] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);

  const handleSelectLanguage = (lang: "es" | "en") => {
    void Haptics.selectionAsync();
    void setLocale(lang);
    setStep("mission");
  };

  const handleSelectFocus = (focusKey: string) => {
    void Haptics.selectionAsync();
    setSelectedFocus(focusKey);
  };

  const handleOpenAppInfo = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Linking.openSettings();
    } catch {
      // ignore
    }
  };

  const handleRequestShield = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShieldRequested(true);
    try {
      if (Platform.OS === "android") {
        await Linking.sendIntent("android.settings.ACCESSIBILITY_SETTINGS");
      } else {
        await Linking.openSettings();
      }
    } catch {
      await Linking.openSettings();
    }
  };

  const handleRequestNotifications = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const granted = await requestUsefulNotifications();
    setNotificationsGranted(granted);
  };

  const handleRequestLocation = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationGranted(status === "granted");
  };

  const allPermissionsGranted = shieldRequested && notificationsGranted && locationGranted;

  const finishOnboarding = async () => {
    if (!allPermissionsGranted) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const now = Date.now();
    await updateProgress((current) => ({
      ...current,
      onboarded: true,
      onboardedAt: now,
      streakStartedAt: now,
      cleanStreakDays: 1,
      shieldEnabled: true,
      personalCommitment: personalCommitment.trim(),
      blockedPornEnabled: true,
      blockedDoomscrollEnabled: selectedFocus === "scroll" || true,
      blockedCravingsEnabled: selectedFocus === "food" || true,
    }));
    await scheduleMilestoneAndSupportReminders(locale);
    router.replace("/");
  };

  const suggestionChips = locale === "es" ? [
    "Merezco paz mental y respeto en mi vida diaria",
    "Quiero recuperar mi tiempo y enfoque sin pornografía",
    "No permitiré que algoritmos decidan mi atención",
  ] : [
    "I deserve mental peace and respect in my daily life",
    "I want to reclaim my time and focus without porn",
    "I will not let compulsive feeds control my attention",
  ];

  return (
    <Screen>
      {/* Step 0: Language Selection */}
      {step === "language" && (
        <View style={styles.stepContainer}>
          <View style={styles.brandHero}>
            <Image
              source={require("../assets/aurora-logo.png")}
              style={styles.officialLogo}
              resizeMode="contain"
            />
            <Eyebrow>AURORA APP</Eyebrow>
            <Title>Elige tu idioma / Choose your language</Title>
            <Text style={styles.caption}>
              {locale === "es"
                ? "Selecciona tu idioma preferido"
                : "Select your preferred language"}
            </Text>
          </View>

          <View style={styles.languageCards}>
            <Pressable
              accessibilityRole="button"
              style={[styles.languageCard, locale === "es" && styles.languageCardActive]}
              onPress={() => handleSelectLanguage("es")}
            >
              <View style={styles.langLeft}>
                <Text style={styles.flag}>🇨🇴</Text>
                <View>
                  <Text style={styles.languageName}>Español</Text>
                  <Text style={styles.languageSub}>Natural y directo</Text>
                </View>
              </View>
              <View style={[styles.radio, locale === "es" && styles.radioActive]}>
                {locale === "es" && <Check color="#0C0C0E" size={14} />}
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              style={[styles.languageCard, locale === "en" && styles.languageCardActive]}
              onPress={() => handleSelectLanguage("en")}
            >
              <View style={styles.langLeft}>
                <Text style={styles.flag}>🇺🇸</Text>
                <View>
                  <Text style={styles.languageName}>English</Text>
                  <Text style={styles.languageSub}>Clear and concise</Text>
                </View>
              </View>
              <View style={[styles.radio, locale === "en" && styles.radioActive]}>
                {locale === "en" && <Check color="#0C0C0E" size={14} />}
              </View>
            </Pressable>
          </View>
        </View>
      )}

      {/* Step 1: Mission & Brand Identity */}
      {step === "mission" && (
        <View style={styles.stepContainer}>
          <View style={styles.brandHero}>
            <Image
              source={require("../assets/aurora-logo.png")}
              style={styles.officialLogo}
              resizeMode="contain"
            />
            <Eyebrow>{locale === "es" ? "BIENVENIDO A AURORA APP" : "WELCOME TO AURORA APP"}</Eyebrow>
            <Title>
              {locale === "es"
                ? "Toma el control de tu tiempo y tu mente"
                : "Reclaim your attention and focus"}
            </Title>
            <Text style={styles.caption}>
              {locale === "es"
                ? "Una herramienta directa para bloquear distracciones compulsivas y reconectar con el mundo real."
                : "A simple, powerful tool to block compulsive traps and reconnect with real life."}
            </Text>
          </View>

          <Card style={styles.manifestoCard}>
            <View style={styles.manifestoRow}>
              <Flame color={colors.auroraPink} size={20} />
              <Text style={styles.manifestoText}>
                {locale === "es"
                  ? "Bloqueo real de páginas y aplicaciones que consumen tu tiempo."
                  : "Automatic blocking of sites and apps that hijack your attention."}
              </Text>
            </View>
            <View style={styles.manifestoRow}>
              <Shield color={colors.auroraBlue} size={20} />
              <Text style={styles.manifestoText}>
                {locale === "es"
                  ? "Privacidad total: todo se ejecuta dentro de tu teléfono."
                  : "Total privacy: zero tracking, 100% on-device protection."}
              </Text>
            </View>
            <View style={styles.manifestoRow}>
              <Compass color={colors.positive} size={20} />
              <Text style={styles.manifestoText}>
                {locale === "es"
                  ? "Reconexión con tu entorno a través del mapa de señales."
                  : "Reconnect with your city through live community signals."}
              </Text>
            </View>
          </Card>

          <PrimaryButton onPress={() => setStep("focus")}>
            {locale === "es" ? "Comenzar" : "Get Started"}
          </PrimaryButton>
        </View>
      )}

      {/* Step 2: Guard Focus Habit (3 Core Use Cases) */}
      {step === "focus" && (
        <View style={styles.stepContainer}>
          <Eyebrow>{locale === "es" ? "TU ENFOQUE PRINCIPAL" : "PRIMARY FOCUS"}</Eyebrow>
          <Title>
            {locale === "es"
              ? "¿Qué hábito deseas erradicar?"
              : "Which habit do you want to break?"}
          </Title>
          <Text style={styles.caption}>
            {locale === "es"
              ? "Selecciona el área donde Aurora App protegerá tus límites de manera prioritaria."
              : "Select where Aurora App will strictly enforce your boundaries."}
          </Text>

          <View style={styles.focusList}>
            {/* Case 1: Pornography & Compulsive Habits */}
            <Pressable
              style={[styles.focusCard, selectedFocus === "porn" && styles.focusCardActive]}
              onPress={() => handleSelectFocus("porn")}
            >
              <ShieldAlert
                color={selectedFocus === "porn" ? colors.auroraPink : colors.textMuted}
                size={22}
              />
              <View style={styles.focusContent}>
                <View style={styles.focusTitleRow}>
                  <Text style={styles.focusTitle}>
                    {locale === "es"
                      ? "Pornografía y Masturbación Compulsiva"
                      : "Pornography & Compulsive Loops"}
                  </Text>
                  <View style={styles.starBadge}>
                    <Text style={styles.starBadgeText}>
                      {locale === "es" ? "ESTRELLA" : "CORE"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.focusDesc}>
                  {locale === "es"
                    ? "Bloqueo estricto de páginas XXX, OnlyFans, Chaturbate e interrupción reflexiva."
                    : "Strict blocking of adult websites, OnlyFans, Chaturbate, and instant de-escalation."}
                </Text>
              </View>
            </Pressable>

            {/* Case 2: Doomscrolling, Short-form & Comparison */}
            <Pressable
              style={[styles.focusCard, selectedFocus === "scroll" && styles.focusCardActive]}
              onPress={() => handleSelectFocus("scroll")}
            >
              <Smartphone
                color={selectedFocus === "scroll" ? colors.auroraBlue : colors.textMuted}
                size={22}
              />
              <View style={styles.focusContent}>
                <Text style={styles.focusTitle}>
                  {locale === "es"
                    ? "Doomscrolling, Videos Cortos y Comparación"
                    : "Doomscrolling, Shorts & Toxic Comparison"}
                </Text>
                <Text style={styles.focusDesc}>
                  {locale === "es"
                    ? "Fricción cognitiva en TikTok, Instagram Reels, YouTube Shorts y X (Twitter)."
                    : "Cognitive friction on TikTok, Instagram Reels, YouTube Shorts, and X (Twitter)."}
                </Text>
              </View>
            </Pressable>

            {/* Case 3: Junk Food & Cravings */}
            <Pressable
              style={[styles.focusCard, selectedFocus === "food" && styles.focusCardActive]}
              onPress={() => handleSelectFocus("food")}
            >
              <Utensils
                color={selectedFocus === "food" ? colors.caution : colors.textMuted}
                size={22}
              />
              <View style={styles.focusContent}>
                <Text style={styles.focusTitle}>
                  {locale === "es"
                    ? "Cravings y Comida Chatarra Compulsiva"
                    : "Cravings & Compulsive Junk Food"}
                </Text>
                <Text style={styles.focusDesc}>
                  {locale === "es"
                    ? "Fricción frente a apps y portales de delivery nocturno (Uber Eats, Rappi, etc.)."
                    : "Friction against impulsive food delivery apps (Uber Eats, Rappi, McDonald's)."}
                </Text>
              </View>
            </Pressable>
          </View>

          <PrimaryButton onPress={() => setStep("commitment")}>
            {locale === "es" ? "Continuar al Compromiso" : "Proceed to Commitment"}
          </PrimaryButton>
        </View>
      )}

      {/* Step 3: Commitment Contract (Commitment Device) */}
      {step === "commitment" && (
        <View style={styles.stepContainer}>
          <Eyebrow>{locale === "es" ? "DISPOSITIVO DE COMPROMISO" : "COMMITMENT CONTRACT"}</Eyebrow>
          <Title>
            {locale === "es"
              ? "Escribe tu compromiso personal"
              : "Write your personal commitment"}
          </Title>
          <Text style={styles.caption}>
            {locale === "es"
              ? "¿Por qué es importante para ti recuperar tu tiempo y soberanía? Si alguna vez deseas desactivar el escudo, deberás transcribir exactamente este compromiso."
              : "Why is reclaiming your attention vital for you? If you ever wish to disable the shield, you must type this exact text."}
          </Text>

          <Card style={styles.commitmentCard}>
            <TextInput
              style={styles.commitmentInput}
              multiline
              numberOfLines={4}
              value={personalCommitment}
              onChangeText={setPersonalCommitment}
              placeholder={
                locale === "es"
                  ? "Escribe aquí tu motivo profundo (ej. Merezco paz mental, respeto hacia mí mismo y recuperar el control de mi tiempo)."
                  : "Write your core reason here (e.g. I deserve peace of mind, self-respect, and total control of my attention)."
              }
              placeholderTextColor={colors.textMuted}
            />
          </Card>

          <View style={styles.chipSection}>
            <Text style={styles.chipSectionLabel}>
              {locale === "es" ? "O toca una sugerencia para autocompletar:" : "Or tap a prompt to fill in:"}
            </Text>
            <View style={styles.chipsWrap}>
              {suggestionChips.map((chip, idx) => (
                <Pressable
                  key={idx}
                  style={styles.suggestionChip}
                  onPress={() => {
                    void Haptics.selectionAsync();
                    setPersonalCommitment(chip);
                  }}
                >
                  <Text style={styles.suggestionChipText}>"{chip}"</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <PrimaryButton
            disabled={personalCommitment.trim().length < 8}
            style={personalCommitment.trim().length < 8 ? { opacity: 0.5 } : undefined}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setStep("permissions");
            }}
          >
            {locale === "es" ? "Fijar Compromiso y Ver Permisos" : "Lock Commitment & Continue"}
          </PrimaryButton>
        </View>
      )}

      {/* Step 4: Restrictive Mandatory Permissions Checklist */}
      {step === "permissions" && (
        <View style={styles.stepContainer}>
          <Eyebrow>{locale === "es" ? "CHECKLIST RESTRICTIVO" : "MANDATORY CHECKLIST"}</Eyebrow>
          <Title>
            {locale === "es"
              ? "Activa los 3 permisos obligatorios"
              : "Enable the 3 required permissions"}
          </Title>
          <Text style={styles.caption}>
            {locale === "es"
              ? "Para garantizar que Aurora App proteja tu vida de verdad, los 3 permisos son estrictamente necesarios para comenzar."
              : "To ensure Aurora App can truly safeguard your attention, all 3 permissions are strictly required."}
          </Text>

          <View style={styles.permissionsList}>
            {/* Permission 1: Aurora Shield Accessibility */}
            {/* Prominent Accessibility & Privacy In-App Disclosure (Google Play & Galaxy Store Compliance) */}
            <Card style={styles.disclosureCard}>
              <View style={styles.disclosureHeader}>
                <Shield color={colors.auroraBlue} size={18} />
                <Text style={styles.disclosureTitle}>
                  {locale === "es"
                    ? "Divulgación Prominente de Accesibilidad"
                    : "Prominent Accessibility Disclosure"}
                </Text>
              </View>
              <Text style={styles.disclosureBody}>
                {locale === "es"
                  ? "Aurora App utiliza la API AccessibilityService exclusivamente de forma local y en tiempo real para detectar y bloquear sitios para adultos (Pornhub, Chaturbate, OnlyFans, etc.) y aplicaciones de distracción que seleccionaste. No recopila, almacena ni transmite ningún texto tipeado, contraseñas, fotos o datos personales."
                  : "Aurora App uses the AccessibilityService API strictly on-device in real-time to detect and block adult websites (Pornhub, Chaturbate, OnlyFans, etc.) and compulsive apps you select. It never collects, logs, or transmits keystrokes, passwords, private chats, or personal data."}
              </Text>
            </Card>

            {/* Permission 1: Aurora Shield Accessibility */}
            <Card style={[styles.permCard, styles.permCardPrimary, shieldRequested && styles.permCardDone]}>
              <View style={styles.permHeader}>
                <Shield color={colors.auroraBlue} size={22} />
                <View style={{ flex: 1 }}>
                  <View style={styles.permBadgeRow}>
                    <Text style={styles.permTitle}>
                      {locale === "es" ? "1. Escudo Aurora (Accesibilidad)" : "1. Aurora Shield (Accessibility)"}
                    </Text>
                    <View style={styles.permRequiredBadge}>
                      <Text style={styles.permRequiredText}>
                        {locale === "es" ? "OBLIGATORIO" : "MANDATORY"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.permDesc}>
                    {locale === "es"
                      ? "Bloquea instantáneamente páginas para adultos en Chrome y navegadores."
                      : "Instantly blocks adult websites in Chrome and browsers."}
                  </Text>
                </View>
              </View>

              {/* Single Direct Action Button */}
              <View style={styles.permActionCol}>
                <Pressable
                  accessibilityRole="button"
                  style={[styles.stepBtnActivate, shieldRequested && styles.stepBtnDone]}
                  onPress={handleRequestShield}
                >
                  <Text style={[styles.stepBtnActivateText, shieldRequested && styles.stepBtnDoneText]}>
                    {shieldRequested
                      ? (locale === "es" ? "✓ Escudo Activado (Toca para reabrir)" : "✓ Shield Active (Tap to reopen)")
                      : (locale === "es" ? "Activar en Accesibilidad" : "Enable in Accessibility")}
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  style={styles.stepBtnSubtle}
                  onPress={handleOpenAppInfo}
                >
                  <Text style={styles.stepBtnSubtleText}>
                    {locale === "es"
                      ? "¿Ajustes restringidos en Android 13+? Toca aquí para ver Info de la App (⋮)"
                      : "Restricted settings on Android 13+? Tap here to view App Info (⋮)"}
                  </Text>
                </Pressable>
              </View>
            </Card>

            {/* Permission 2: Push Notifications */}
            <Card style={[styles.permCard, notificationsGranted && styles.permCardDone]}>
              <View style={styles.permHeader}>
                <Bell color={colors.auroraPink} size={20} />
                <View style={{ flex: 1 }}>
                  <View style={styles.permBadgeRow}>
                    <Text style={styles.permTitle}>
                      {locale === "es" ? "2. Notificaciones Conscientes" : "2. Mindful Notifications"}
                    </Text>
                    <View style={styles.permRequiredBadge}>
                      <Text style={styles.permRequiredText}>
                        {locale === "es" ? "OBLIGATORIO" : "MANDATORY"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.permDesc}>
                    {locale === "es"
                      ? "Envío de tu compromiso cuando se intercepta un trigger y recordatorios diarios."
                      : "Sends your personal commitment upon trigger block and daily intention check-ins."}
                  </Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                style={[styles.actionButton, notificationsGranted && styles.actionButtonDone]}
                onPress={handleRequestNotifications}
              >
                <Text style={[styles.actionButtonText, notificationsGranted && styles.actionButtonTextDone]}>
                  {notificationsGranted
                    ? (locale === "es" ? "✓ Notificaciones Activadas" : "✓ Notifications Enabled")
                    : (locale === "es" ? "Permitir Notificaciones" : "Allow Notifications")}
                </Text>
              </Pressable>
            </Card>

            {/* Permission 3: Location (Mandatory for Live Map) */}
            <Card style={[styles.permCard, locationGranted && styles.permCardDone]}>
              <View style={styles.permHeader}>
                <MapPin color={colors.positive} size={20} />
                <View style={{ flex: 1 }}>
                  <View style={styles.permBadgeRow}>
                    <Text style={styles.permTitle}>
                      {locale === "es" ? "3. Ubicación GPS (Mapa Vivo)" : "3. GPS Location (Live Map)"}
                    </Text>
                    <View style={styles.permRequiredBadge}>
                      <Text style={styles.permRequiredText}>
                        {locale === "es" ? "OBLIGATORIO" : "MANDATORY"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.permDesc}>
                    {locale === "es"
                      ? "Obligatorio para salir al mundo real, desconectar del celular y sincronizar el mapa comunitario."
                      : "Mandatory to get into the real world, disconnect from screens, and sync live signals."}
                  </Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                style={[styles.actionButton, locationGranted && styles.actionButtonDone]}
                onPress={handleRequestLocation}
              >
                <Text style={[styles.actionButtonText, locationGranted && styles.actionButtonTextDone]}>
                  {locationGranted
                    ? (locale === "es" ? "✓ Ubicación GPS Activada" : "✓ GPS Location Enabled")
                    : (locale === "es" ? "Activar Ubicación GPS" : "Enable GPS Location")}
                </Text>
              </Pressable>
            </Card>
          </View>

          {/* Locked Entry Button until all 3 are granted */}
          <PrimaryButton
            disabled={!allPermissionsGranted}
            style={!allPermissionsGranted ? { opacity: 0.45 } : undefined}
            onPress={() => void finishOnboarding()}
          >
            {allPermissionsGranted
              ? (locale === "es" ? "Comenzar Experiencia Soberana" : "Enter Aurora App")
              : (locale === "es" ? "Activa los 3 permisos para continuar" : "Enable all 3 permissions to continue")}
          </PrimaryButton>

          {/* Transparent Legal Links Footer */}
          <View style={styles.termsFooter}>
            <Text style={styles.termsFooterText}>
              {locale === "es"
                ? "Al comenzar, confirmas que aceptas nuestros "
                : "By continuing, you agree to our "}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Términos y Privacidad"
              onPress={() => router.push("/terms")}
            >
              <Text style={styles.termsLinkText}>
                {locale === "es" ? "Términos de Servicio y Política de Privacidad" : "Terms of Service & Privacy Policy"}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    gap: spacing.md,
    maxWidth: 580,
    width: "100%",
    alignSelf: "center",
    paddingBottom: 40,
  },
  brandHero: {
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  officialLogo: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  caption: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  languageCards: {
    gap: 12,
    marginTop: 8,
  },
  languageCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: radii.medium,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  languageCardActive: {
    borderColor: colors.auroraBlue,
    backgroundColor: colors.surface,
  },
  langLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flag: {
    fontSize: 28,
  },
  languageName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  languageSub: {
    color: colors.textMuted,
    fontSize: 12,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    borderColor: colors.auroraBlue,
    backgroundColor: colors.auroraBlue,
  },
  manifestoCard: {
    gap: 14,
    padding: 18,
    backgroundColor: colors.surfaceRaised,
  },
  manifestoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  manifestoText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  focusList: {
    gap: 10,
  },
  focusCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 16,
    borderRadius: radii.medium,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  focusCardActive: {
    borderColor: colors.auroraBlue,
    backgroundColor: colors.surface,
  },
  focusContent: {
    flex: 1,
    gap: 4,
  },
  focusTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  focusTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    flex: 1,
  },
  starBadge: {
    backgroundColor: "rgba(245, 174, 219, 0.16)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(245, 174, 219, 0.4)",
  },
  starBadgeText: {
    color: colors.auroraPink,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  focusDesc: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  commitmentCard: {
    padding: 14,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.auroraBlue,
    borderWidth: 1,
  },
  commitmentInput: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 90,
    textAlignVertical: "top",
  },
  chipSection: {
    gap: 8,
    marginTop: 4,
  },
  chipSectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  chipsWrap: {
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: radii.small,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontStyle: "italic",
  },
  permissionsList: {
    gap: 12,
  },
  permCard: {
    gap: 12,
    padding: 14,
  },
  permCardPrimary: {
    borderColor: "rgba(117, 132, 193, 0.5)",
    backgroundColor: colors.surfaceRaised,
  },
  permCardDone: {
    borderColor: "rgba(74, 222, 128, 0.4)",
  },
  permHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  permBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  permTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    flex: 1,
  },
  permRequiredBadge: {
    backgroundColor: "rgba(245, 174, 219, 0.16)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(245, 174, 219, 0.4)",
  },
  permRequiredText: {
    color: colors.auroraPink,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  permDesc: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  permActionCol: {
    gap: 8,
    marginTop: 6,
  },
  stepBtnSubtle: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnSubtleText: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  stepBtnActivate: {
    minHeight: 44,
    borderRadius: radii.medium,
    backgroundColor: colors.auroraBlue,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  stepBtnActivateText: {
    color: "#0C0C0E",
    fontSize: 13,
    fontWeight: "800",
  },
  stepBtnDone: {
    backgroundColor: "rgba(74, 222, 128, 0.16)",
    borderWidth: 1,
    borderColor: colors.positive,
  },
  stepBtnDoneText: {
    color: colors.positive,
  },
  actionButton: {
    minHeight: 44,
    borderRadius: radii.medium,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  actionButtonDone: {
    backgroundColor: "rgba(74, 222, 128, 0.16)",
    borderColor: colors.positive,
  },
  actionButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  actionButtonTextDone: {
    color: colors.positive,
    fontWeight: "800",
  },
  permRestrictedNote: {
    color: colors.caution,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 4,
  },
  disclosureCard: {
    backgroundColor: colors.surfaceRaised,
    borderColor: "rgba(117, 132, 193, 0.35)",
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  disclosureHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  disclosureTitle: {
    color: colors.auroraBlueLight,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  disclosureBody: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },

  termsFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 4,
  },
  termsFooterText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  termsLinkText: {
    color: colors.auroraBlue,
    fontSize: 11,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
});
