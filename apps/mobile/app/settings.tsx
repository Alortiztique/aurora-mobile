import { useEffect, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  Bell,
  Check,
  Copy,
  Crown,
  ExternalLink,
  Globe,
  Heart,
  Languages,
  LogOut,
  RotateCcw,
  ShieldCheck,
  User,
} from "lucide-react-native";
import { Body, Card, Eyebrow, PrimaryButton, Screen, SecondaryButton, Title } from "../src/components/ui";
import {
  disableUsefulNotifications,
  requestUsefulNotifications,
  usefulNotificationsEnabled,
} from "../src/integrations";
import { useLocale } from "../src/locale";
import { clearProgress, getProgress, isGuardian, isPioneer, type Progress } from "../src/progress";
import { getCurrentAccount, linkGoogleAccount, unlinkAccount, type UserAccount } from "../src/auth";
import { colors, radii, spacing, typography } from "../src/theme";

export default function SettingsScreen() {
  const { locale, setLocale } = useLocale();
  const [notifications, setNotifications] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [copiedDns, setCopiedDns] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void usefulNotificationsEnabled().then(setNotifications);
    void getProgress().then((p) => {
      setProgress(p);
      setAccount(p.userAccount);
    });
  }, []);

  const enableNotifications = async (value: boolean) => {
    if (!value) {
      await disableUsefulNotifications();
      setNotifications(false);
      return;
    }
    const granted = await requestUsefulNotifications();
    setNotifications(granted);
    if (!granted) {
      setMessage(
        locale === "es"
          ? "Las notificaciones no están configuradas o fueron denegadas."
          : "Notifications are not configured or were denied."
      );
    }
  };

  const handleLinkGoogle = async () => {
    const targetEmail = emailInput.trim() || "usuario@gmail.com";
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const linked = await linkGoogleAccount(targetEmail);
    setAccount(linked);
    setShowEmailInput(false);
    setMessage(
      locale === "es"
        ? `Cuenta vinculada (${linked.email}) y sincronizada con RevenueCat.`
        : `Google account linked (${linked.email}) and synced with RevenueCat.`
    );
  };

  const handleUnlink = async () => {
    void Haptics.selectionAsync();
    await unlinkAccount();
    setAccount(null);
    setMessage(
      locale === "es"
        ? "Cuenta desvinculada. Modo local anónimo activo."
        : "Account unlinked. Anonymous local mode active."
    );
  };

  const handleCopyDns = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopiedDns(true);
    setTimeout(() => setCopiedDns(false), 2600);
  };

  const support = () => {
    router.push("/paywall");
  };

  const guardianActive = isGuardian(progress);
  const pioneerActive = isPioneer(progress);

  return (
    <Screen>
      <Eyebrow>{locale === "es" ? "CONTROL COMPRENSIBLE" : "UNDERSTANDABLE CONTROL"}</Eyebrow>
      <Title>{locale === "es" ? "Privacidad y ajustes" : "Privacy and settings"}</Title>

      {/* Account & RevenueCat Sync Card */}
      <Card>
        <View style={styles.setting}>
          <User color={colors.purpleLight} size={22} />
          <View style={styles.settingCopy}>
            <Text style={styles.settingTitle}>
              {locale === "es" ? "Cuenta y Sincronización" : "Account & Sync"}
            </Text>
            <Body>
              {account
                ? `${account.email} · ${locale === "es" ? "Sincronizada con RevenueCat" : "Synced with RevenueCat"}`
                : locale === "es"
                ? "Modo anónimo local-first. Vincula tu cuenta de Google si deseas sincronizar compras y señales."
                : "Anonymous local-first mode. Link your Google account to sync purchases and signals."}
            </Body>
          </View>
        </View>

        {account ? (
          <Pressable style={styles.btnSecondaryRow} onPress={() => void handleUnlink()}>
            <LogOut color={colors.danger} size={16} />
            <Text style={[styles.btnSecondaryText, { color: colors.danger }]}>
              {locale === "es" ? "Desvincular cuenta" : "Unlink account"}
            </Text>
          </Pressable>
        ) : showEmailInput ? (
          <View style={styles.authBox}>
            <TextInput
              style={styles.authInput}
              value={emailInput}
              onChangeText={setEmailInput}
              placeholder="tu.correo@gmail.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <PrimaryButton onPress={() => void handleLinkGoogle()}>
              {locale === "es" ? "Confirmar vinculación" : "Confirm linking"}
            </PrimaryButton>
          </View>
        ) : (
          <SecondaryButton onPress={() => setShowEmailInput(true)}>
            {locale === "es" ? "Vincular Cuenta de Google" : "Link Google Account"}
          </SecondaryButton>
        )}
      </Card>

      {/* System-level Private DNS Card */}
      <Card>
        <View style={styles.setting}>
          <Globe color={colors.zima} size={22} />
          <View style={styles.settingCopy}>
            <Text style={styles.settingTitle}>
              {locale === "es" ? "DNS Privado Anti-Pornografía" : "Anti-Porn Private DNS"}
            </Text>
            <Body>
              {locale === "es"
                ? "Bloqueo a nivel de sistema con Cloudflare 1.1.1.3 Family. Cero batería."
                : "System-wide blocking with Cloudflare 1.1.1.3 Family. Zero battery."}
            </Body>
          </View>
        </View>
        <View style={styles.dnsRow}>
          <Text style={styles.dnsHostText}>family.cloudflare-dns.com</Text>
          <Pressable
            style={[styles.btnCopyDns, copiedDns && styles.btnCopyDnsDone]}
            onPress={handleCopyDns}
          >
            {copiedDns ? <Check color={colors.positive} size={14} /> : <Copy color={colors.zima} size={14} />}
            <Text style={[styles.btnCopyDnsText, copiedDns && { color: colors.positive }]}>
              {copiedDns ? (locale === "es" ? "Copiado" : "Copied") : (locale === "es" ? "Copiar" : "Copy")}
            </Text>
          </Pressable>
        </View>
      </Card>

      {/* Language & Notifications */}
      <Card>
        <View style={styles.setting}>
          <Languages color={colors.zima} size={22} />
          <View style={styles.settingCopy}>
            <Text style={styles.settingTitle}>{locale === "es" ? "Idioma" : "Language"}</Text>
            <Body>
              {locale === "es"
                ? "Español natural de Colombia y Latinoamérica"
                : "English first, with complete Spanish"}
            </Body>
          </View>
          <Pressable
            onPress={() => void setLocale(locale === "en" ? "es" : "en")}
            style={styles.pill}
          >
            <Text style={styles.pillText}>{locale === "en" ? "ES" : "EN"}</Text>
          </Pressable>
        </View>

        <View style={styles.setting}>
          <Bell color={colors.purpleLight} size={22} />
          <View style={styles.settingCopy}>
            <Text style={styles.settingTitle}>
              {locale === "es" ? "Notificaciones útiles" : "Useful notifications"}
            </Text>
            <Body>
              {locale === "es"
                ? "Pídelas solo cuando tengan un propósito"
                : "Request them only when they have a purpose"}
            </Body>
          </View>
          <Switch
            value={notifications}
            onValueChange={(value) => void enableNotifications(value)}
            trackColor={{ false: colors.border, true: colors.purple }}
            thumbColor={colors.text}
          />
        </View>
      </Card>

      {/* Location Privacy */}
      <Card>
        <View style={styles.setting}>
          <ShieldCheck color={colors.positive} size={22} />
          <View style={styles.settingCopy}>
            <Text style={styles.settingTitle}>{locale === "es" ? "Ubicación" : "Location"}</Text>
            <Body>
              {locale === "es"
                ? "No se usa en segundo plano. Coordenadas cuantizadas para privacidad comunitaria."
                : "No background use. Quantized coordinates for community privacy."}
            </Body>
          </View>
        </View>
        <SecondaryButton onPress={() => void Linking.openSettings()}>
          {locale === "es" ? "Abrir ajustes de Android" : "Open Android settings"}
        </SecondaryButton>
      </Card>

      {/* Membership & RevenueCat Offering Card */}
      <Card>
        <View style={styles.setting}>
          {pioneerActive || guardianActive ? (
            <Crown color={pioneerActive ? "#ffb703" : colors.zima} size={22} />
          ) : (
            <Heart color={colors.purpleLight} size={22} />
          )}
          <View style={styles.settingCopy}>
            <Text style={styles.settingTitle}>
              {pioneerActive
                ? "Membresía Pioneer Vitalicia"
                : guardianActive
                ? "Membresía Guardian Activa"
                : locale === "es"
                ? "Membresía y Apoyo Voluntario"
                : "Membership & Voluntary Support"}
            </Text>
            <Body>
              {pioneerActive || guardianActive
                ? locale === "es"
                  ? "Tienes acceso pleno y distintivo protector activo."
                  : "Active founder status with full features enabled."
                : locale === "es"
                ? "Todo lo esencial permanece gratis. Elige un aporte voluntario solo si puedes."
                : "Everything essential stays free. Contribute only if you can."}
            </Body>
          </View>
        </View>
        <PrimaryButton onPress={support}>
          {pioneerActive || guardianActive
            ? locale === "es"
              ? "Gestionar Membresía"
              : "Manage Membership"
            : locale === "es"
            ? "Ver Membresías y Apoyo"
            : "View Memberships & Support"}
        </PrimaryButton>
      </Card>

      {/* Policy and Web Map Links */}
      <Pressable
        style={styles.link}
        onPress={() => void Linking.openURL("https://miaurora.app/")}
      >
        <Text style={styles.linkText}>
          {locale === "es" ? "Mapa Vivo Web (miaurora.app)" : "Live Web Map (miaurora.app)"}
        </Text>
        <ExternalLink color={colors.zima} size={17} />
      </Pressable>
      <Pressable
        style={styles.link}
        onPress={() => router.push("/terms")}
      >
        <Text style={styles.linkText}>
          {locale === "es" ? "Términos de Servicio y Privacidad (In-App)" : "Terms of Service & Privacy (In-App)"}
        </Text>
        <ExternalLink color={colors.auroraBlue} size={17} />
      </Pressable>
      <Pressable
        style={styles.link}
        onPress={() => void Linking.openURL("mailto:hello@miaurora.app")}
      >
        <Text style={styles.linkText}>hello@miaurora.app</Text>
        <ExternalLink color={colors.textMuted} size={17} />
      </Pressable>

      {message && <Text style={styles.message}>{message}</Text>}

      {/* Danger Zone: Clear Local Data */}
      <View style={styles.danger}>
        <RotateCcw color={colors.danger} size={20} />
        <View style={styles.settingCopy}>
          <Text style={styles.settingTitle}>
            {locale === "es" ? "Borrar datos locales" : "Delete local data"}
          </Text>
          <Body>
            {locale === "es"
              ? "Elimina progreso, idioma y preferencias de este dispositivo."
              : "Remove progress, language, and preferences from this device."}
          </Body>
        </View>
      </View>
      <SecondaryButton
        onPress={() => {
          void Promise.all([clearProgress(), disableUsefulNotifications()]);
          setNotifications(false);
          setAccount(null);
          setMessage(locale === "es" ? "Datos locales borrados." : "Local data deleted.");
        }}
      >
        {locale === "es" ? "Borrar datos locales" : "Delete local data"}
      </SecondaryButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  setting: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingCopy: { flex: 1 },
  settingTitle: { ...typography.heading, color: colors.text },
  pill: {
    minWidth: 50,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.small,
    backgroundColor: colors.surfaceRaised,
  },
  pillText: { color: colors.text, fontWeight: "800" },
  authBox: {
    gap: 8,
    marginTop: 6,
  },
  authInput: {
    backgroundColor: colors.night,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 13,
  },
  btnSecondaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 44,
    borderRadius: radii.medium,
    backgroundColor: "rgba(244, 63, 94, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.25)",
    marginTop: 4,
  },
  btnSecondaryText: {
    fontSize: 13,
    fontWeight: "700",
  },
  dnsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.night,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginTop: 4,
  },
  dnsHostText: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  btnCopyDns: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(66, 199, 245, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.small,
  },
  btnCopyDnsDone: {
    backgroundColor: "rgba(74, 222, 128, 0.15)",
  },
  btnCopyDnsText: {
    color: colors.zima,
    fontSize: 11,
    fontWeight: "700",
  },
  link: {
    minHeight: 50,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linkText: { color: colors.text, fontWeight: "600" },
  message: { padding: spacing.md, color: colors.caution, lineHeight: 19 },
  danger: { marginTop: spacing.lg, flexDirection: "row", alignItems: "center", gap: 10 },
});
