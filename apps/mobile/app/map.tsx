import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import * as Location from "expo-location";
import Mapbox from "@rnmapbox/maps";
import { useQuery } from "@tanstack/react-query";
import { Info, Plus, TriangleAlert } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { fetchPulse } from "../src/api";
import { Body, Card, Screen } from "../src/components/ui";
import { useLocale } from "../src/locale";
import { colors, radii, spacing, typography } from "../src/theme";

const styleUrl = process.env.EXPO_PUBLIC_MAPBOX_STYLE_URL ?? "mapbox://styles/malunao/cm84u5ecf000x01qled5j8bvl";

export default function AroundMeScreen() {
  const { locale } = useLocale();
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let active = true;
    void Location.requestForegroundPermissionsAsync().then(async (permission) => {
      if (!active) return;
      if (permission.status !== "granted") {
        setDenied(true);
        setCoordinates([-74.0721, 4.711]);
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (active) setCoordinates([location.coords.longitude, location.coords.latitude]);
    });
    return () => { active = false; };
  }, []);

  const query = useQuery({
    queryKey: ["mobile-pulse", coordinates],
    queryFn: ({ signal }) => fetchPulse(coordinates![1], coordinates![0], signal),
    enabled: coordinates !== null,
  });
  const shape = useMemo(() => ({
    type: "FeatureCollection" as const,
    features: (query.data?.cells ?? []).map((cell) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [cell.longitude, cell.latitude] },
      properties: { direction: cell.direction, count: cell.signalCount },
    })),
  }), [query.data]);

  return (
    <Screen scroll={false} style={styles.screen}>
      <View style={styles.mapWrap}>
        {coordinates && <Mapbox.MapView style={styles.map} styleURL={styleUrl} logoEnabled attributionEnabled><Mapbox.Camera defaultSettings={{ centerCoordinate: coordinates, zoomLevel: 13 }} /><Mapbox.UserLocation visible={!denied} /><Mapbox.ShapeSource id="mobile-pulse" shape={shape}><Mapbox.CircleLayer id="mobile-pulse-glow" style={{ circleRadius: ["interpolate", ["linear"], ["zoom"], 5, 8, 16, 24], circleColor: ["match", ["get", "direction"], "mostly_positive", colors.positive, "more_caution", colors.caution, "mixed", colors.violetSoft, colors.zima], circleOpacity: 0.72, circleStrokeColor: colors.text, circleStrokeWidth: 1 }} /></Mapbox.ShapeSource></Mapbox.MapView>}
        {!coordinates && <View style={styles.center}><Body>{locale === "es" ? "Buscando tu contexto…" : "Finding your context…"}</Body></View>}
      </View>
      <Card style={styles.sheet}>
        <View style={styles.sheetTitle}><View style={styles.live} /><Text style={styles.title}>{locale === "es" ? "Pulso Aurora · todo el historial" : "Aurora Pulse · all available"}</Text></View>
        {denied && <View style={styles.info}><Info color={colors.zima} size={18} /><Body>{locale === "es" ? "La ubicación fue denegada. Puedes explorar Bogotá y cambiar el permiso cuando quieras." : "Location was denied. You can explore Bogotá and change permission whenever you choose."}</Body></View>}
        {query.isError ? <View style={styles.info}><TriangleAlert color={colors.caution} size={18} /><Body>{locale === "es" ? "No pudimos actualizar las Señales." : "We could not refresh Signals."}</Body></View> : <Body>{(query.data?.cells.length ?? 0) === 0 ? (locale === "es" ? "Todavía no hay marcaciones disponibles aquí." : "There are no available markings here yet.") : `${query.data?.cells.length ?? 0} ${locale === "es" ? "zonas con contexto disponible" : "areas with available context"}`}</Body>}
        <Pressable style={styles.signalButton} onPress={() => router.push("/signal")} accessibilityRole="button"><Plus color={colors.text} size={22} /><Text style={styles.signalText}>{locale === "es" ? "Compartir una Señal" : "Share a Signal"}</Text></Pressable>
        <Text style={styles.disclaimer}>{locale === "es" ? "Las Señales no garantizan que un lugar sea seguro o inseguro." : "Signals do not guarantee that a place is safe or unsafe."}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0, gap: 0 },
  mapWrap: { flex: 1, minHeight: 360, backgroundColor: colors.night },
  map: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  sheet: { margin: spacing.md, marginTop: -42, zIndex: 3, borderRadius: radii.large },
  sheetTitle: { flexDirection: "row", alignItems: "center", gap: 8 },
  live: { width: 8, height: 8, borderRadius: 8, backgroundColor: colors.zima },
  title: { ...typography.heading, color: colors.text },
  info: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  signalButton: { minHeight: 52, borderRadius: radii.medium, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.violet },
  signalText: { color: colors.text, fontWeight: "800" },
  disclaimer: { color: colors.textMuted, fontSize: 10, lineHeight: 14 },
});
