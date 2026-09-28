import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient as SvgLinearGradient,
  RadialGradient as SvgRadialGradient,
  Stop,
} from "react-native-svg";
import { colors, radii, spacing } from "../theme";

interface NeuralClaritySphereProps {
  streakDays: number;
  isPioneer?: boolean;
  isGuardian?: boolean;
  locale?: "en" | "es";
  onPress?: () => void;
}

export function getNeuroPhase(days: number, locale: "en" | "es" = "es") {
  if (days === 0) {
    return {
      phase: locale === "es" ? "FASE I · COMIENZO" : "PHASE I · START",
      headline: locale === "es" ? "Primer Paso hacia la Soberanía" : "First Step to Sovereignty",
      description:
        locale === "es"
          ? "Día 0: Tu compromiso comienza hoy. Cada minuto sin estimulación artificial recupera tu motivación."
          : "Day 0: Your journey begins today. Every minute away from artificial stimulation rebuilds your natural agency.",
      color: colors.zima,
    };
  }
  if (days < 4) {
    return {
      phase: locale === "es" ? "FASE I · RESET" : "PHASE I · RESET",
      headline: locale === "es" ? "Descompresión Neuroquímica" : "Neurochemical Reset",
      description:
        locale === "es"
          ? "Días 1 al 3: el cerebro interrumpe la demanda constante de dopamina artificial."
          : "Days 1-3: breaking the craving cycle and re-centering baseline dopamine.",
      color: colors.zima,
    };
  }
  if (days < 15) {
    return {
      phase: locale === "es" ? "FASE II · CLARIDAD" : "PHASE II · CLARITY",
      headline: locale === "es" ? "Regeneración de Receptores" : "Receptor Regeneration",
      description:
        locale === "es"
          ? "Días 4 al 14: reajuste de receptores D2, restablecimiento del sueño REM y calma atencional."
          : "Days 4-14: dopamine D2 receptor upregulation and restorative sleep recovery.",
      color: colors.zima,
    };
  }
  if (days < 46) {
    return {
      phase: locale === "es" ? "FASE III · DESPERTAR" : "PHASE III · AWAKENING",
      headline: locale === "es" ? "Corteza Prefrontal Activa" : "Prefrontal Cortex Activation",
      description:
        locale === "es"
          ? "Días 15 al 45: consolidación del autocontrol, mayor enfoque sostenido y claridad emocional."
          : "Days 15-45: executive control restoration, prolonged focus and reduced emotional reactivity.",
      color: colors.violetSoft,
    };
  }
  if (days < 91) {
    return {
      phase: locale === "es" ? "FASE IV · SOBERANÍA" : "PHASE IV · SOVEREIGN",
      headline: locale === "es" ? "Autonomía Atencional" : "Attentional Autonomy",
      description:
        locale === "es"
          ? "Días 46 al 90: plasticidad neuronal fortalecida; el hábito adictivo pierde su tracción neurobiológica."
          : "Days 46-90: deepened neuroplasticity and sovereign willpower across all daily routines.",
      color: colors.positive,
    };
  }
  return {
    phase: locale === "es" ? "FASE V · VANGUARDIA" : "PHASE V · VANGUARD",
    headline: locale === "es" ? "Presencia Plena y Autodominio" : "Total Agency & Mastery",
    description:
      locale === "es"
        ? "Día 90+: maduración de vías sinápticas saludables. Libertad mental y coherencia vital conquistadas."
        : "Day 90+: neural pathways fully consolidated. Sustainable clarity and deep focus.",
    color: "#ffb703",
  };
}

