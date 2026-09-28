import { useState } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  Brain,
  Check,
  Compass,
  Eye,
  Hash,
  Palette,
  Search,
  Type,
  Wind,
  X,
  Zap,
} from "lucide-react-native";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Card, Eyebrow, PrimaryButton, SecondaryButton } from "./ui";
import { useLocale } from "../locale";
import { colors, radii, spacing, typography } from "../theme";

interface ExerciseItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: typeof Brain;
  accentColor: string;
  challenge: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

const exercises: ExerciseItem[] = [
  {
    id: "memory",
    title: "Memoria Rápida",
    subtitle: "Activa la corteza prefrontal y enfría la dopamina",
    category: "Memory Recall",
    icon: Brain,
    accentColor: colors.zima,
    challenge: {
      question: "¿Recuerdas la secuencia mostrada?\n4 · 9 · 2 · 7",
      options: ["4 · 2 · 9 · 7", "4 · 9 · 2 · 7", "9 · 4 · 7 · 2", "4 · 9 · 7 · 2"],
      correctIndex: 1,
      explanation: "Exigirle trabajo de memoria activa al lóbulo frontal desactiva el craving límbico de dopamina.",
    },
  },
  {
    id: "find",
    title: "Encuentra el Patrón",
    subtitle: "Desvía la hiperfocalización visual compulsiva",
    category: "Find It Fast",
    icon: Search,
    accentColor: colors.purpleLight,
    challenge: {
      question: "Identifica el elemento diferente: ◈ · ◈ · ◇ · ◈ · ◈",
      options: ["Posición 1", "Posición 2", "Posición 3", "Posición 4"],
      correctIndex: 2,
      explanation: "Cambiar el foco atencional interrumpe el ciclo de recompensa anticipada.",
    },
  },
  {
    id: "scramble",
    title: "Sopa de Letras",
    subtitle: "Reconstruye conceptos de presencia y voluntad",
    category: "Word Scramble",
    icon: Type,
    accentColor: colors.positive,
    challenge: {
      question: "Descifra la palabra oculta: Q O F U N E",
      options: ["FUEGO", "ENFOQUE", "FONDO", "EQUIPO"],
      correctIndex: 1,
      explanation: "Elegir el enfoque refuerza la intención de preservar tu energía mental.",
    },
  },
  {
    id: "breath",
    title: "Respiración 4-7-8",
    subtitle: "Desacelera el pulso y activa el sistema parasimpático",
    category: "Breath Hold",
    icon: Wind,
    accentColor: colors.zima,
    challenge: {
      question: "Inhala en 4s, sostén 7s y exhala en 8s. ¿Cómo sientes tu cuerpo?",
      options: ["Aún agitado", "Más tranquilo y en control", "Con menor ansiedad", "Listo para seguir"],
      correctIndex: 1,
      explanation: "El ritmo respiratorio extendido reduce inmediatamente el cortisol y la adrenalina.",
    },
  },
  {
    id: "stroop",
    title: "Test de Stroop",
    subtitle: "Inhibición cognitiva de respuestas impulsivas",
    category: "Stroop Test",
    icon: Palette,
    accentColor: colors.purpleLight,
    challenge: {
      question: "¿De qué color es la palabra 'AZUL' cuando está escrita en tinta VERDE?",
      options: ["Azul", "Verde", "Rojo", "Amarillo"],
      correctIndex: 1,
      explanation: "El conflicto atencional bloquea la conducta automática de buscar placer rápido.",
    },
  },
  {
    id: "math",
    title: "Blitz Matemático",
    subtitle: "Cálculo mental rápido para aterrizar la mente",
    category: "Math Blitz",
    icon: Hash,
    accentColor: colors.positive,
    challenge: {
      question: "¿Cuánto es 17 + 28 - 9?",
      options: ["34", "36", "38", "42"],
      correctIndex: 1,
      explanation: "La aritmética básica reconecta la energía metabólica cerebral con el razonamiento.",
    },
  },
];

