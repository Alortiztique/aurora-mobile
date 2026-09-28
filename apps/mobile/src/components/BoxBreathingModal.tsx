import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Check, Wind, X } from "lucide-react-native";
import { useLocale } from "../locale";
import { colors, radii, spacing } from "../theme";

interface BoxBreathingModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type BreathPhase = "inhale" | "hold1" | "exhale" | "hold2";

const PHASE_DURATION_SEC = 4;

export function BoxBreathingModal({ visible, onClose, onComplete }: BoxBreathingModalProps) {
  const { locale } = useLocale();
  const [phase, setPhase] = useState<BreathPhase>("inhale");
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(PHASE_DURATION_SEC);
  const [cycle, setCycle] = useState(1);
  const [totalCyclesCompleted, setTotalCyclesCompleted] = useState(0);

  const scaleAnim = useRef(new Animated.Value(0.75)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      setPhase("inhale");
      setPhaseSecondsLeft(PHASE_DURATION_SEC);
      setCycle(1);
      setTotalCyclesCompleted(0);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [visible]);

  // Phase change animations and tactile haptics
  useEffect(() => {
    if (!visible) return;

    // Trigger physical haptic pulse on phase change
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (phase === "inhale") {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: PHASE_DURATION_SEC * 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: PHASE_DURATION_SEC * 1000,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (phase === "hold1") {
      // Keep expanded
    } else if (phase === "exhale") {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.75,
          duration: PHASE_DURATION_SEC * 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.6,
          duration: PHASE_DURATION_SEC * 1000,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (phase === "hold2") {
      // Keep contracted
    }
  }, [phase, visible, scaleAnim, opacityAnim]);

  // 1-second interval timer
  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Advance phase
        setPhase((currentPhase) => {
          if (currentPhase === "inhale") return "hold1";
          if (currentPhase === "hold1") return "exhale";
          if (currentPhase === "exhale") return "hold2";

          // Completed full 16s cycle
          setTotalCyclesCompleted((c) => c + 1);
          setCycle((c) => c + 1);
          return "inhale";
        });

        return PHASE_DURATION_SEC;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  const getPhaseCopy = () => {
    switch (phase) {
      case "inhale":
        return {
          title: locale === "es" ? "INHALA" : "INHALE",
          guide:
            locale === "es"
              ? "Llena tus pulmones despacio en 4 segundos"
              : "Slowly fill your lungs over 4 seconds",
          color: colors.zima,
        };
      case "hold1":
        return {
          title: locale === "es" ? "SOSTÉN" : "HOLD",
          guide:
            locale === "es"
              ? "Mantén el aire con quietud física y mental"
              : "Hold your breath in still awareness",
          color: colors.violetSoft,
        };
      case "exhale":
        return {
          title: locale === "es" ? "EXHALA" : "EXHALE",
          guide:
            locale === "es"
              ? "Suelta todo el aire lentamente por la boca"
              : "Release all air slowly through the mouth",
          color: colors.positive,
        };
      case "hold2":
        return {
          title: locale === "es" ? "PAUSA EN VACÍO" : "EMPTY REST",
          guide:
            locale === "es"
              ? "Quédate en calma antes del nuevo ciclo"
              : "Rest in stillness before the next breath",
          color: colors.textMuted,
        };
    }
  };

  const currentCopy = getPhaseCopy();

  const handleFinish = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.badge}>
              <Wind color={colors.zima} size={16} />
              <Text style={styles.badgeText}>
                {locale === "es" ? "BOX BREATHING 4-4-4-4" : "TACTILE BOX BREATH"}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close breathing session"
            >
              <X color={colors.textMuted} size={20} />
            </Pressable>
          </View>

          {/* Cycle Info */}
          <View style={styles.cycleInfo}>
            <Text style={styles.cycleText}>
              {locale === "es"
                ? `Ciclo ${cycle} · ${totalCyclesCompleted} completados`
                : `Cycle ${cycle} · ${totalCyclesCompleted} completed`}
            </Text>
            <Text style={styles.hapticHint}>
              {locale === "es"
                ? "Siente el pulso vibratorio en tus manos para guiarte a ojos cerrados"
                : "Feel the tactile pulse in your hands to breathe with eyes closed"}
            </Text>
          </View>

          {/* Somatic Pacer Visualizer */}
          <View style={styles.pacerContainer}>
            {/* Outer Static Reference Box */}
            <View style={styles.referenceBox} />

            {/* Animated Breathing Geometric Box */}
            <Animated.View
              style={[
                styles.breathingBox,
                {
                  borderColor: currentCopy.color,
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              <Text style={[styles.secondsCounter, { color: currentCopy.color }]}>
                {phaseSecondsLeft}
              </Text>
              <Text style={[styles.phaseTitle, { color: currentCopy.color }]}>
                {currentCopy.title}
              </Text>
            </Animated.View>
          </View>

          {/* Instruction Guide */}
          <View style={styles.instructionWrap}>
            <Text style={styles.instructionText}>{currentCopy.guide}</Text>
          </View>

          {/* Urge Overcome Finish Button */}
          <Pressable style={styles.btnOvercome} onPress={handleFinish}>
            <Check color="#ffffff" size={20} />
            <Text style={styles.btnOvercomeText}>
              {locale === "es" ? "¡Mente en calma, superé el impulso!" : "Mind in calm, urge defeated!"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(5, 3, 10, 0.94)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  sheet: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#110c1c",
    borderRadius: radii.large,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: "center",
  },
  topBar: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: "rgba(66, 199, 245, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(66, 199, 245, 0.3)",
  },
  badgeText: {
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
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  cycleInfo: {
    alignItems: "center",
    gap: 4,
  },
  cycleText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  hapticHint: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 15,
  },
  pacerContainer: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginVertical: spacing.sm,
  },
  referenceBox: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  breathingBox: {
    width: 170,
    height: 170,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  secondsCounter: {
    fontSize: 48,
    fontWeight: "900",
    lineHeight: 52,
    letterSpacing: -1,
  },
  phaseTitle: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  instructionWrap: {
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  instructionText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 18,
  },
  btnOvercome: {
    width: "100%",
    minHeight: 52,
    backgroundColor: "#10b981",
    borderRadius: radii.medium,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: spacing.xs,
  },
  btnOvercomeText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 14,
  },
});
