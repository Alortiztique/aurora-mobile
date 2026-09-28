import type { ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radii, spacing, typography } from "../theme";

export function Screen({
  children,
  scroll = true,
  style,
}: {
  readonly children: ReactNode;
  readonly scroll?: boolean;
  readonly style?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const contentStyle = [
    styles.content,
    {
      paddingTop: Math.max(insets.top + 8, spacing.md),
      paddingBottom: Math.max(insets.bottom + 24, 48),
    },
    style,
  ];

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={contentStyle}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[contentStyle, styles.flex]}>{children}</View>
  );

  return <View style={styles.safe}>{content}</View>;
}

export function Eyebrow({ children }: { readonly children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function Title({ children }: { readonly children: ReactNode }) {
  return (
    <Text accessibilityRole="header" style={styles.title}>
      {children}
    </Text>
  );
}

export function Body({
  children,
  muted = true,
}: {
  readonly children: ReactNode;
  readonly muted?: boolean;
}) {
  return <Text style={[styles.body, !muted && styles.bodyStrong]}>{children}</Text>;
}

export function Card({
  children,
  style,
}: {
  readonly children: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({
  children,
  disabled,
  style,
  variant = "zima",
  ...props
}: PressableProps & {
  readonly children: ReactNode;
  readonly style?: StyleProp<ViewStyle> | undefined;
  readonly variant?: "zima" | "purple" | "white";
}) {
  const isString = typeof children === "string" || typeof children === "number";
  const bgStyle =
    variant === "purple"
      ? styles.btnBgPurple
      : variant === "white"
      ? styles.btnBgWhite
      : styles.btnBgZima;

  const textColor =
    variant === "purple"
      ? "#FFFFFF"
      : variant === "white"
      ? "#0C0C0E"
      : "#0C0C0E";

  const content = isString ? (
    <Text style={[styles.primaryButtonText, { color: textColor }]}>{children}</Text>
  ) : (
    children
  );

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryButtonShell,
        bgStyle,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      {...props}
    >
      {content}
    </Pressable>
  );
}

export function SecondaryButton({
  children,
  disabled,
  style,
  ...props
}: PressableProps & {
  readonly children: ReactNode;
  readonly style?: StyleProp<ViewStyle> | undefined;
}) {
  const isString = typeof children === "string" || typeof children === "number";
  const content = isString ? (
    <Text style={styles.secondaryText}>{children}</Text>
  ) : (
    children
  );

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.secondaryButton,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      {...props}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  eyebrow: {
    ...typography.label,
    color: colors.zima,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  title: {
    ...typography.display,
    color: colors.text,
    fontSize: 28,
    lineHeight: 34,
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
  },
  bodyStrong: {
    color: colors.text,
  },
  card: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  primaryButtonShell: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  btnBgZima: {
    backgroundColor: colors.zima,
    borderColor: "#57d3ff",
  },
  btnBgPurple: {
    backgroundColor: colors.purple,
    borderColor: "#9d74ff",
  },
  btnBgWhite: {
    backgroundColor: "#F5F5F7",
    borderColor: "#FFFFFF",
  },
  primaryButtonText: {
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.2,
  },
  secondaryButton: {
    minHeight: 50,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  secondaryText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.38,
  },
});
