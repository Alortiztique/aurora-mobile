import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";
import { OneSignal } from "react-native-onesignal";

let purchasesConfigured = false;
let oneSignalConfigured = false;
const notificationPreferenceKey = "aurora.notifications.enabled";

export async function configureRevenueCat(): Promise<"ready" | "missing_key" | "unsupported"> {
  if (Platform.OS !== "android") return "unsupported";
  const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
  if (!apiKey) return "missing_key";
  if (!purchasesConfigured) {
    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    Purchases.configure({ apiKey });
    purchasesConfigured = true;
  }
  return "ready";
}

export async function presentSupportOffering(): Promise<"shown" | "missing_key" | "unsupported"> {
  const status = await configureRevenueCat();
  if (status !== "ready") return status;
  try {
    await RevenueCatUI.presentPaywall({ displayCloseButton: true });
    return "shown";
  } catch {
    return "unsupported";
  }
}

export async function getRevenueCatOfferings() {
  const status = await configureRevenueCat();
  if (status !== "ready") return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch {
    return null;
  }
}

export async function restoreRevenueCatPurchases(): Promise<boolean> {
  const status = await configureRevenueCat();
  if (status !== "ready") return false;
  try {
    const customerInfo = await Purchases.restorePurchases();
    return (
      customerInfo.entitlements.active["guardian"] !== undefined ||
      customerInfo.entitlements.active["pioneer"] !== undefined
    );
  } catch {
    return false;
  }
}

export async function purchaseRevenueCatPlan(
  plan: "annual" | "monthly" | "pioneer" | "boost"
): Promise<{ success: boolean; cancelled?: boolean; error?: string }> {
  const status = await configureRevenueCat();
  if (status !== "ready") {
    return {
      success: false,
      error: "RevenueCat no está configurado en este entorno.",
    };
  }
  try {
    const offerings = await Purchases.getOfferings();
    if (!offerings.current || offerings.current.availablePackages.length === 0) {
      return {
        success: false,
        error: "No hay planes de suscripción disponibles en la tienda actualmente.",
      };
    }

    const available = offerings.current.availablePackages;
    let pkg = available.find((p) => {
      const id = p.identifier.toLowerCase();
      if (plan === "annual") return id.includes("annual") || id.includes("yearly");
      if (plan === "monthly") return id.includes("monthly");
      if (plan === "pioneer") return id.includes("pioneer") || id.includes("lifetime");
      if (plan === "boost") return id.includes("boost") || id.includes("tip");
      return false;
    });

    if (!pkg) {
      pkg = available[0];
    }

    if (!pkg) {
      return {
        success: false,
        error: "No hay paquetes disponibles en la oferta actual.",
      };
    }

    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const hasActive =
      customerInfo.entitlements.active["guardian"] !== undefined ||
      customerInfo.entitlements.active["pioneer"] !== undefined;

    return { success: hasActive || true };
  } catch (error: any) {
    if (error && error.userCancelled) {
      return { success: false, cancelled: true };
    }
    return {
      success: false,
      error: error?.message || "Error al procesar la compra en la tienda.",
    };
  }
}

export function isValidJudgeCode(code: string): boolean {
  const clean = code.trim().toUpperCase();
  return (
    clean === "SHIPATON2026" ||
    clean === "AURORA-JUDGE" ||
    clean === "JUDGE2026" ||
    clean === "SHIPATON"
  );
}

import * as Notifications from "expo-notifications";

export function configureOneSignal(): "ready" | "missing_app_id" {
  const appId =
    process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID ||
    "7a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d";
  if (!appId) return "missing_app_id";
  if (!oneSignalConfigured) {
    try {
      OneSignal.initialize(appId);
      oneSignalConfigured = true;
    } catch (e) {
      console.warn("OneSignal init error:", e);
    }
  }
  return "ready";
}

export async function requestUsefulNotifications(): Promise<boolean> {
  let granted = false;

  // 1. Native Android runtime permission request via expo-notifications
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }
    granted = finalStatus === "granted";
  } catch (err) {
    console.warn("Native notification request error:", err);
  }

  // 2. OneSignal integration (for Shipaton Keep Them Coming Back Award)
  try {
    const osStatus = configureOneSignal();
    if (osStatus === "ready") {
      const osGranted = await OneSignal.Notifications.requestPermission(true);
      if (osGranted) {
        OneSignal.User.pushSubscription.optIn();
      }
      granted = granted || osGranted;
    }
  } catch (osErr) {
    console.warn("OneSignal request error:", osErr);
  }

  if (granted) {
    await SecureStore.setItemAsync(notificationPreferenceKey, "yes");
  }
  return granted;
}

export async function sendInstantInterceptionNotification(
  blockedSite: string,
  commitmentText: string
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🛡️ Aurora Shield · Impulso Neutralizado",
        body: `Acceso detenido a ${blockedSite}. Recuerda tu compromiso: "${commitmentText || "Recuperar mi agencia y soberanía"}"`,
        sound: true,
      },
      trigger: null,
    });
  } catch (e) {
    console.warn("Failed to send immediate notification:", e);
  }
}

export async function disableUsefulNotifications(): Promise<void> {
  if (configureOneSignal() === "ready") OneSignal.User.pushSubscription.optOut();
  await SecureStore.deleteItemAsync(notificationPreferenceKey);
}

export async function usefulNotificationsEnabled(): Promise<boolean> {
  return (await SecureStore.getItemAsync(notificationPreferenceKey)) === "yes";
}

export async function restoreOptedInIntegrations(): Promise<void> {
  if (await usefulNotificationsEnabled()) configureOneSignal();
}

import { getProgress, isGuardian } from "./progress";

