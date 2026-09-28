import { useEffect, useMemo, useRef, useState } from "react";
import { router } from "expo-router";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";
import Mapbox from "@rnmapbox/maps";
import { useQuery } from "@tanstack/react-query";
import { Check, Clock3, Footprints, MapPin, Share2, Square } from "lucide-react-native";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import { createWalkShare, endWalkShare, fetchPulse, updateWalkShare, type WalkShareCredentials } from "../src/api";
import { Body, Card, Eyebrow, PrimaryButton, Screen, SecondaryButton, Title } from "../src/components/ui";
import { useLocale } from "../src/locale";
import { updateProgress } from "../src/progress";
import { colors, radii, spacing, typography } from "../src/theme";

const styleUrl = process.env.EXPO_PUBLIC_MAPBOX_STYLE_URL ?? "mapbox://styles/malunao/cm84u5ecf000x01qled5j8bvl";

type Coordinate = [number, number];
type Phase = "choose" | "active" | "complete";

function distanceMeters(left: Coordinate, right: Coordinate): number {
  const radius = 6_371_000;
  const lat1 = left[1] * Math.PI / 180;
  const lat2 = right[1] * Math.PI / 180;
  const deltaLat = (right[1] - left[1]) * Math.PI / 180;
  const deltaLng = (right[0] - left[0]) * Math.PI / 180;
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function WalkScreen() {
  const { locale } = useLocale();
  const [phase, setPhase] = useState<Phase>("choose");
  const [duration, setDuration] = useState(10);
  const [remaining, setRemaining] = useState(10 * 60);
  const [path, setPath] = useState<Coordinate[]>([]);
  const [distance, setDistance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [credentials, setCredentials] = useState<WalkShareCredentials | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const credentialsRef = useRef<WalkShareCredentials | null>(null);
  const notificationRef = useRef<string | null>(null);
  const lastCoordinateRef = useRef<Coordinate | null>(null);
  const center: Coordinate = path[path.length - 1] ?? [-74.0721, 4.711];
  const routeShape = useMemo(() => ({ type: "Feature" as const, properties: {}, geometry: { type: "LineString" as const, coordinates: path } }), [path]);
  const pulse = useQuery({
    queryKey: ["walk-pulse", Number(center[1].toFixed(3)), Number(center[0].toFixed(3))],
    queryFn: ({ signal }) => fetchPulse(center[1], center[0], signal),
    enabled: phase === "active" && path.length > 0,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
  const pulseShape = useMemo(() => ({
    type: "FeatureCollection" as const,
    features: (pulse.data?.cells ?? []).map((cell) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [cell.longitude, cell.latitude] },
      properties: { direction: cell.direction },
    })),
  }), [pulse.data]);

  useEffect(() => {
    if (phase !== "active") return;
    if (remaining <= 0) {
      void finish();
      return;
    }
    const timer = setTimeout(() => setRemaining((value) => value - 1), 1_000);
    return () => clearTimeout(timer);
  }, [phase, remaining]);

  useEffect(() => () => {
    subscriptionRef.current?.remove();
    if (credentialsRef.current) void endWalkShare(credentialsRef.current).catch(() => undefined);
  }, []);

  const start = async () => {
    setError(null);
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") {
      setError(locale === "es" ? "La Caminata Aurora necesita ubicación solo mientras está activa." : "Aurora Walk needs location only while it is active.");
      return;
    }
    setRemaining(duration * 60);
    setPhase("active");
    const notificationPermission = await Notifications.requestPermissionsAsync();
    if (notificationPermission.status === "granted") {
      notificationRef.current = await Notifications.scheduleNotificationAsync({
        content: { title: "Aurora App", body: locale === "es" ? "Tu Caminata Aurora terminó. ¿Estás bien?" : "Your Aurora Walk has ended. Are you okay?" },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: duration * 60 },
      });
    }
    subscriptionRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, timeInterval: 5_000, distanceInterval: 8 },
      (location) => {
        const next: Coordinate = [location.coords.longitude, location.coords.latitude];
        const previous = lastCoordinateRef.current;
        if (previous) setDistance((value) => value + distanceMeters(previous, next));
        lastCoordinateRef.current = next;
        setPath((value) => [...value.slice(-239), next]);
        const activeCredentials = credentialsRef.current;
        if (activeCredentials) {
          void updateWalkShare(activeCredentials, { latitude: next[1], longitude: next[0], accuracyMeters: location.coords.accuracy }).catch(() => setSharing(false));
        }
      },
    );
  };

  const shareWalk = async () => {
    try {
      const created = credentials ?? await createWalkShare(duration, locale === "es" ? "Caminata Aurora" : "Aurora Walk");
      credentialsRef.current = created;
      setCredentials(created);
      setSharing(true);
      const current = lastCoordinateRef.current;
      if (current) await updateWalkShare(created, { latitude: current[1], longitude: current[0], accuracyMeters: null });
      await Share.share({ message: `${locale === "es" ? "Acompaña temporalmente mi Caminata Aurora" : "Temporarily follow my Aurora Walk"}: ${created.viewerUrl}`, url: created.viewerUrl });
    } catch {
      setError(locale === "es" ? "No pudimos crear el enlace temporal." : "We could not create the temporary link.");
    }
  };

  const finish = async () => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    if (notificationRef.current) await Notifications.cancelScheduledNotificationAsync(notificationRef.current).catch(() => undefined);
    const activeCredentials = credentialsRef.current;
    if (activeCredentials) {
      const current = lastCoordinateRef.current;
      if (current) await updateWalkShare(activeCredentials, { latitude: current[1], longitude: current[0], accuracyMeters: null }, "arrived").catch(() => undefined);
      await endWalkShare(activeCredentials).catch(() => undefined);
      credentialsRef.current = null;
      setSharing(false);
    }
    await updateProgress((current) => ({ ...current, walksCompleted: current.walksCompleted + 1, minutesReclaimed: current.minutesReclaimed + Math.max(1, Math.round((duration * 60 - remaining) / 60)) }));
    setPhase("complete");
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (phase === "choose") return <Screen><Eyebrow>{locale === "es" ? "EL TELÉFONO COMO PUENTE" : "THE PHONE AS A BRIDGE"}</Eyebrow><Title>{locale === "es" ? "Sal de la pantalla con una intención" : "Step away from the screen with an intention"}</Title><Body>{locale === "es" ? "Aurora App usa ubicación únicamente durante esta caminata. No registra una historia permanente de rutas." : "Aurora App uses location only during this walk. It does not build a permanent route history."}</Body><View style={styles.durations}>{[5, 10, 20].map((minutes) => <Pressable key={minutes} onPress={() => setDuration(minutes)} style={[styles.duration, duration === minutes && styles.durationSelected]}><Text style={styles.durationNumber}>{minutes}</Text><Text style={styles.durationLabel}>min</Text></Pressable>)}</View><Card><View style={styles.row}><MapPin color={colors.zima} size={20} /><Text style={styles.cardTitle}>{locale === "es" ? "Contexto, no “ruta más segura”" : "Context, not “safest route”"}</Text></View><Body>{locale === "es" ? "Verás el Pulso Aurora a tu alrededor. Las Señales no garantizan seguridad y debes conservar tu propio criterio." : "You will see Aurora Pulse around you. Signals do not guarantee safety; keep using your own judgment."}</Body></Card>{error && <Text style={styles.error}>{error}</Text>}<PrimaryButton onPress={() => void start()}>{locale === "es" ? `Empezar ${duration} minutos` : `Start ${duration} minutes`}</PrimaryButton></Screen>;

  if (phase === "complete") return <Screen><View style={styles.completeMark}><Check color={colors.positive} size={34} /></View><Title>{locale === "es" ? "Volviste al mundo" : "You returned to the world"}</Title><Body>{locale === "es" ? `Caminaste ${Math.round(distance)} metros. El recorrido detallado no se conserva.` : `You walked ${Math.round(distance)} metres. The detailed route is not retained.`}</Body><PrimaryButton onPress={() => router.replace("/")}>{locale === "es" ? "Volver al inicio" : "Return home"}</PrimaryButton></Screen>;

  return (
    <Screen scroll={false} style={styles.activeScreen}>
      <View style={styles.mapWrap}><Mapbox.MapView style={styles.map} styleURL={styleUrl} logoEnabled attributionEnabled><Mapbox.Camera centerCoordinate={center} zoomLevel={15} animationDuration={700} /><Mapbox.UserLocation visible /><Mapbox.ShapeSource id="walk-pulse" shape={pulseShape}><Mapbox.CircleLayer id="walk-pulse-circles" style={{ circleRadius: 8, circleColor: ["match", ["get", "direction"], "mostly_positive", colors.positive, "more_caution", colors.caution, "mixed", colors.violetSoft, colors.zima], circleOpacity: 0.74, circleStrokeColor: colors.text, circleStrokeWidth: 1 }} /></Mapbox.ShapeSource><Mapbox.ShapeSource id="walk-route" shape={routeShape}><Mapbox.LineLayer id="walk-route-line" style={{ lineColor: colors.zima, lineWidth: 4, lineOpacity: 0.85 }} /></Mapbox.ShapeSource></Mapbox.MapView></View>
      <View style={styles.walkPanel}>
        <View style={styles.walkTop}><View><Text style={styles.timer}>{String(Math.floor(remaining / 60)).padStart(2, "0")}:{String(remaining % 60).padStart(2, "0")}</Text><Text style={styles.walkMeta}>{Math.round(distance)} m · {sharing ? (locale === "es" ? "enlace activo" : "link active") : (locale === "es" ? "ubicación no compartida" : "location not shared")}</Text></View><Footprints color={colors.positive} size={28} /></View>
        <View style={styles.walkActions}><Pressable style={styles.shareButton} onPress={() => void shareWalk()}><Share2 color={colors.zima} size={20} /><Text style={styles.shareText}>{sharing ? (locale === "es" ? "Compartir de nuevo" : "Share again") : (locale === "es" ? "Acompáñame" : "Walk With Me")}</Text></Pressable><Pressable style={styles.endButton} onPress={() => void finish()}><Square color={colors.text} size={18} /><Text style={styles.endText}>{locale === "es" ? "Terminar" : "End"}</Text></Pressable></View>
        {error && <Text style={styles.error}>{error}</Text>}
        <View style={styles.privacyLine}><Clock3 color={colors.textMuted} size={15} /><Text style={styles.privacyText}>{locale === "es" ? `Los enlaces vencen al finalizar o en ${duration} minutos.` : `Links expire when you end or after ${duration} minutes.`}</Text></View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  durations: { flexDirection: "row", gap: 10 },
  duration: { flex: 1, minHeight: 92, borderWidth: 1, borderColor: colors.border, borderRadius: radii.medium, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
  durationSelected: { borderColor: colors.zima, backgroundColor: "rgba(66,199,245,.08)" },
  durationNumber: { fontSize: 30, fontWeight: "800", color: colors.text },
  durationLabel: { color: colors.textMuted, fontSize: 11 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { ...typography.heading, color: colors.text },
  error: { color: colors.danger, fontSize: 12 },
  completeMark: { width: 68, height: 68, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(101,222,180,.1)" },
  activeScreen: { padding: 0, gap: 0 },
  mapWrap: { flex: 1, backgroundColor: colors.night },
  map: { flex: 1 },
  walkPanel: { padding: spacing.md, paddingBottom: 30, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.night, gap: 14 },
  walkTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  timer: { fontSize: 38, fontWeight: "300", letterSpacing: -1, color: colors.text },
  walkMeta: { color: colors.textMuted, fontSize: 11 },
  walkActions: { flexDirection: "row", gap: 10 },
  shareButton: { flex: 1, minHeight: 52, borderWidth: 1, borderColor: colors.zima, borderRadius: radii.medium, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "rgba(66,199,245,.08)" },
  shareText: { color: colors.text, fontWeight: "700", fontSize: 12 },
  endButton: { minWidth: 108, minHeight: 52, borderRadius: radii.medium, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: colors.violet },
  endText: { color: colors.text, fontWeight: "800" },
  privacyLine: { flexDirection: "row", alignItems: "center", gap: 7 },
  privacyText: { color: colors.textMuted, fontSize: 10 },
});
