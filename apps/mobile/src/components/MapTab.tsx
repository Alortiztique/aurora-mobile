import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView, type WebViewNavigation } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { ArrowLeft, ExternalLink, Globe, RefreshCw } from "lucide-react-native";
import { useLocale } from "../locale";
import { colors, radii, spacing, typography } from "../theme";

const WEB_URL = "https://miaurora.app/";
const WebViewer = WebView as unknown as React.ComponentType<any>;

export function MapTab() {
  const insets = useSafeAreaInsets();
  const { locale } = useLocale();
  const webViewRef = useRef<any>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Handle hardware back press on Android to navigate inside WebView history
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [canGoBack]);

  const handleNavStateChange = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
  }, []);

  const handleReload = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  const handleGoBack = () => {
    void Haptics.selectionAsync();
    webViewRef.current?.goBack();
  };

  const handleOpenExternal = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Linking.openURL(`${WEB_URL}?lang=${locale}`);
    } catch {
      // Ignore open error
    }
  };

  return (
    <View style={styles.root}>
      {/* Top Native Toolbar (Dark Paper Brutalism) */}
      <View style={[styles.toolbar, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        <View style={styles.toolbarLeft}>
          {canGoBack && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Volver"
              style={styles.toolBtn}
              onPress={handleGoBack}
            >
              <ArrowLeft color={colors.text} size={18} />
            </Pressable>
          )}
          <View style={styles.titleWrap}>
            <View style={styles.titleRow}>
              <View style={styles.liveIndicatorDot} />
              <Text style={styles.titleText}>
                {locale === "es" ? "MAPA VIVO" : "LIVE MAP"}
              </Text>
            </View>
            <Text style={styles.domainText}>miaurora.app</Text>
          </View>
        </View>

        <View style={styles.toolbarRight}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={locale === "es" ? "Recargar mapa" : "Reload map"}
            style={styles.toolBtn}
            onPress={handleReload}
          >
            <RefreshCw
              color={isLoading ? colors.zima : colors.textMuted}
              size={18}
            />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={locale === "es" ? "Abrir en navegador" : "Open in browser"}
            style={styles.toolBtn}
            onPress={handleOpenExternal}
          >
            <ExternalLink color={colors.textMuted} size={18} />
          </Pressable>
        </View>
      </View>

      {/* Embedded Web Map (https://miaurora.app/) */}
      <View style={[styles.webContainer, { paddingBottom: 68 + (insets.bottom || 8) }]}>
        <WebViewer
          ref={webViewRef}
          source={{ uri: `${WEB_URL}?lang=${locale}` }}
          style={styles.webView}
          onNavigationStateChange={handleNavStateChange}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          geolocationEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          pullToRefreshEnabled={true}
          startInLoadingState={false}
          injectedJavaScript={`try { localStorage.setItem('aurora.locale', '${locale}'); } catch (e) {} true;`}
          applicationNameForUserAgent="AuroraAppMobile/1.0"
        />

        {/* Subtle top progress / loader */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.zima} size="small" />
            <Text style={styles.loadingText}>
              {locale === "es" ? "Conectando con el mapa vivo..." : "Connecting to live map..."}
            </Text>
          </View>
        )}

        {/* Offline / Error Fallback */}
        {hasError && (
          <View style={styles.errorOverlay}>
            <Globe color={colors.zima} size={36} />
            <Text style={styles.errorTitle}>
              {locale === "es" ? "No se pudo cargar el mapa" : "Unable to load live map"}
            </Text>
            <Text style={styles.errorDesc}>
              {locale === "es"
                ? "Verifica tu conexión a internet para sincronizar las señales ciudadanas de miaurora.app."
                : "Check your internet connection to sync live community signals from miaurora.app."}
            </Text>
            <Pressable
              style={styles.retryBtn}
              onPress={handleReload}
            >
              <RefreshCw color="#0C0C0E" size={16} />
              <Text style={styles.retryBtnText}>
                {locale === "es" ? "Reintentar Conexión" : "Retry Connection"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  toolbar: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  toolbarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  toolBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.small,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: {
    gap: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  liveIndicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.zima,
  },
  titleText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  domainText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "500",
  },
  toolbarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  webContainer: {
    flex: 1,
    backgroundColor: colors.ink,
    position: "relative",
  },
  webView: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  loadingOverlay: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(22, 22, 26, 0.92)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 20,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  errorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
    zIndex: 30,
  },
  errorTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 4,
  },
  errorDesc: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.zima,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radii.medium,
  },
  retryBtnText: {
    color: "#0C0C0E",
    fontSize: 13,
    fontWeight: "800",
  },
});
