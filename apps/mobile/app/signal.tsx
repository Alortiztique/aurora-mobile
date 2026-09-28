import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  Camera,
  Check,
  ChevronLeft,
  Image as ImageIcon,
  LocateFixed,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react-native";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  cautionCategorySchema,
  positiveCategorySchema,
  signalCategoryLabels,
  type CreateSignalInput,
  type SignalCategory,
  type SignalKind,
} from "@aurora/domain";
import { submitSignal, uploadSignalMedia, type LocalMediaAsset } from "../src/api";
import { Body, Card, Eyebrow, Screen, Title } from "../src/components/ui";
import { useLocale } from "../src/locale";
import { colors, radii, spacing, typography } from "../src/theme";

export default function SignalScreen() {
  const { locale } = useLocale();
  const [kind, setKind] = useState<SignalKind | null>(null);
  const [category, setCategory] = useState<SignalCategory | null>(null);
  const [summary, setSummary] = useState("");
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [media, setMedia] = useState<LocalMediaAsset | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [preferredCamera, setPreferredCamera] = useState<"back" | "front">("back");

  const categories = useMemo(
    () => (kind === "positive" ? positiveCategorySchema.options : cautionCategorySchema.options),
    [kind]
  );

  const mutation = useMutation({
    mutationFn: async (input: CreateSignalInput) => {
      let mediaKey: string | null = null;
      if (media) {
        try {
          const res = await uploadSignalMedia(media);
          mediaKey = res.mediaKey;
        } catch {
          // If upload fails, proceed with null mediaKey so signal isn't lost
          mediaKey = null;
        }
      }
      return submitSignal({ ...input, mediaKey });
    },
    onSuccess: () => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  // Auto-fetch location on mount
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === "granted" && active) {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (active) setLocation(loc);
        }
      } catch {
        // user can manually tap locate
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!kind) setCategory(null);
  }, [kind]);

  const requestLocation = async () => {
    void Haptics.selectionAsync();
    setLocationError(false);
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setLocationError(true);
        setLocating(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(loc);
    } catch {
      setLocationError(true);
    } finally {
      setLocating(false);
    }
  };

  const handleCaptureCamera = async () => {
    void Haptics.selectionAsync();
    setMediaError(null);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        setMediaError(
          locale === "es"
            ? "Permiso de cámara necesario para capturar evidencia."
            : "Camera permission is required to capture evidence."
        );
        return;
      }

      const cameraType =
        preferredCamera === "front"
          ? ImagePicker.CameraType.front
          : ImagePicker.CameraType.back;

      const result = await ImagePicker.launchCameraAsync({
        cameraType,
        allowsEditing: true,
        quality: 0.82,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;
      const asset = result.assets[0];
      if (!asset) return;
      const filename = asset.fileName || `signal-${Date.now()}.jpg`;
      const mimeType = asset.mimeType || "image/jpeg";

      setMedia({
        uri: asset.uri,
        name: filename,
        mimeType,
      });
    } catch {
      setMediaError(
        locale === "es"
          ? "No se pudo abrir la cámara."
          : "Could not open camera."
      );
    }
  };

  const handlePickGallery = async () => {
    void Haptics.selectionAsync();
    setMediaError(null);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setMediaError(
          locale === "es"
            ? "Permiso de galería necesario."
            : "Media library permission is required."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.82,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;
      const asset = result.assets[0];
      if (!asset) return;
      const filename = asset.fileName || `signal-${Date.now()}.jpg`;
      const mimeType = asset.mimeType || "image/jpeg";

      setMedia({
        uri: asset.uri,
        name: filename,
        mimeType,
      });
    } catch {
      setMediaError(
        locale === "es"
          ? "No se pudo seleccionar la imagen."
          : "Could not select image."
      );
    }
  };

  const toggleCameraDirection = () => {
    void Haptics.selectionAsync();
    setPreferredCamera((prev) => (prev === "back" ? "front" : "back"));
  };

  const submit = () => {
    if (!kind || !location) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    mutation.mutate({
      kind,
      category,
      summary: summary.trim() || null,
      pseudonym: null,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracyMeters: location.coords.accuracy,
      mediaKey: null,
      locale,
      consentToPublish: true,
    });
  };

  if (mutation.isSuccess) {
    return (
      <Screen>
        <View style={styles.successScreen}>
          <View style={styles.successIconBox}>
            <Check color={colors.positive} size={36} />
          </View>
          <Title>
            {locale === "es"
              ? "Tu experiencia ya aporta contexto vivo"
              : "Your signal now contributes live context"}
          </Title>
          <Body>
            {mutation.data?.status === "pending"
              ? locale === "es"
                ? "La Señal se publicará en breve tras moderación comunitaria."
                : "The Signal will appear shortly following community moderation."
              : locale === "es"
              ? "La Señal ya es visible en el Pulso Aurora y en miaurora.app."
              : "The Signal is now visible on Aurora Pulse and miaurora.app."}
          </Body>
          <Pressable
            style={styles.btnPrimarySolid}
            onPress={() => {
              void Haptics.selectionAsync();
              router.back();
            }}
          >
            <Text style={styles.btnPrimarySolidText}>
              {locale === "es" ? "Volver al Mapa Vivo" : "Return to Live Map"}
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Back Link */}
        <Pressable
          style={styles.backRow}
          onPress={() => {
            void Haptics.selectionAsync();
            router.back();
          }}
        >
          <ChevronLeft color={colors.zima} size={20} />
          <Text style={styles.backText}>
            {locale === "es" ? "Volver al Mapa" : "Back to Map"}
          </Text>
        </Pressable>

        <Eyebrow>{locale === "es" ? "SEÑAL COMUNITARIA · NO UNA RESEÑA" : "COMMUNITY SIGNAL · NOT A REVIEW"}</Eyebrow>
        <Title>{locale === "es" ? "¿Cómo se siente este lugar ahora?" : "How is it here right now?"}</Title>
        <Text style={styles.subtitle}>
          {locale === "es"
            ? "Comparte contexto de calidez o precaución para cuidar a quienes transitan por aquí."
            : "Share context of warmth or caution to assist others passing through."}
        </Text>

        {/* Kind Selection (Positivo vs Precaución) */}
        <View style={styles.kindsRow}>
          <Pressable
            style={[
              styles.kindCard,
              kind === "positive" && styles.kindCardPositiveActive,
            ]}
            onPress={() => {
              void Haptics.selectionAsync();
              setKind("positive");
            }}
          >
            <Sparkles
              color={kind === "positive" ? colors.positive : colors.textMuted}
              size={26}
            />
            <Text
              style={[
                styles.kindCardTitle,
                kind === "positive" && { color: colors.positive },
              ]}
            >
              {locale === "es" ? "Positiva (Calidez)" : "Positive"}
            </Text>
            <Text style={styles.kindCardDesc}>
              {locale === "es"
                ? "Buena vibra, luz, comercios abiertos, gente transitando"
                : "Active shops, good lighting, friendly people"}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.kindCard,
              kind === "caution" && styles.kindCardCautionActive,
            ]}
            onPress={() => {
              void Haptics.selectionAsync();
              setKind("caution");
            }}
          >
            <AlertTriangle
              color={kind === "caution" ? colors.caution : colors.textMuted}
              size={26}
            />
            <Text
              style={[
                styles.kindCardTitle,
                kind === "caution" && { color: colors.caution },
              ]}
            >
              {locale === "es" ? "Precaución" : "Caution"}
            </Text>
            <Text style={styles.kindCardDesc}>
              {locale === "es"
                ? "Poca luz, calle solitaria, riesgo o incidente reciente"
                : "Low lighting, deserted area, potential hazard"}
            </Text>
          </Pressable>
        </View>

        {/* Categories Chips */}
        {kind && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionLabel}>
              {locale === "es" ? "CATEGORÍA EXACTA" : "EXACT CATEGORY"}
            </Text>
            <View style={styles.chipsWrap}>
              {categories.map((catKey) => {
                const active = category === catKey;
                return (
                  <Pressable
                    key={catKey}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => {
                      void Haptics.selectionAsync();
                      setCategory(catKey);
                    }}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {signalCategoryLabels[catKey][locale]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Summary Input */}
        <View style={styles.sectionWrap}>
          <View style={styles.inputHeader}>
            <Text style={styles.sectionLabel}>
              {locale === "es" ? "DESCRIPCIÓN BREVE (OPCIONAL)" : "BRIEF SUMMARY (OPTIONAL)"}
            </Text>
            <Text style={styles.charCount}>{summary.length}/280</Text>
          </View>
          <TextInput
            value={summary}
            onChangeText={setSummary}
            maxLength={280}
            multiline
            textAlignVertical="top"
            placeholder={
              locale === "es"
                ? "Describe el lugar o la situación objetiva. No incluyas nombres, rostros ni califiques personas."
                : "Describe the place or context objectively. Do not include names, faces, or rate individuals."
            }
            placeholderTextColor={colors.textMuted}
            style={styles.textInput}
          />
        </View>

        {/* Photo Evidence with Front/Back Camera Switching */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionLabel}>
            {locale === "es" ? "EVIDENCIA VISUAL (FOTO O CONTEXTO)" : "VISUAL EVIDENCE (PHOTO)"}
          </Text>

          {media ? (
            <View style={styles.mediaPreviewCard}>
              <Image source={{ uri: media.uri }} style={styles.mediaThumbnail} />
              <View style={styles.mediaPreviewInfo}>
                <Text style={styles.mediaFileName} numberOfLines={1}>
                  {media.name}
                </Text>
                <Text style={styles.mediaBadge}>
                  {locale === "es" ? "Foto adjunta" : "Photo attached"}
                </Text>
              </View>
              <Pressable
                style={styles.btnRemoveMedia}
                onPress={() => {
                  void Haptics.selectionAsync();
                  setMedia(null);
                }}
              >
                <Trash2 color={colors.danger} size={18} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.cameraBox}>
              {/* Camera direction toggle pill */}
              <View style={styles.cameraControlsRow}>
                <Pressable
                  style={styles.btnFlipCamera}
                  onPress={toggleCameraDirection}
                >
                  <RefreshCw color={colors.zima} size={14} />
                  <Text style={styles.btnFlipText}>
                    {preferredCamera === "back"
                      ? locale === "es"
                        ? "Cámara Trasera (Entorno)"
                        : "Rear Camera (Environment)"
                      : locale === "es"
                      ? "Cámara Frontal (Selfie)"
                      : "Front Camera (Selfie)"}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.mediaButtonsRow}>
                <Pressable
                  style={styles.btnCapture}
                  onPress={() => void handleCaptureCamera()}
                >
                  <Camera color="#ffffff" size={18} />
                  <Text style={styles.btnCaptureText}>
                    {locale === "es" ? "Tomar Foto" : "Take Photo"}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.btnGallery}
                  onPress={() => void handlePickGallery()}
                >
                  <ImageIcon color={colors.textMuted} size={18} />
                  <Text style={styles.btnGalleryText}>
                    {locale === "es" ? "Galería" : "Gallery"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {mediaError && <Text style={styles.errorText}>{mediaError}</Text>}
        </View>

        {/* Location Section */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionLabel}>
            {locale === "es" ? "COORDENADAS DE LA SEÑAL" : "SIGNAL LOCATION"}
          </Text>
          <Pressable
            style={[styles.locationCard, location && styles.locationCardReady]}
            onPress={() => void requestLocation()}
          >
            <LocateFixed
              color={location ? colors.positive : colors.zima}
              size={22}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.locationTitle}>
                {location
                  ? locale === "es"
                    ? "Ubicación detectada con éxito"
                    : "Location ready"
                  : locale === "es"
                  ? "Detectar mi ubicación GPS"
                  : "Detect my GPS location"}
              </Text>
              <Text style={styles.locationDesc}>
                {location
                  ? `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)} (±${Math.round(location.coords.accuracy || 0)}m)`
                  : locale === "es"
                  ? "Toca para fijar el punto en el mapa"
                  : "Tap to set coordinates on the map"}
              </Text>
            </View>
            {locating && <ActivityIndicator color={colors.zima} size="small" />}
          </Pressable>
          {locationError && (
            <Text style={styles.errorText}>
              {locale === "es"
                ? "Permiso de ubicación necesario para fijar la Señal en el mapa."
                : "Location permission is required to place the Signal on the map."}
            </Text>
          )}
        </View>

        {/* Privacy Card */}
        <Card style={styles.privacyCard}>
          <Body>
            {locale === "es"
              ? "Aurora respeta la privacidad: las coordenadas públicas se cuantizan ligeramente para proteger domicilios privados. Queda terminantemente prohibido publicar rostros identificables, doxxing o difamación."
              : "Aurora respects privacy: public coordinates are privacy-quantized. Posting identifiable faces, doxxing, or defamatory personal attacks is strictly prohibited."}
          </Body>
        </Card>

        {mutation.isError && (
          <Text style={styles.errorText}>
            {locale === "es"
              ? "No se pudo compartir la Señal. Por favor intenta de nuevo."
              : "Could not share Signal. Please try again."}
          </Text>
        )}

        {/* Submit Button */}
        <Pressable
          style={[
            styles.btnSubmit,
            (!kind || !location || mutation.isPending) && styles.btnSubmitDisabled,
          ]}
          disabled={!kind || !location || mutation.isPending}
          onPress={submit}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Check color="#ffffff" size={18} />
              <Text style={styles.btnSubmitText}>
                {locale === "es" ? "Publicar en el Mapa Vivo" : "Publish to Live Map"}
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
    gap: 16,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  backText: {
    color: colors.zima,
    fontSize: 14,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: -4,
  },
  kindsRow: {
    flexDirection: "row",
    gap: 12,
  },
  kindCard: {
    flex: 1,
    minHeight: 110,
    padding: 14,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "space-between",
  },
  kindCardPositiveActive: {
    borderColor: colors.positive,
    backgroundColor: "rgba(101,222,180,0.1)",
  },
  kindCardCautionActive: {
    borderColor: colors.caution,
    backgroundColor: "rgba(255,184,107,0.1)",
  },
  kindCardTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 6,
  },
  kindCardDesc: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 14,
    marginTop: 2,
  },
  sectionWrap: {
    gap: 8,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    borderColor: colors.zima,
    backgroundColor: "rgba(66,199,245,0.12)",
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  chipTextActive: {
    color: colors.zima,
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  charCount: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
  },
  textInput: {
    minHeight: 90,
    padding: 14,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  /* Camera & Media */
  cameraBox: {
    padding: 14,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  cameraControlsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  btnFlipCamera: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: "rgba(66,199,245,0.1)",
    borderWidth: 1,
    borderColor: "rgba(66,199,245,0.3)",
  },
  btnFlipText: {
    color: colors.zima,
    fontSize: 11,
    fontWeight: "700",
  },
  mediaButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  btnCapture: {
    flex: 1.2,
    minHeight: 46,
    borderRadius: radii.medium,
    backgroundColor: colors.zima,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnCaptureText: {
    color: "#0c0a14",
    fontSize: 13,
    fontWeight: "800",
  },
  btnGallery: {
    flex: 1,
    minHeight: 46,
    borderRadius: radii.medium,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnGalleryText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  mediaPreviewCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaThumbnail: {
    width: 60,
    height: 60,
    borderRadius: radii.small,
    backgroundColor: colors.surfaceRaised,
  },
  mediaPreviewInfo: {
    flex: 1,
    gap: 4,
  },
  mediaFileName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  mediaBadge: {
    color: colors.positive,
    fontSize: 10,
    fontWeight: "700",
  },
  btnRemoveMedia: {
    padding: 8,
    borderRadius: radii.small,
    backgroundColor: "rgba(255,59,48,0.12)",
  },
  /* Location */
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationCardReady: {
    borderColor: colors.positive,
  },
  locationTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  locationDesc: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  privacyCard: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderColor: colors.border,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "600",
  },
  /* Submit */
  btnSubmit: {
    minHeight: 52,
    borderRadius: radii.medium,
    backgroundColor: colors.zima,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
  },
  btnSubmitDisabled: {
    opacity: 0.45,
  },
  btnSubmitText: {
    color: "#0c0a14",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  /* Success */
  successScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingVertical: 40,
  },
  successIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(101,222,180,0.12)",
    borderWidth: 1,
    borderColor: colors.positive,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimarySolid: {
    minHeight: 48,
    paddingHorizontal: 24,
    borderRadius: radii.medium,
    backgroundColor: colors.zima,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  btnPrimarySolidText: {
    color: "#0c0a14",
    fontSize: 14,
    fontWeight: "900",
  },
});