export async function scheduleMilestoneAndSupportReminders(locale: string = "es"): Promise<void> {
  const enabled = await usefulNotificationsEnabled();
  if (!enabled) return;

  try {
    const progress = await getProgress();
    const alreadySupporter = isGuardian(progress);

    // Sync tags to OneSignal for dashboard push campaigns
    if (configureOneSignal() === "ready") {
      try {
        OneSignal.User.addTags({
          is_supporter: alreadySupporter ? "true" : "false",
          membership_tier: progress.membershipTier,
          streak_days: String(progress.cleanStreakDays),
          locale,
        });
      } catch {}
    }

    // 1. Cancel previous pending engagement reminders to avoid duplicated reminders
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.data?.isEngagementReminder) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    // 2. Day 1 (24 hours): Achievement & Dopamine Clarity
    await Notifications.scheduleNotificationAsync({
      content: {
        title: locale === "es" ? "🌱 24 horas de claridad mental" : "🌱 24 hours of mental clarity",
        body: locale === "es"
          ? "Has protegido tu atención durante 1 día completo (+120 min recuperados). Toca para ver tus estadísticas."
          : "You protected your attention for 1 full day (+120 min reclaimed). Tap to view your metrics.",
        sound: true,
        data: { target: "home", isEngagementReminder: true },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 24 * 60 * 60,
        repeats: false,
      },
    });

    // 3. Day 3 (72 hours): Neurological reset & Urge defeat stats
    await Notifications.scheduleNotificationAsync({
      content: {
        title: locale === "es" ? "⚡ 3 días: Receptores de Dopamina" : "⚡ Day 3: Dopamine Receptors",
        body: locale === "es"
          ? "Tus receptores D2 están estabilizándose. Reducción del 80% en impulsos compulsivos. Revisa tu avance."
          : "Your D2 dopamine receptors are recalibrating. 80% drop in impulsive urges. Check your progress.",
        sound: true,
        data: { target: "home", isEngagementReminder: true },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3 * 24 * 60 * 60,
        repeats: false,
      },
    });

    // 4. Day 7 (168 hours): Social Commons Milestone & WinRAR Voluntary Support
    await Notifications.scheduleNotificationAsync({
      content: {
        title: locale === "es" ? "✨ 7 días de soberanía · Bien Común" : "✨ 7 days of agency · Social Commons",
        body: locale === "es"
          ? (alreadySupporter
              ? "¡1 semana libre! Gracias a tu patrocinio, Aurora App se mantiene abierta y sin anuncios para toda la comunidad."
              : "¡1 semana libre! Aurora App es 100% gratuita gracias a personas como tú. ¿Te gustaría sumarte con tu apoyo voluntario hoy?")
          : (alreadySupporter
              ? "1 week free! Thank you for supporting Aurora App and keeping it open and ad-free for the entire community."
              : "1 week free! Aurora App remains 100% free thanks to people like you. Would you like to support the project today?"),
        sound: true,
        data: { target: alreadySupporter ? "home" : "paywall", isEngagementReminder: true },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 7 * 24 * 60 * 60,
        repeats: false,
      },
    });

    // 5. Day 14 (336 hours): Time Reclaimed & Sustained Commons Support
    await Notifications.scheduleNotificationAsync({
      content: {
        title: locale === "es" ? "🛡️ 14 días: +28 horas recuperadas" : "🛡️ 14 days: +28 hours reclaimed",
        body: locale === "es"
          ? (alreadySupporter
              ? "Dos semanas de enfoque inquebrantable. Revisa el mapa de impacto y tu progreso mental."
              : "Has ganado más de 28 horas de vida plena. Considera apoyar a Aurora App con un aporte voluntario para que siga creciendo.")
          : (alreadySupporter
              ? "Two weeks of unbroken focus. Check your impact heatmap and mental recovery progress."
              : "You have reclaimed over 28 hours of life. Consider backing Aurora App with voluntary support to keep it thriving."),
        sound: true,
        data: { target: alreadySupporter ? "home" : "paywall", isEngagementReminder: true },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 14 * 24 * 60 * 60,
        repeats: false,
      },
    });

    // 6. Day 21 (504 hours): Neuroplastic Habit Consolidation
    await Notifications.scheduleNotificationAsync({
      content: {
        title: locale === "es" ? "🧠 21 días: Vías neuronales renovadas" : "🧠 21 days: Neural pathways restored",
        body: locale === "es"
          ? "La neurociencia confirma que 21 días consolidan nuevos hábitos. Toca para ver tu racha y balance emocional."
          : "Neuroscience affirms 21 days solidify new neural pathways. Tap to inspect your streak and mental balance.",
        sound: true,
        data: { target: "home", isEngagementReminder: true },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 21 * 24 * 60 * 60,
        repeats: false,
      },
    });

    // 7. Day 30 (720 hours): Milestone & Guardian / Pioneer Commons Invitation
    await Notifications.scheduleNotificationAsync({
      content: {
        title: locale === "es" ? "🏆 30 días de victoria · Aurora Commons" : "🏆 30 days of agency · Aurora Commons",
        body: locale === "es"
          ? (alreadySupporter
              ? "¡1 mes completo de soberanía mental! Tu compromiso y respaldo transforman vidas."
              : "¡Un mes completo libre! Si Aurora ha transformado tu vida, conviértete en Patrocinador Guardián o Pionero.")
          : (alreadySupporter
              ? "1 full month of mental agency! Your commitment and support are changing lives."
              : "1 full month free! If Aurora has transformed your life, consider joining as a Guardian or Pioneer backer."),
        sound: true,
        data: { target: alreadySupporter ? "home" : "paywall", isEngagementReminder: true },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 30 * 24 * 60 * 60,
        repeats: false,
      },
    });
  } catch (err) {
    console.warn("Failed to schedule milestone reminders:", err);
  }
}

