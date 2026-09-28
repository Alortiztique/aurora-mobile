import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Footprints,
  Heart,
  Pause,
  Sparkles,
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { RESET_SCENARIOS, getResetScenario, type ResetScenarioId } from "@aurora/domain";
import { Body, Card, Eyebrow, PrimaryButton, Screen, SecondaryButton, Title } from "../src/components/ui";
import { presentSupportOffering } from "../src/integrations";
import { useLocale } from "../src/locale";
import { updateProgress } from "../src/progress";
import { colors, radii, spacing, typography } from "../src/theme";

type Phase = "choose" | "pause" | "reflect" | "complete";

export default function ResetScreen() {
  const { locale } = useLocale();
  const [phase, setPhase] = useState<Phase>("choose");
  const [selected, setSelected] = useState<ResetScenarioId | null>(null);
  const [seconds, setSeconds] = useState(20);
  const [reflection, setReflection] = useState("");
  const [showSupport, setShowSupport] = useState(false);
  const scenario = useMemo(() => (selected ? getResetScenario(selected) : null), [selected]);

  useEffect(() => {
    if (phase !== "pause" || seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((value) => value - 1), 1_000);
    return () => clearTimeout(timer);
  }, [phase, seconds]);

  const begin = (id: ResetScenarioId) => {
    setSelected(id);
    setPhase("pause");
    void Haptics.selectionAsync();
  };

  const complete = async () => {
    setReflection("");
    const next = await updateProgress((current) => ({
      ...current,
      resetsCompleted: current.resetsCompleted + 1,
      intentionalExits: current.intentionalExits + 1,
      minutesReclaimed: current.minutesReclaimed + 10,
    }));
    const week = 7 * 24 * 60 * 60 * 1_000;
    setShowSupport(
      !next.neverShowSupport &&
        (next.lastSupportPromptAt === null || Date.now() - next.lastSupportPromptAt > week)
    );
    setPhase("complete");
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const support = async () => {
    await updateProgress((current) => ({ ...current, lastSupportPromptAt: Date.now() }));
    setShowSupport(false);
    await presentSupportOffering();
  };

  return (
    <Screen>
      {/* Top Bar with Back Button */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.btnBack}
          onPress={() => {
            void Haptics.selectionAsync();
            if (phase === "choose") {
              router.back();
            } else {
              setPhase("choose");
            }
          }}
        >
          <ArrowLeft color={colors.text} size={20} />
          <Text style={styles.backLabel}>
            {phase === "choose" ? (locale === "es" ? "Inicio" : "Back") : (locale === "es" ? "Cambiar" : "Change")}
          </Text>
        </Pressable>

        <Eyebrow>{locale === "es" ? "RECUPERA UNA DECISIÓN" : "RECOVER AGENCY"}</Eyebrow>
      </View>

      {/* PHASE 1: Choose Scenario */}
      {phase === "choose" && (
        <View style={styles.contentWrap}>
          <View style={styles.headerBlock}>
            <Title>{locale === "es" ? "¿Qué te está atrapando?" : "What is pulling you in?"}</Title>
            <Body>
              {locale === "es"
                ? "No tienes que demostrar nada. Elige lo más cercano a este momento."
                : "You do not have to prove anything. Choose what is closest right now."}
            </Body>
          </View>

          <View style={styles.list}>
            {RESET_SCENARIOS.map((item) => (
              <Pressable
                key={item.id}
                style={styles.scenario}
                onPress={() => begin(item.id)}
                accessibilityRole="button"
              >
                <Text style={styles.scenarioText}>{item.label[locale]}</Text>
                <ArrowRight color={colors.textMuted} size={18} />
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* PHASE 2: Brief Pause */}
      {phase === "pause" && scenario && (
        <View style={styles.contentWrap}>
          <View style={styles.headerBlock}>
            <Title>{scenario.validation[locale]}</Title>
          </View>

          <View style={styles.breathBox}>
            <Pause color={colors.zima} size={28} />
            <Text style={styles.seconds}>{seconds}</Text>
            <Text style={styles.breathLabel}>
              {locale === "es"
                ? "Respira lento. Nada que decidir todavía."
                : "Breathe slowly. Nothing to decide yet."}
            </Text>
          </View>

          <PrimaryButton
            onPress={() => setPhase("reflect")}
            disabled={seconds > 0}
            variant="zima"
          >
            {seconds > 0
              ? locale === "es"
                ? "Quédate aquí"
                : "Stay here"
              : locale === "es"
              ? "Estoy listo"
              : "I am ready"}
          </PrimaryButton>
        </View>
      )}

      {/* PHASE 3: Reflect & One Small Action */}
      {phase === "reflect" && scenario && (
        <View style={styles.contentWrap}>
          <View style={styles.headerBlock}>
            <Title>{scenario.reflection[locale]}</Title>
          </View>

          <TextInput
            style={styles.input}
            multiline
            maxLength={700}
            value={reflection}
            onChangeText={setReflection}
            placeholder={
              locale === "es"
                ? "Esta reflexión permanece en este dispositivo y se elimina al terminar."
                : "This reflection stays on this device and is deleted when you finish."
            }
            placeholderTextColor={colors.textMuted}
            textAlignVertical="top"
          />

          <Card style={styles.actionCard}>
            <View style={styles.actionLine}>
              <Sparkles color={colors.positive} size={18} />
              <Text style={styles.actionTitle}>
                {locale === "es" ? "Una acción pequeña" : "One small action"}
              </Text>
            </View>
            <Body>{scenario.action[locale]}</Body>
          </Card>

          <PrimaryButton onPress={() => void complete()} variant="purple">
            {locale === "es" ? "Elegir esta acción" : "Choose this action"}
          </PrimaryButton>
        </View>
      )}

      {/* PHASE 4: Completed */}
      {phase === "complete" && (
        <View style={styles.contentWrap}>
          <View style={styles.completeIcon}>
            <Check color={colors.positive} size={32} />
          </View>
          <Title>
            {locale === "es"
              ? "El ciclo no decidió por ti"
              : "The loop did not decide for you"}
          </Title>
          <Body>
            {locale === "es"
              ? "Un momento difícil no borra tu progreso. ¿Quieres llevar esta decisión al mundo físico?"
              : "A difficult moment does not erase your progress. Want to take this decision into the physical world?"}
          </Body>

          <PrimaryButton onPress={() => router.replace("/walk")} variant="zima">
            <View style={styles.buttonInline}>
              <Footprints color="#0C0C0E" size={18} />
              <Text style={styles.buttonText}>
                {locale === "es" ? "Caminar 10 minutos" : "Walk for 10 minutes"}
              </Text>
            </View>
          </PrimaryButton>

          <SecondaryButton onPress={() => router.replace("/")}>
            {locale === "es" ? "Volver al inicio" : "Return home"}
          </SecondaryButton>

          {showSupport && (
            <Card style={styles.supportCard}>
              <View style={styles.actionLine}>
                <Heart color={colors.purpleLight} size={18} />
                <Text style={styles.actionTitle}>
                  {locale === "es" ? "¿Aurora App te ayudó hoy?" : "Did Aurora App help today?"}
                </Text>
              </View>
              <Body>
                {locale === "es"
                  ? "Todo seguirá gratis. Si puedes, un aporte voluntario ayuda a sostenerlo."
                  : "Everything will stay free. If you can, voluntary support helps sustain it."}
              </Body>
              <SecondaryButton onPress={() => void support()}>
                {locale === "es" ? "Apoyar a Aurora App" : "Support Aurora App"}
              </SecondaryButton>
              <Pressable onPress={() => setShowSupport(false)}>
                <Text style={styles.notNow}>
                  {locale === "es" ? "Ahora no" : "Not now"}
                </Text>
              </Pressable>
            </Card>
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  btnBack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  contentWrap: {
    gap: spacing.md,
  },
  headerBlock: {
    gap: 4,
  },
  list: {
    gap: 8,
  },
  scenario: {
    minHeight: 56,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
  },
  scenarioText: {
    flex: 1,
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
  },
  breathBox: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  seconds: {
    fontSize: 68,
    lineHeight: 74,
    fontWeight: "300",
    color: colors.text,
  },
  breathLabel: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },
  input: {
    minHeight: 140,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    color: colors.text,
    ...typography.body,
  },
  actionCard: {
    gap: 8,
  },
  actionLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionTitle: {
    ...typography.heading,
    color: colors.text,
    fontSize: 15,
  },
  completeIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    alignSelf: "center",
  },
  buttonInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#0C0C0E",
    fontWeight: "800",
  },
  supportCard: {
    marginTop: spacing.sm,
    gap: 8,
  },
  notNow: {
    color: colors.textMuted,
    textAlign: "center",
    padding: 8,
    fontSize: 13,
  },
});
