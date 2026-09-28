import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Mapbox from "@rnmapbox/maps";
import { LocaleProvider } from "../src/locale";
import { configureOneSignal, restoreOptedInIntegrations } from "../src/integrations";
import { colors } from "../src/theme";

const mapToken =
  process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN ??
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ??
  "";
if (mapToken) {
  Mapbox.setAccessToken(mapToken);
}

const client = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false } },
});

export default function RootLayout() {
  useEffect(() => {
    try {
      Mapbox.setTelemetryEnabled(false);
    } catch {}
    try {
      configureOneSignal();
    } catch {}
    void restoreOptedInIntegrations();
  }, []);
  return (
    <QueryClientProvider client={client}>
      <LocaleProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{
          headerStyle: { backgroundColor: colors.ink },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.ink },
          animation: "slide_from_right",
        }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="reset" options={{ title: "Reset" }} />
          <Stack.Screen name="map" options={{ title: "Around me" }} />
          <Stack.Screen name="signal" options={{ title: "Share a Signal", presentation: "modal" }} />
          <Stack.Screen name="walk" options={{ title: "Aurora Walk" }} />
          <Stack.Screen name="settings" options={{ title: "Privacy & settings" }} />
          <Stack.Screen name="paywall" options={{ headerShown: false, presentation: "modal" }} />
        </Stack>
      </LocaleProvider>
    </QueryClientProvider>
  );
}