export function ExercisesTab() {
  const { locale } = useLocale();
  const [activeExercise, setActiveExercise] = useState<ExerciseItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedIndex(index);
    setIsAnswered(true);
    if (index === activeExercise?.challenge.correctIndex) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const closeExercise = () => {
    setActiveExercise(null);
    setSelectedIndex(null);
    setIsAnswered(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Eyebrow>{locale === "es" ? "NEUROCIENCIA DEL IMPULSO" : "NEUROSCIENCE OF URGES"}</Eyebrow>
        <Text style={styles.title}>
          {locale === "es" ? "Prevención de Recaídas" : "Relapse Prevention"}
        </Text>
        <Text style={styles.subtitle}>
          {locale === "es"
            ? "Un impulso químico dura de 3 a 5 minutos. Al activar la corteza prefrontal el craving se disuelve."
            : "A chemical urge lasts 3 to 5 minutes. Activating the frontal cortex dissolves the craving."}
        </Text>
      </View>

      {/* Grid: 2 Columns of Tactile Brutalist Cards */}
      <View style={styles.grid}>
        {exercises.map((item) => {
          const Icon = item.icon;
          return (
            <Pressable
              key={item.id}
              style={styles.cardShell}
              onPress={() => {
                void Haptics.selectionAsync();
                setActiveExercise(item);
              }}
            >
              <View style={styles.cardContent}>
                <View
                  style={[
                    styles.cardIconWrap,
                    { backgroundColor: `${item.accentColor}1A`, borderColor: `${item.accentColor}40` },
                  ]}
                >
                  <Icon color={item.accentColor} size={22} />
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardCategory}>{item.category}</Text>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Super-Card: El Antídoto Real (Escape al Mundo Real) */}
      <Card style={styles.walkCard}>
        <View style={styles.walkHeader}>
          <Compass color={colors.zima} size={22} />
          <View style={{ flex: 1 }}>
            <Text style={styles.walkTitle}>
              {locale === "es" ? "El Antídoto Real: Caminata al Aire Libre" : "The Real Antidote: Outdoor Walk"}
            </Text>
            <Text style={styles.walkSubtitle}>
              {locale === "es"
                ? "Cambiar de espacio físico y caminar 10 minutos al aire libre corta el 92% de los impulsos sin desgaste de fuerza de voluntad."
                : "Stepping outside and walking for 10 minutes breaks 92% of urges without mental strain."}
            </Text>
          </View>
        </View>

        <PrimaryButton
          variant="zima"
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/walk");
          }}
        >
          {locale === "es" ? "Iniciar Caminata con Mapa de Señales" : "Start Walk with Signal Map"}
        </PrimaryButton>
      </Card>

      {/* MODAL: Playable Exercise */}
      <Modal visible={activeExercise !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={styles.badgeWrap}>
                <Zap color={colors.zima} size={15} />
                <Text style={styles.badgeText}>{activeExercise?.category}</Text>
              </View>
              <Pressable onPress={closeExercise} style={styles.closeBtn}>
                <X color={colors.textMuted} size={20} />
              </Pressable>
            </View>

            <Text style={styles.exerciseModalTitle}>{activeExercise?.title}</Text>
            <Text style={styles.exerciseModalSubtitle}>{activeExercise?.subtitle}</Text>

            {/* Question / Challenge Box - Fixed Skia Border Bug */}
            <View style={styles.challengeBox}>
              <Text style={styles.challengeQuestion}>
                {activeExercise?.challenge.question}
              </Text>
            </View>

            {/* Options */}
            <View style={styles.optionsList}>
              {activeExercise?.challenge.options.map((option, idx) => {
                const isSelected = selectedIndex === idx;
                const isCorrect = idx === activeExercise.challenge.correctIndex;
                return (
                  <Pressable
                    key={idx}
                    style={[
                      styles.optionItem,
                      !isAnswered && styles.optionNormal,
                      isAnswered && isCorrect && styles.optionCorrect,
                      isAnswered && isSelected && !isCorrect && styles.optionWrong,
                    ]}
                    onPress={() => handleSelectOption(idx)}
                    disabled={isAnswered}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isAnswered && isCorrect && { color: colors.positive, fontWeight: "800" },
                        isAnswered && isSelected && !isCorrect && { color: colors.danger },
                      ]}
                    >
                      {option}
                    </Text>
                    {isAnswered && isCorrect && <Check color={colors.positive} size={18} />}
                    {isAnswered && isSelected && !isCorrect && (
                      <X color={colors.danger} size={18} />
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Feedback & Explanation */}
            {isAnswered && (
              <View style={styles.explanationBox}>
                <Text style={styles.explanationText}>
                  {activeExercise?.challenge.explanation}
                </Text>
                <PrimaryButton variant="purple" onPress={closeExercise}>
                  {locale === "es" ? "Completar Ejercicio" : "Finish Exercise"}
                </PrimaryButton>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    maxWidth: 680,
    width: "100%",
    alignSelf: "center",
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
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  cardShell: {
    width: "48%",
    minHeight: 120,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    gap: 2,
    marginTop: 10,
  },
  cardCategory: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  walkCard: {
    gap: 14,
    padding: 16,
  },
  walkHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  walkTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  walkSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(66, 199, 245, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(66, 199, 245, 0.3)",
  },
  badgeText: {
    color: colors.zima,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceRaised,
  },
  exerciseModalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  exerciseModalSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: -4,
  },
  challengeBox: {
    padding: 16,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  challengeQuestion: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionNormal: {
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  optionCorrect: {
    borderColor: colors.positive,
    backgroundColor: "rgba(74, 222, 128, 0.12)",
  },
  optionWrong: {
    borderColor: colors.danger,
    backgroundColor: "rgba(244, 63, 94, 0.12)",
  },
  optionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  explanationBox: {
    gap: 12,
    paddingTop: 4,
  },
  explanationText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
