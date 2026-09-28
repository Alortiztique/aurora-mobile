import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  Crown,
  Flame,
  Hand,
  Lock,
  MapPin,
  MessageSquare,
  RotateCcw,
  Settings2,
  Shield,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Card, Eyebrow } from "./ui";
import { NeuralClaritySphere } from "./NeuralClaritySphere";
import { useLocale } from "../locale";
import {
  calculateReclaimedHours,
  calculateStreakDays,
  getWeeklyHistory,
  isGuardian,
  isPioneer,
  type Progress,
} from "../progress";
import { colors, radii, spacing, typography } from "../theme";

interface HomeTabProps {
  progress: Progress | null;
  pledgedToday: boolean;
  onOpenPledge: () => void;
  onOpenSOS: () => void;
  onNavigateTab: (tab: "home" | "map" | "community" | "shield") => void;
}

export function HomeTab({
  progress,
  pledgedToday,
  onOpenPledge,
  onOpenSOS,
  onNavigateTab,
}: HomeTabProps) {
  const { locale } = useLocale();

  const streakDays = progress ? calculateStreakDays(progress) : 0;
  const urgesDefeated = progress?.urgesDefeated ?? 0;
  const totalBlocks = Math.max(progress?.totalBlocksCount ?? 0, urgesDefeated);
  const hoursReclaimed = progress ? calculateReclaimedHours(progress) : 0;
  const guardianActive = isGuardian(progress);
  const pioneerActive = isPioneer(progress);
  const commitment = progress?.personalCommitment || "";
  const weeklyHistory = progress ? getWeeklyHistory(progress) : [0, 0, 0, 0, 0, 0, 0];

  const daysOfWeek = locale === "es" ? ["L", "M", "X", "J", "V", "S", "D"] : ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <View style={styles.container}>
      {/* Top Header with Official Logo */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Image
            source={require("../../assets/aurora-logo.png")}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View>
            <Eyebrow>AURORA APP</Eyebrow>
            <Text style={styles.tagline}>
              {locale === "es" ? "Soberanía Atencional" : "Human Agency"}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Membership"
            onPress={() => {
              void Haptics.selectionAsync();
              router.push("/paywall");
            }}
            style={[
              styles.memberPill,
              pioneerActive && styles.pioneerPill,
              guardianActive && !pioneerActive && styles.guardianPill,
            ]}
          >
            <Crown
              color={
                pioneerActive ? "#ffb703" : guardianActive ? colors.auroraBlue : colors.textMuted
              }
              size={13}
            />
            <Text
              style={[
                styles.memberPillText,
                pioneerActive && { color: "#ffb703" },
                guardianActive && !pioneerActive && { color: colors.auroraBlue },
              ]}
            >
              {pioneerActive ? "PIONEER" : guardianActive ? "GUARDIAN" : locale === "es" ? "APOYAR" : "SUPPORT"}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings"
            onPress={() => onNavigateTab("shield")}
            style={styles.iconButton}
          >
            <Settings2 color={colors.text} size={20} />
          </Pressable>
        </View>
      </View>

      {/* Sovereign Metrics Row - Immediate Top Visibility */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Shield color={colors.auroraBlue} size={13} />
            <Text style={styles.metricLabel}>{locale === "es" ? "Bloqueos" : "Blocks"}</Text>
          </View>
          <Text style={styles.metricValue}>{totalBlocks}</Text>
        </View>

        <View style={[styles.metricCard, styles.metricCardCenter]}>
          <View style={styles.metricHeader}>
            <Flame color={colors.auroraPink} size={13} />
            <Text style={[styles.metricLabel, { color: colors.auroraPink }]}>
              {locale === "es" ? "Racha" : "Streak"}
            </Text>
          </View>
          <Text style={styles.metricValue}>{streakDays}d</Text>
          <Text style={styles.metricSub}>{locale === "es" ? "Días limpios" : "Clean days"}</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Sparkles color={colors.positive} size={13} />
            <Text style={styles.metricLabel}>{locale === "es" ? "Recuperado" : "Reclaimed"}</Text>
          </View>
          <Text style={styles.metricValue}>{hoursReclaimed}h</Text>
        </View>
      </View>

      {/* Hero: Compact Neural Clarity Sphere */}
      <NeuralClaritySphere
        streakDays={streakDays}
        isPioneer={pioneerActive}
        isGuardian={guardianActive}
        locale={locale}
        onPress={() => onOpenSOS()}
      />

      {/* Personal Commitment Locked Card */}
      {commitment ? (
        <Card style={styles.commitmentCard}>
          <View style={styles.commitmentHeader}>
            <Lock color={colors.auroraPink} size={13} />
            <Text style={styles.commitmentTag}>
              {locale === "es" ? "TU COMPROMISO VITAL" : "YOUR CORE COMMITMENT"}
            </Text>
          </View>
          <Text style={styles.commitmentBody}>"{commitment}"</Text>
        </Card>
      ) : null}

      {/* Solid Tactile Urgent SOS Button - Immediate First View Access */}
      <Pressable
        style={styles.sosButton}
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          onOpenSOS();
        }}
      >
        <ShieldAlert color="#ffffff" size={22} />
        <View style={styles.sosTextCol}>
          <Text style={styles.sosTitle}>
            {locale === "es" ? "Vencer Impulso Ahora (SOS)" : "Overcome Urge Now (SOS)"}
          </Text>
          <Text style={styles.sosDesc}>
            {locale === "es"
              ? "Toca aquí si sientes craving o impulso involuntario"
              : "Tap here if feeling the urge to relapse"}
          </Text>
        </View>
      </Pressable>

      {/* Quick Action Hub */}
      <View style={styles.actionsGrid}>
        <Pressable
          style={styles.actionItem}
          onPress={() => {
            void Haptics.selectionAsync();
            onNavigateTab("map");
          }}
        >
          <View style={[styles.actionIconShell, styles.actionMap]}>
            <MapPin color={colors.auroraBlue} size={20} />
          </View>
          <Text style={[styles.actionLabel, { color: colors.auroraBlue }]}>
            {locale === "es" ? "Mapa Vivo" : "Live Map"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.actionItem}
          onPress={() => {
            void Haptics.selectionAsync();
            onNavigateTab("community");
          }}
        >
          <View style={styles.actionIconShell}>
            <Users color={colors.auroraPink} size={20} />
          </View>
          <Text style={[styles.actionLabel, { color: colors.auroraPink }]}>
            {locale === "es" ? "Comunidad" : "Community"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.actionItem}
          onPress={() => {
            void Haptics.selectionAsync();
            onNavigateTab("shield");
          }}
        >
          <View style={styles.actionIconShell}>
            <Shield color={colors.text} size={20} />
          </View>
          <Text style={styles.actionLabel}>
            {locale === "es" ? "Escudo" : "Shield"}
          </Text>
        </Pressable>
      </View>

      {/* Weekly Sovereignty Evolution Chart */}
      <Card style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Sparkles color={colors.auroraBlue} size={14} />
          <Text style={styles.chartTitle}>
            {locale === "es" ? "Evolución Semanal de Soberanía" : "Weekly Agency Evolution"}
          </Text>
        </View>
        <View style={styles.chartBarsRow}>
          {daysOfWeek.map((day, idx) => {
            const isCompleted = weeklyHistory[idx] === 1;
            return (
              <View key={idx} style={styles.chartBarCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      isCompleted ? styles.barFillActive : styles.barFillInactive,
                      { height: isCompleted ? "85%" : "20%" },
                    ]}
                  />
                </View>
                <Text style={[styles.chartDayText, isCompleted && styles.chartDayTextActive]}>
                  {day}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  memberPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pioneerPill: {
    borderColor: "rgba(255, 183, 3, 0.4)",
    backgroundColor: "rgba(255, 183, 3, 0.1)",
  },
  guardianPill: {
    borderColor: "rgba(117, 132, 193, 0.4)",
    backgroundColor: "rgba(117, 132, 193, 0.1)",
  },
  memberPillText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radii.small,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  commitmentCard: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.auroraBlue,
    borderWidth: 1,
    padding: 10,
    gap: 3,
  },
  commitmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  commitmentTag: {
    color: colors.auroraPink,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  commitmentBody: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: "italic",
    fontWeight: "600",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: "center",
    gap: 2,
    minHeight: 60,
  },
  metricCardCenter: {
    borderColor: "rgba(245, 174, 219, 0.35)",
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
  },
  metricValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  metricSub: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "600",
  },
  chartCard: {
    padding: 10,
    backgroundColor: colors.surfaceRaised,
    gap: 8,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chartTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  chartBarsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 60,
    paddingTop: 4,
    paddingHorizontal: 6,
  },
  chartBarCol: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  barTrack: {
    width: 12,
    height: 40,
    backgroundColor: colors.surface,
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 6,
  },
  barFillActive: {
    backgroundColor: colors.auroraBlue,
  },
  barFillInactive: {
    backgroundColor: colors.border,
  },
  chartDayText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
  },
  chartDayTextActive: {
    color: colors.auroraBlue,
    fontWeight: "900",
  },
  sosButton: {
    minHeight: 52,
    backgroundColor: colors.danger,
    borderRadius: radii.medium,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sosTextCol: {
    flex: 1,
    gap: 1,
  },
  sosTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  sosDesc: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 10,
    fontWeight: "600",
  },
  actionsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  actionItem: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    alignItems: "center",
    gap: 4,
  },
  actionIconShell: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionMap: {
    borderColor: "rgba(117, 132, 193, 0.4)",
  },
  actionLabel: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "800",
  },
});
