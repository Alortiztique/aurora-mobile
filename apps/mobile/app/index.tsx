import { useCallback, useEffect, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import {
  Brain,
  Check,
  Compass,
  Flame,
  Hand,
  Lock,
  MapPin,
  Shield,
  ShieldAlert,
  Users,
  Wind,
  X,
} from "lucide-react-native";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommunityTab } from "../src/components/CommunityTab";
import { HomeTab } from "../src/components/HomeTab";
import { MapTab } from "../src/components/MapTab";
import { ShieldTab } from "../src/components/ShieldTab";
import * as Notifications from "expo-notifications";
import { OneSignal } from "react-native-onesignal";
import { useLocale } from "../src/locale";
import { getProgress, recordUrgeDefeated, updateProgress, type Progress } from "../src/progress";
import { configureOneSignal, scheduleMilestoneAndSupportReminders } from "../src/integrations";
import { colors, radii, spacing } from "../src/theme";

type TabKey = "home" | "map" | "community" | "shield";

export default function MainAppScreen() {
  const insets = useSafeAreaInsets();
  const { locale } = useLocale();
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [progress, setProgress] = useState<Progress | null>(null);
  const [showPledgeModal, setShowPledgeModal] = useState(false);
  const [showUrgeModal, setShowUrgeModal] = useState(false);
  const [pledgedToday, setPledgedToday] = useState(false);

  useEffect(() => {
    // Schedule or refresh milestone notifications (24h, 3d, 7d voluntary support)
    void scheduleMilestoneAndSupportReminders(locale);

    const handleUrl = (url: string | null) => {
      if (!url) return;
      if (url.includes("shield-sos") || url.includes("intercept_sos")) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setActiveTab("shield");
        setShowUrgeModal(true);
      } else if (url.includes("paywall") || url.includes("support")) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push("/paywall");
      }
    };

    void Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener("url", (event) => handleUrl(event.url));

    // Handle local notification clicks (Expo Notifications)
    const notifSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { target?: string } | undefined;
      if (data?.target === "paywall") {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push("/paywall");
      } else if (data?.target === "home") {
        void Haptics.selectionAsync();
        setActiveTab("home");
      }
    });

    // Handle remote OneSignal campaign notification clicks
    let osSubClean = () => {};
    try {
      if (configureOneSignal() === "ready") {
        const clickListener = (event: any) => {
          const data = event.notification.additionalData as { target?: string } | undefined;
          if (data?.target === "paywall" || data?.target === "support") {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.push("/paywall");
          } else if (data?.target === "home") {
            void Haptics.selectionAsync();
            setActiveTab("home");
          }
        };
        OneSignal.Notifications.addEventListener("click", clickListener);
        osSubClean = () => {
          try {
            OneSignal.Notifications.removeEventListener("click", clickListener);
          } catch {}
        };
      }
    } catch {}

    return () => {
      subscription.remove();
      notifSub.remove();
      osSubClean();
    };
  }, [locale]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void getProgress().then((value) => {
        if (!active) return;
        if (!value.onboarded) {
          router.replace("/onboarding");
        } else {
          setProgress(value);
          const today = new Date().toISOString().slice(0, 10);
          setPledgedToday(value.lastPledgeDate === today);
          void scheduleMilestoneAndSupportReminders(locale);
        }
      });
      return () => {
        active = false;
      };
    }, [locale])
  );

  const handleMakePledge = async () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const today = new Date().toISOString().slice(0, 10);
    const next = await updateProgress((curr) => ({
      ...curr,
      pledgesCount: (curr.pledgesCount || 0) + 1,
      lastPledgeDate: today,
    }));
    setProgress(next);
    setPledgedToday(true);
    setShowPledgeModal(false);
  };

  const handleDefeatUrge = async () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const next = await recordUrgeDefeated();
    setProgress(next);
    setShowUrgeModal(false);
  };

  const handleToggleShield = async (enabled: boolean) => {
    const next = await updateProgress((curr) => ({
      ...curr,
      shieldEnabled: enabled,
    }));
    setProgress(next);
  };

  const handleToggleLockdown = async (enabled: boolean) => {
    const next = await updateProgress((curr) => ({
      ...curr,
      lockdownMode: enabled,
    }));
    setProgress(next);
  };

  if (!progress || !progress.onboarded) {
    return <View style={{ flex: 1, backgroundColor: colors.ink }} />;
  }

  return (
    <View style={styles.root}>
      {activeTab === "map" ? (
        <View style={styles.mapTabRoot}>
          <MapTab />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === "home" && (
            <HomeTab
              progress={progress}
              pledgedToday={pledgedToday}
              onOpenPledge={() => setShowPledgeModal(true)}
              onOpenSOS={() => setShowUrgeModal(true)}
              onNavigateTab={(tab) => {
                void Haptics.selectionAsync();
                setActiveTab(tab);
              }}
            />
          )}

          {activeTab === "community" && <CommunityTab />}

          {activeTab === "shield" && (
            <ShieldTab
              progress={progress}
              onToggleShield={(enabled) => void handleToggleShield(enabled)}
              onToggleLockdown={(enabled) => void handleToggleLockdown(enabled)}
              onOpenSOS={() => setShowUrgeModal(true)}
              onNavigateTab={(tab) => {
                void Haptics.selectionAsync();
                setActiveTab(tab);
              }}
            />
          )}
        </ScrollView>
      )}

      {/* 4-Tab Native Navigation Bar (Aurora Dark Paper Brutalism) */}
      <View style={[styles.navBar, { height: 62 + (insets.bottom || 8), paddingBottom: insets.bottom || 8 }]}>
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Soberanía"
          style={styles.navItem}
          onPress={() => {
            void Haptics.selectionAsync();
            setActiveTab("home");
          }}
        >
          <Flame
            color={activeTab === "home" ? colors.auroraPink : colors.textMuted}
            size={22}
          />
          <Text
            style={[
              styles.navText,
              activeTab === "home" && { color: colors.auroraPink, fontWeight: "800" },
            ]}
          >
            {locale === "es" ? "Soberanía" : "Home"}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Mapa Vivo"
          style={styles.navItem}
          onPress={() => {
            void Haptics.selectionAsync();
            setActiveTab("map");
          }}
        >
          <MapPin
            color={activeTab === "map" ? colors.auroraBlue : colors.textMuted}
            size={22}
          />
          <Text
            style={[
              styles.navText,
              activeTab === "map" && { color: colors.auroraBlue, fontWeight: "800" },
            ]}
          >
            {locale === "es" ? "Mapa Vivo" : "Map"}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Comunidad"
          style={styles.navItem}
          onPress={() => {
            void Haptics.selectionAsync();
            setActiveTab("community");
          }}
        >
          <Users
            color={activeTab === "community" ? colors.auroraBlue : colors.textMuted}
            size={22}
          />
          <Text
            style={[
              styles.navText,
              activeTab === "community" && { color: colors.auroraBlue, fontWeight: "800" },
            ]}
          >
            {locale === "es" ? "Comunidad" : "Community"}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Escudo"
          style={styles.navItem}
          onPress={() => {
            void Haptics.selectionAsync();
            setActiveTab("shield");
          }}
        >
          <Shield
            color={activeTab === "shield" ? colors.auroraPink : colors.textMuted}
            size={22}
          />
          <Text
            style={[
              styles.navText,
              activeTab === "shield" && { color: colors.auroraPink, fontWeight: "800" },
            ]}
          >
            {locale === "es" ? "Escudo" : "Shield"}
          </Text>
        </Pressable>
      </View>

      {/* MODAL: Daily Pledge */}
      <Modal visible={showPledgeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalTopLine}>
              <Text style={styles.modalTitle}>
                {locale === "es" ? "Compromiso Diario" : "Daily Pledge"}
              </Text>
              <Pressable onPress={() => setShowPledgeModal(false)}>
                <X color={colors.textMuted} size={22} />
              </Pressable>
            </View>

            <Text style={styles.pledgeQuote}>
              {locale === "es"
                ? "“Hoy elijo mi presencia y mi paz mental. Reconozco que la dopamina fácil de la pornografía y el scroll destruyen mi motivación real. Hoy decido tener el control.”"
                : "“Today I choose presence and peace of mind. I will not trade my motivation for artificial stimulation. Today I am in control.”"}
            </Text>

            <Pressable
              style={styles.pledgeConfirmButton}
              onPress={() => void handleMakePledge()}
            >
              <Check color="#ffffff" size={20} />
              <Text style={styles.pledgeConfirmText}>
                {locale === "es" ? "Hacer mi promesa para hoy" : "Confirm my pledge for today"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODAL: Mindful Pause & Observation Mission (SOS) */}
      <Modal visible={showUrgeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalTopLine}>
              <View style={styles.urgeBadge}>
                <ShieldAlert color={colors.purpleLight} size={18} />
                <Text style={styles.urgeBadgeText}>
                  {locale === "es" ? "PAUSA MINDFUL · SOS" : "MINDFUL PAUSE · SOS"}
                </Text>
              </View>
              <Pressable onPress={() => setShowUrgeModal(false)}>
                <X color={colors.textMuted} size={22} />
              </Pressable>
            </View>

            <Text style={styles.urgeAdvice}>
              {locale === "es"
                ? "La urgencia química dura solo 3 a 5 minutos. Desconéctate de la pantalla y vuelve al mundo real."
                : "A craving spike lasts only 3 to 5 minutes. Step away from the screen and reconnect with reality."}
            </Text>

            {/* Personal Commitment Card */}
            <View style={styles.commitmentReminderCard}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <Lock color={colors.auroraPink} size={14} />
                <Text style={styles.commitmentReminderLabel}>
                  {locale === "es" ? "TU COMPROMISO PERSONAL" : "YOUR CORE COMMITMENT"}
                </Text>
              </View>
              <Text style={styles.commitmentReminderText}>
                "{progress?.personalCommitment || (locale === "es" ? "Merezco paz mental y respeto en mi vida diaria" : "I deserve mental peace and respect in my daily life")}"
              </Text>
            </View>

            {/* Mindfulness Observation Mission Card */}
            <View style={styles.missionCard}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Compass color={colors.auroraBlue} size={18} />
                <Text style={styles.missionTitle}>
                  {locale === "es" ? "Misión: Reconexión y Atención Plena" : "Mission: Mindfulness & Grounding"}
                </Text>
              </View>
              <Text style={styles.missionDesc}>
                {locale === "es"
                  ? "Asómate a una ventana, sal al balcón o camina 3 minutos. Conéctate con la realidad física y abre el mapa vivo de Aurora para descubrir refugios de paz o marcar una señal consciente para la comunidad."
                  : "Look out a window, step onto a balcony, or take a 3-minute walk. Connect with physical reality and open Aurora's live map to discover quiet havens or mark a mindful signal."}
              </Text>
            </View>

            {/* Primary Action Button: Open Aurora Map & Mark Signal */}
            <Pressable
              style={styles.openMapMissionButton}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowUrgeModal(false);
                setActiveTab("map");
              }}
            >
              <MapPin color="#08070C" size={20} />
              <Text style={styles.openMapMissionText}>
                {locale === "es" ? "Explorar y Marcar Señal en el Mapa" : "Explore & Mark Signal on Map"}
              </Text>
            </Pressable>

            {/* Button: Urge Defeated */}
            <Pressable style={styles.defeatButton} onPress={() => void handleDefeatUrge()}>
              <Check color="#ffffff" size={20} />
              <Text style={styles.defeatButtonText}>
                {locale === "es" ? "✓ Vencí el impulso (+1 Victoria)" : "✓ Overcame the urge (+1 Victory)"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: 54,
    paddingBottom: 110,
    maxWidth: 680,
    width: "100%",
    alignSelf: "center",
  },
  mapTabRoot: {
    flex: 1,
  },

  /* 5-Tab Navigation Bar */
  navBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    zIndex: 100,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 6,
  },
  navText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
  },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  modalTopLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  pledgeQuote: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 23,
    fontStyle: "italic",
    padding: 12,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.medium,
    borderLeftWidth: 3,
    borderLeftColor: colors.zima,
  },
  pledgeConfirmButton: {
    minHeight: 52,
    backgroundColor: colors.purple,
    borderRadius: radii.medium,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  pledgeConfirmText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 15,
  },

  /* Urge Modal */
  urgeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(139, 92, 246, 0.16)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  urgeBadgeText: {
    color: colors.purpleLight,
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.8,
  },
  urgeAdvice: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  commitmentReminderCard: {
    padding: 12,
    borderRadius: radii.medium,
    backgroundColor: colors.surfaceRaised,
    borderLeftWidth: 3,
    borderLeftColor: colors.auroraPink,
    gap: 4,
  },
  commitmentReminderLabel: {
    color: colors.auroraPink,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  commitmentReminderText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    fontStyle: "italic",
  },

  missionCard: {
    padding: 12,
    borderRadius: radii.medium,
    backgroundColor: "rgba(66, 199, 245, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(66, 199, 245, 0.25)",
    gap: 4,
  },
  missionTitle: {
    color: colors.zima,
    fontSize: 13,
    fontWeight: "800",
  },
  missionDesc: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  openMapMissionButton: {
    minHeight: 50,
    borderRadius: radii.medium,
    backgroundColor: colors.zima,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  openMapMissionText: {
    color: "#08070C",
    fontSize: 14,
    fontWeight: "900",
  },
  defeatButton: {
    minHeight: 50,
    backgroundColor: colors.positive,
    borderRadius: radii.medium,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  defeatButtonText: {
    color: "#08070C",
    fontWeight: "900",
    fontSize: 14,
  },
});