export function NeuralClaritySphere({
  streakDays,
  isPioneer = false,
  isGuardian = false,
  locale = "es",
  onPress,
}: NeuralClaritySphereProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.025,
          duration: 3500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 45000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    pulseLoop.start();
    rotateLoop.start();

    return () => {
      pulseLoop.stop();
      rotateLoop.stop();
    };
  }, [pulseAnim, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const rotationCounter = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"],
  });

  const phaseInfo = getNeuroPhase(streakDays, locale);
  const primaryAccent = isPioneer ? "#ffb703" : isGuardian ? colors.zima : phaseInfo.color;

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Clarity Sphere: ${streakDays} days clean, ${phaseInfo.phase}`}
    >
      <Animated.View
        style={[
          styles.sphereWrapper,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        {/* Rotating SVG Vector Orbits Layer */}
        <Animated.View
          style={[
            styles.svgLayer,
            {
              transform: [{ rotate: rotation }],
            },
          ]}
        >
          <Svg width={180} height={180} viewBox="0 0 230 230">
            <Defs>
              <SvgRadialGradient id="coreObsidian" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#181226" stopOpacity="1" />
                <Stop offset="65%" stopColor="#100c1c" stopOpacity="1" />
                <Stop offset="100%" stopColor="#08070c" stopOpacity="1" />
              </SvgRadialGradient>

              <SvgLinearGradient id="orbitGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={primaryAccent} stopOpacity="0.8" />
                <Stop offset="50%" stopColor="#a998ff" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#42c7f5" stopOpacity="0.1" />
              </SvgLinearGradient>
            </Defs>

            {/* Outermost Precision Geometric Ring (1px crisp) */}
            <Circle
              cx={115}
              cy={115}
              r={112}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={1}
              fill="none"
              strokeDasharray="4 6"
            />

            {/* Primary Orbit Ring */}
            <Circle
              cx={115}
              cy={115}
              r={102}
              stroke="url(#orbitGrad1)"
              strokeWidth={1.5}
              fill="none"
            />

            {/* Secondary Concentric Ring */}
            <Circle
              cx={115}
              cy={115}
              r={92}
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth={1}
              fill="none"
            />

            {/* Central Solid Obsidian Sphere Body */}
            <Circle
              cx={115}
              cy={115}
              r={86}
              fill="url(#coreObsidian)"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth={1}
            />

            {/* Inner Precision Arc Details */}
            <Circle
              cx={115}
              cy={115}
              r={76}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth={1}
              fill="none"
              strokeDasharray="3 9"
            />

            {/* Orbiting Satellite Node 1 (North-East) */}
            <G transform="translate(195, 75)">
              <Circle cx={0} cy={0} r={4} fill={primaryAccent} />
              <Circle cx={0} cy={0} r={7} stroke={primaryAccent} strokeWidth={0.8} strokeOpacity={0.5} fill="none" />
            </G>

            {/* Orbiting Satellite Node 2 (South-West) */}
            <G transform="translate(35, 155)">
              <Circle cx={0} cy={0} r={3} fill="#d7a4ff" />
            </G>
          </Svg>
        </Animated.View>

        {/* Counter-Rotating Satellite Ring */}
        <Animated.View
          style={[
            styles.svgLayer,
            {
              transform: [{ rotate: rotationCounter }],
            },
          ]}
        >
          <Svg width={180} height={180} viewBox="0 0 230 230">
            {/* Third Counter Orbit Node */}
            <G transform="translate(115, 8)">
              <Circle cx={0} cy={0} r={2.5} fill={primaryAccent} />
            </G>
            <G transform="translate(115, 222)">
              <Circle cx={0} cy={0} r={2.5} fill="rgba(255, 255, 255, 0.4)" />
            </G>
          </Svg>
        </Animated.View>

        {/* Central Information Core (Non-rotating) */}
        <View style={styles.coreContent}>
          <Text style={[styles.phaseLabel, { color: primaryAccent }]}>
            {phaseInfo.phase}
          </Text>

          <View style={styles.daysRow}>
            <Text style={styles.daysNumber}>{streakDays}</Text>
            <Text style={styles.daysUnit}>d</Text>
          </View>

          <Text style={styles.stateLabel}>
            {locale === "es" ? "CLARIDAD MENTAL" : "MENTAL CLARITY"}
          </Text>

          {isPioneer && (
            <View style={styles.founderTag}>
              <Text style={styles.founderTagText}>PIONEER</Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Neurobiological Phase Narrative Card below sphere */}
      <View style={styles.narrativeBox}>
        <View style={styles.narrativeHeader}>
          <View style={[styles.narrativeDot, { backgroundColor: primaryAccent }]} />
          <Text style={styles.narrativeHeadline}>{phaseInfo.headline}</Text>
        </View>
        <Text style={styles.narrativeText}>{phaseInfo.description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  sphereWrapper: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  svgLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 180,
    height: 180,
  },
  coreContent: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
    zIndex: 10,
  },
  phaseLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  daysRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  daysNumber: {
    fontSize: 42,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -1,
    lineHeight: 46,
  },
  daysUnit: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textMuted,
    marginLeft: 2,
  },
  stateLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    color: colors.textMuted,
  },
  founderTag: {
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255, 183, 3, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 183, 3, 0.4)",
  },
  founderTagText: {
    color: "#ffb703",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  narrativeBox: {
    marginTop: 6,
    width: "100%",
    maxWidth: 420,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: radii.medium,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  narrativeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  narrativeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  narrativeHeadline: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  narrativeText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
});
