import { useState } from "react";
import { router } from "expo-router";
import {
  AlertTriangle,
  Bell,
  Check,
  ChevronRight,
  ExternalLink,
  Flame,
  Globe,
  Heart,
  Laptop,
  Lock,
  MapPin,
  Power,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Utensils,
  X,
} from "lucide-react-native";
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Card, Eyebrow, PrimaryButton, SecondaryButton } from "./ui";
import { useLocale } from "../locale";
import { updateProgress, type Progress } from "../progress";
import { colors, radii, spacing, typography } from "../theme";

interface ShieldTabProps {
  progress: Progress | null;
  onToggleShield: (enabled: boolean) => void;
  onToggleLockdown: (enabled: boolean) => void;
  onOpenSOS?: () => void;
  onNavigateTab?: (tab: "home" | "map" | "community" | "shield") => void;
}

export function ShieldTab({
  progress,
  onToggleShield,
  onToggleLockdown,
  onOpenSOS,
  onNavigateTab,
}: ShieldTabProps) {
  const { locale } = useLocale();
  const isProtected = progress?.shieldEnabled ?? true;

  // Use case states
  const [pornEnabled, setPornEnabled] = useState(progress?.blockedPornEnabled ?? true);
  const [doomscrollEnabled, setDoomscrollEnabled] = useState(progress?.blockedDoomscrollEnabled ?? true);
  const [cravingsEnabled, setCravingsEnabled] = useState(progress?.blockedCravingsEnabled ?? true);

  // Deliberate Friction Modal State
  const [showFrictionModal, setShowFrictionModal] = useState(false);
  const [frictionInput, setFrictionInput] = useState("");
  const [pendingAction, setPendingAction] = useState<"shield_off" | "porn_off" | "scroll_off" | "food_off" | null>(null);

  // Custom blocklist state
  const [customSites, setCustomSites] = useState<string[]>(
    progress?.customBlockedSites ? [...progress.customBlockedSites] : []
  );
  const [newSiteInput, setNewSiteInput] = useState("");

  const handleAddCustomSite = async () => {
    const clean = newSiteInput
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/.*$/, "");
    if (!clean || customSites.includes(clean)) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = [...customSites, clean];
    setCustomSites(next);
    setNewSiteInput("");
    await updateProgress((c) => ({ ...c, customBlockedSites: next }));
  };

  const handleRemoveCustomSite = async (siteToRemove: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = customSites.filter((s) => s !== siteToRemove);
    setCustomSites(next);
    await updateProgress((c) => ({ ...c, customBlockedSites: next }));
  };

  const commitment = progress?.personalCommitment || (locale === "es" ? "Recuperar mi soberanía y atención" : "Reclaim my agency and attention");

  const handleOpenAppDetails = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Linking.openSettings();
    } catch {
      // ignore
    }
  };

  const handleOpenAccessibility = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

  const requestDisableAction = (action: "shield_off" | "porn_off" | "scroll_off" | "food_off") => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setPendingAction(action);
    setFrictionInput("");
    setShowFrictionModal(true);
  };

  const handleConfirmFriction = async () => {
    if (frictionInput.trim().toLowerCase() !== commitment.trim().toLowerCase()) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowFrictionModal(false);

    // Record conscious relapse / pause in analytics
    await updateProgress((curr) => ({
      ...curr,
      relapsesCount: (curr.relapsesCount || 0) + 1,
    }));

    if (pendingAction === "shield_off") {
      onToggleShield(false);
    } else if (pendingAction === "porn_off") {
      setPornEnabled(false);
      await updateProgress((c) => ({ ...c, blockedPornEnabled: false }));
    } else if (pendingAction === "scroll_off") {
      setDoomscrollEnabled(false);
      await updateProgress((c) => ({ ...c, blockedDoomscrollEnabled: false }));
    } else if (pendingAction === "food_off") {
      setCravingsEnabled(false);
      await updateProgress((c) => ({ ...c, blockedCravingsEnabled: false }));
    }
    setPendingAction(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Eyebrow>{locale === "es" ? "PANEL DE CONTROL Y PRIVACIDAD" : "CONTROL PANEL & PRIVACY"}</Eyebrow>
        <Text style={styles.title}>
          {locale === "es" ? "Escudo Soberano" : "Sovereign Shield"}
        </Text>
      </View>

      {/* Main Master Shield Card */}
      <Card style={[styles.statusCard, isProtected ? styles.statusActive : styles.statusInactive]}>
        <View style={styles.statusRow}>
          <View style={styles.statusInfo}>
            <View style={styles.statusIconWrap}>
              {isProtected ? (
                <ShieldCheck color={colors.auroraBlue} size={24} />
              ) : (
                <ShieldAlert color={colors.caution} size={24} />
              )}
            </View>
            <View>
              <Text style={styles.statusTitle}>
                {isProtected
                  ? (locale === "es" ? "Escudo Activo" : "Shield Active")
                  : (locale === "es" ? "Escudo en Pausa" : "Shield Paused")}
              </Text>
              <Text style={styles.statusSub}>
                {isProtected
                  ? (locale === "es" ? "Bloqueo on-device en tiempo real" : "Real-time on-device protection")
                  : (locale === "es" ? "Protección pausada" : "Protection paused")}
              </Text>
            </View>
          </View>

          <Switch
            value={isProtected}
            onValueChange={(val) => {
              if (!val) {
                requestDisableAction("shield_off");
              } else {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                onToggleShield(true);
              }
            }}
            trackColor={{ false: colors.border, true: colors.auroraBlue }}
            thumbColor="#ffffff"
          />
        </View>
      </Card>

      {/* Section 1: The 3 Core Habit Use Cases */}
      <Text style={styles.sectionHeading}>
        {locale === "es" ? "Límites y Hábitos Protegidos" : "Protected Habit Boundaries"}
      </Text>

      {/* Case 1: Pornography & Compulsive Loops (Core) */}
      <Card style={styles.settingCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingText}>
            <View style={styles.settingBadgeRow}>
              <ShieldAlert color={colors.auroraPink} size={16} />
              <Text style={styles.settingName}>
                {locale === "es" ? "Pornografía y Contenido Adulto" : "Pornography & Adult Content"}
              </Text>
            </View>
            <Text style={styles.settingDesc}>
              {locale === "es"
                ? "Bloqueo inmediato de Pornhub, Chaturbate, OnlyFans, sitios XXX y modo incógnito."
                : "Instant blocking of adult websites, OnlyFans, Chaturbate, and incognito triggers."}
            </Text>
          </View>
          <Switch
            value={pornEnabled}
            onValueChange={(val) => {
              if (!val) {
                requestDisableAction("porn_off");
              } else {
                void Haptics.selectionAsync();
                setPornEnabled(true);
                void updateProgress((c) => ({ ...c, blockedPornEnabled: true }));
              }
            }}
            trackColor={{ false: colors.border, true: colors.auroraPink }}
            thumbColor="#ffffff"
          />
        </View>
      </Card>

      {/* Case 2: Doomscrolling & Short Videos */}
      <Card style={styles.settingCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingText}>
            <View style={styles.settingBadgeRow}>
              <Smartphone color={colors.auroraBlue} size={16} />
              <Text style={styles.settingName}>
                {locale === "es" ? "Doomscrolling y Videos Cortos" : "Doomscrolling & Short Videos"}
              </Text>
            </View>
            <Text style={styles.settingDesc}>
              {locale === "es"
                ? "Fricción en TikTok, Instagram Reels, YouTube Shorts y X (Twitter)."
                : "Friction against TikTok, Instagram Reels, YouTube Shorts, and X (Twitter)."}
            </Text>
          </View>
          <Switch
            value={doomscrollEnabled}
            onValueChange={(val) => {
              if (!val) {
                requestDisableAction("scroll_off");
              } else {
                void Haptics.selectionAsync();
                setDoomscrollEnabled(true);
                void updateProgress((c) => ({ ...c, blockedDoomscrollEnabled: true }));
              }
            }}
            trackColor={{ false: colors.border, true: colors.auroraBlue }}
            thumbColor="#ffffff"
          />
        </View>
      </Card>

      {/* Case 3: Junk Food Cravings */}
      <Card style={styles.settingCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingText}>
            <View style={styles.settingBadgeRow}>
              <Utensils color={colors.caution} size={16} />
              <Text style={styles.settingName}>
                {locale === "es" ? "Cravings de Comida Chatarra" : "Junk Food Cravings"}
              </Text>
            </View>
            <Text style={styles.settingDesc}>
              {locale === "es"
                ? "Fricción deliberada frente a apps y portales de delivery nocturno (Uber Eats, Rappi, etc.)."
                : "Deliberate friction against late-night delivery apps (Uber Eats, Rappi, McDonald's)."}
            </Text>
          </View>
          <Switch
            value={cravingsEnabled}
            onValueChange={(val) => {
              if (!val) {
                requestDisableAction("food_off");
              } else {
                void Haptics.selectionAsync();
                setCravingsEnabled(true);
                void updateProgress((c) => ({ ...c, blockedCravingsEnabled: true }));
              }
            }}
            trackColor={{ false: colors.border, true: colors.caution }}
            thumbColor="#ffffff"
          />
        </View>
      </Card>

      {/* Case 4: Custom Blocklist (Websites & Apps) */}
      <Card style={styles.settingCard}>
        <View style={styles.customHeaderRow}>
          <View style={styles.settingBadgeRow}>
            <Globe color={colors.auroraBlue} size={16} />
            <Text style={styles.settingName}>
              {locale === "es" ? "Sitios y Apps Personalizadas" : "Custom Sites & Apps"}
            </Text>
          </View>
        </View>
        <Text style={styles.settingDesc}>
          {locale === "es"
            ? "Añade dominios o palabras clave específicas que deseas bloquear en tu dispositivo (ej: reddit.com, casino, bet365)."
            : "Add specific domains or keywords you want blocked on your device (e.g., reddit.com, casino, bet365)."}
        </Text>

        <View style={styles.customInputRow}>
          <TextInput
            style={styles.customTextInput}
            placeholder={locale === "es" ? "ej: casino.com o palabra clave" : "e.g., casino.com or keyword"}
            placeholderTextColor={colors.textMuted}
            value={newSiteInput}
            onChangeText={setNewSiteInput}
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={handleAddCustomSite}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={locale === "es" ? "Añadir sitio" : "Add site"}
            style={[styles.customAddBtn, !newSiteInput.trim() && styles.customAddBtnDisabled]}
            disabled={!newSiteInput.trim()}
            onPress={handleAddCustomSite}
          >
            <Text style={styles.customAddBtnText}>{locale === "es" ? "Añadir" : "Add"}</Text>
          </Pressable>
        </View>

        {customSites.length > 0 ? (
          <View style={styles.chipsWrap}>
            {customSites.map((site) => (
              <View key={site} style={styles.siteChip}>
                <Text style={styles.siteChipText}>{site}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Eliminar ${site}`}
                  hitSlop={8}
                  style={styles.siteChipRemove}
                  onPress={() => handleRemoveCustomSite(site)}
                >
                  <X color={colors.textMuted} size={14} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.customEmptyText}>
            {locale === "es"
              ? "No tienes sitios personalizados añadidos aún."
              : "No custom sites added yet."}
          </Text>
        )}
      </Card>

      {/* Section 2: Android System Permissions */}
      <Text style={styles.sectionHeading}>
        {locale === "es" ? "Permisos del Sistema Android" : "Android System Permissions"}
      </Text>

      <Card style={styles.permConfigCard}>
        <Text style={styles.permConfigTitle}>
          {locale === "es" ? "Gestión de Accesibilidad" : "Accessibility & System Permissions"}
        </Text>
        <Text style={styles.permConfigDesc}>
          {locale === "es"
            ? "El servicio de accesibilidad de Aurora App opera localmente en tu dispositivo en tiempo real para bloquear contenidos adictivos sin recopilar datos personales."
            : "Aurora App's accessibility service operates strictly on-device in real-time to block compulsive apps and sites without collecting personal data."}
        </Text>

        <View style={styles.permButtonsCol}>
          <Pressable
            accessibilityRole="button"
            style={[styles.btnShortcut, styles.btnShortcutPrimary]}
            onPress={handleOpenAccessibility}
          >
            <Text style={[styles.btnShortcutText, styles.btnShortcutPrimaryText]}>
              {locale === "es"
                ? "Abrir Ajustes de Accesibilidad"
                : "Open Accessibility Settings"}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            style={styles.btnShortcut}
            onPress={handleOpenAppDetails}
          >
            <Text style={styles.btnShortcutText}>
              {locale === "es"
                ? "Información de la Aplicación"
                : "App Information"}
            </Text>
          </Pressable>
        </View>
      </Card>

      {/* Section 3: Transparency, Social Model & Terms */}
      <Text style={styles.sectionHeading}>
        {locale === "es" ? "Transparencia y Términos" : "Transparency & Terms"}
      </Text>

      <Card style={styles.permConfigCard}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Shield color={colors.auroraBlue} size={18} />
          <Text style={styles.permConfigTitle}>
            {locale === "es" ? "Filosofía Social & Privacidad" : "Social Model & Privacy"}
          </Text>
        </View>
        <Text style={styles.permConfigDesc}>
          {locale === "es"
            ? "Herramientas esenciales 100% gratuitas para todos (filosofía de software libre/WinRAR). Tus búsquedas y hábitos nunca salen de este teléfono."
            : "Essential tools 100% free for everyone (voluntary support model). Your searches and private habits never leave this device."}
        </Text>
        <Pressable
          accessibilityRole="button"
          style={[styles.btnShortcut, { marginTop: 8 }]}
          onPress={() => router.push("/terms")}
        >
          <Text style={styles.btnShortcutText}>
            {locale === "es"
              ? "Ver Términos de Servicio y Privacidad"
              : "View Terms of Service & Privacy"}
          </Text>
        </Pressable>
      </Card>

      {/* MODAL: Deliberate Friction Commitment Transcription */}
      <Modal visible={showFrictionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.frictionSheet}>
            <View style={styles.frictionHeader}>
              <View style={styles.frictionHeaderLeft}>
                <Lock color={colors.auroraPink} size={22} />
                <Text style={styles.frictionTitle}>
                  {locale === "es" ? "Pausa Consciente" : "Conscious Pause"}
                </Text>
              </View>
              <Pressable onPress={() => setShowFrictionModal(false)}>
                <X color={colors.textMuted} size={22} />
              </Pressable>
            </View>

            <Text style={styles.frictionSub}>
              {locale === "es"
                ? "Para desactivar este límite, debes transcribir exactamente tu compromiso personal. Queremos devolverte la soberanía para que no actúes en piloto automático."
                : "To disable this boundary, you must transcribe your personal commitment exactly. This friction protects you from impulsive actions."}
            </Text>

            <Card style={styles.commitmentDisplayCard}>
              <Text style={styles.commitmentDisplayText}>"{commitment}"</Text>
            </Card>

            <TextInput
              style={styles.frictionInput}
              value={frictionInput}
              onChangeText={setFrictionInput}
              placeholder={locale === "es" ? "Transcribe aquí tu compromiso exacto..." : "Type your exact commitment here..."}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
            />

            <PrimaryButton
              disabled={frictionInput.trim().toLowerCase() !== commitment.trim().toLowerCase()}
              style={frictionInput.trim().toLowerCase() !== commitment.trim().toLowerCase() ? { opacity: 0.4 } : undefined}
              onPress={() => void handleConfirmFriction()}
            >
              {locale === "es" ? "Confirmar Pausa (Registrar Recaída)" : "Confirm Pause (Record Relapse)"}
            </PrimaryButton>

            <SecondaryButton onPress={() => setShowFrictionModal(false)}>
              {locale === "es" ? "Mantener Mi Protección Soberana" : "Keep My Protection Active"}
            </SecondaryButton>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  header: {
    gap: 4,
  },
  title: {
    ...typography.display,
    color: colors.text,
    fontSize: 26,
    lineHeight: 30,
  },
  statusCard: {
    padding: 16,
    borderWidth: 1,
  },
  statusActive: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.auroraBlue,
  },
  statusInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  statusSub: {
    color: colors.textMuted,
    fontSize: 12,
  },
  sectionHeading: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginTop: 8,
  },
  settingCard: {
    padding: 14,
    backgroundColor: colors.surfaceRaised,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    flex: 1,
    gap: 4,
  },
  settingBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  settingDesc: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  permConfigCard: {
    padding: 16,
    backgroundColor: colors.surfaceRaised,
    gap: 10,
  },
  permConfigTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  permConfigDesc: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  permButtonsCol: {
    gap: 8,
    marginTop: 4,
  },
  btnShortcut: {
    minHeight: 44,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  btnShortcutText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  btnShortcutPrimary: {
    backgroundColor: colors.auroraBlue,
    borderColor: colors.auroraBlue,
  },
  btnShortcutPrimaryText: {
    color: "#0C0C0E",
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  frictionSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  frictionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  frictionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  frictionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  frictionSub: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  commitmentDisplayCard: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.auroraPink,
    borderWidth: 1,
    padding: 12,
  },
  commitmentDisplayText: {
    color: colors.auroraPink,
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 18,
    fontWeight: "600",
  },
  frictionInput: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  customHeaderRow: {
    marginBottom: 4,
  },
  customInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  customTextInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    color: colors.text,
    fontSize: 13,
  },
  customAddBtn: {
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: colors.auroraBlue,
    borderRadius: radii.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  customAddBtnDisabled: {
    opacity: 0.4,
  },
  customAddBtnText: {
    color: "#0C0C0E",
    fontWeight: "800",
    fontSize: 13,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  siteChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.small,
    borderWidth: 1,
    borderColor: colors.border,
  },
  siteChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  siteChipRemove: {
    padding: 2,
  },
  customEmptyText: {
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 10,
  },
});
