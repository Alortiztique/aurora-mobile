import { useState } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ArrowLeft, ExternalLink, Heart, Lock, Shield, Sparkles } from "lucide-react-native";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, Eyebrow } from "../src/components/ui";
import { useLocale } from "../src/locale";
import { colors, radii, spacing, typography } from "../src/theme";

export default function TermsAndPrivacyScreen() {
  const insets = useSafeAreaInsets();
  const { locale } = useLocale();
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");

  return (
    <View style={[styles.root, { paddingTop: insets.top || 16 }]}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={locale === "es" ? "Volver" : "Back"}
          style={styles.backButton}
          onPress={() => {
            void Haptics.selectionAsync();
            router.back();
          }}
        >
          <ArrowLeft color={colors.text} size={22} />
        </Pressable>

        <View style={styles.topTitles}>
          <Eyebrow>AURORA APP · TRANSPARENCIA LEGAL</Eyebrow>
          <Text style={styles.topHeaderTitle}>
            {locale === "es" ? "Términos y Privacidad" : "Terms & Privacy"}
          </Text>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelectorRow}>
        <Pressable
          accessibilityRole="tab"
          style={[styles.tabButton, activeTab === "terms" && styles.tabButtonActive]}
          onPress={() => {
            void Haptics.selectionAsync();
            setActiveTab("terms");
          }}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "terms" && styles.tabButtonTextActive,
            ]}
          >
            {locale === "es" ? "Términos de Servicio" : "Terms of Service"}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          style={[styles.tabButton, activeTab === "privacy" && styles.tabButtonActive]}
          onPress={() => {
            void Haptics.selectionAsync();
            setActiveTab("privacy");
          }}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "privacy" && styles.tabButtonTextActive,
            ]}
          >
            {locale === "es" ? "Política de Privacidad" : "Privacy Policy"}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: (insets.bottom || 16) + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "terms" ? (
          <View style={styles.documentBody}>
            {/* Social Enterprise Banner */}
            <Card style={styles.highlightCard}>
              <View style={styles.highlightHeader}>
                <Heart color={colors.auroraPink} size={18} />
                <Text style={styles.highlightTitle}>
                  {locale === "es"
                    ? "Modelo Social de Acceso Libre (Filosofía WinRAR)"
                    : "Social Commons Model (Voluntary Support)"}
                </Text>
              </View>
              <Text style={styles.highlightText}>
                {locale === "es"
                  ? "En Aurora App creemos que la recuperación de la atención y la dignidad humana no deben tener precio. Todas las funciones esenciales (bloqueo on-device, contador de racha, mapa comunitario, respiración somática) son y serán siempre 100% gratuitas. Las membresías pagas son donaciones y apoyos voluntarios para mantener servidores y desarrollo independiente."
                  : "At Aurora App, we believe reclaiming your attention and dignity must never be locked behind a mandatory paywall. All essential sovereignty tools remain 100% free forever. Memberships are voluntary patronages to keep infrastructure and development independent and ad-free."}
              </Text>
            </Card>

            <Text style={styles.sectionTitle}>
              {locale === "es" ? "1. Aceptación y Propósito" : "1. Acceptance & Purpose"}
            </Text>
            <Text style={styles.paragraph}>
              {locale === "es"
                ? "Al descargar, instalar o utilizar Aurora App, aceptas estos Términos de Servicio. Aurora App es una herramienta de agencia humana diseñada para ayudarte a romper hábitos perjudiciales (consumo compulsivo de pornografía, doomscrolling en redes sociales y antojos impulsivos de comida). Aurora App no garantiza resultados mágicos, sino que provee fricción consciente y soporte somático."
                : "By downloading, installing, or using Aurora App, you agree to these Terms. Aurora App is a human agency companion built to help you interrupt compulsive habits (pornography, doomscrolling, and impulsive delivery cravings). It provides deliberate friction and somatic support to restore self-command."}
            </Text>

            <Text style={styles.sectionTitle}>
              {locale === "es" ? "2. Deslinde Médico y de Emergencias" : "2. Non-Medical Disclaimer"}
            </Text>
            <Text style={styles.paragraph}>
              {locale === "es"
                ? "Aurora App NO es un proveedor de atención médica, terapeuta, psiquiatra ni servicio de emergencias. Ningún contenido, ejercicio o bloqueo debe interpretarse como diagnóstico o prescripción clínica. Si estás experimentando una crisis severa de salud mental o emocional, acude de inmediato a los servicios de salud o líneas de emergencia de tu localidad."
                : "Aurora App is NOT a healthcare provider, therapist, or emergency dispatcher. None of the content or tools constitute clinical diagnosis or therapy. If you are experiencing an acute mental health crisis, please contact local emergency or crisis support services immediately."}
            </Text>

            <Text style={styles.sectionTitle}>
              {locale === "es" ? "3. Uso del Servicio de Accesibilidad" : "3. Accessibility Service Usage"}
            </Text>
            <Text style={styles.paragraph}>
              {locale === "es"
                ? "Aurora App utiliza la API AccessibilityService de Android únicamente con tu autorización explícita para inspeccionar de manera local e instantánea las URLs y nombres de paquetes en pantalla. Su única finalidad es detectar sitios y aplicaciones que tú mismo configuraste para bloqueo. Esta inspección es 100% on-device; nada se graba, almacena ni envía a internet."
                : "Aurora App uses Android's AccessibilityService API solely with your explicit consent to inspect active URLs and app package names locally on-device. Its sole purpose is to intercept pornography, doomscrolling feeds, or delivery apps you choose to block. Nothing is ever transmitted off the device."}
            </Text>

            <Text style={styles.sectionTitle}>
              {locale === "es" ? "4. Membresías y Pagos (Google Play & Galaxy Store)" : "4. Memberships & Billing"}
            </Text>
            <Text style={styles.paragraph}>
              {locale === "es"
                ? "Las contribuciones voluntarias (Guardian y Pioneer) se procesan de forma transparente a través de los sistemas oficiales de Google Play Billing y Samsung Galaxy Store mediante RevenueCat. Puedes cancelar en cualquier momento sin penalizaciones desde los ajustes de suscripciones de tu tienda."
                : "Voluntary contributions (Guardian and Pioneer) are processed securely through Google Play Billing and Samsung Galaxy Store via RevenueCat. You can cancel at any time directly through your store subscription settings."}
            </Text>

            <Text style={styles.sectionTitle}>
              {locale === "es" ? "5. Propiedad Intelectual" : "5. Intellectual Property"}
            </Text>
            <Text style={styles.paragraph}>
              {locale === "es"
                ? "Aurora App, sus algoritmos de intervención y diseño gráfico son propiedad exclusiva de sus creadores. La transparencia pública para auditoría comunitaria no confiere licencias para explotación comercial por parte de terceros ni para la creación de derivados lucrativos no autorizados."
                : "Aurora App, its intervention patterns, and visual design are proprietary. Public transparency for community auditing does not grant licenses for unauthorized commercial exploitation or third-party forks."}
            </Text>
          </View>
        ) : (
          <View style={styles.documentBody}>
            {/* Privacy Card */}
            <Card style={styles.highlightCard}>
              <View style={styles.highlightHeader}>
                <Lock color={colors.positive} size={18} />
                <Text style={styles.highlightTitle}>
                  {locale === "es"
                    ? "Privacidad Radical On-Device"
                    : "Radical On-Device Privacy"}
                </Text>
              </View>
              <Text style={styles.highlightText}>
                {locale === "es"
                  ? "Tus impulsos, búsquedas, compromisos personales y notas de sobriedad nunca abandonan tu teléfono. No vendemos datos a anunciantes, no rastreamos tu ubicación en segundo plano y no creamos perfiles comerciales sobre ti."
                  : "Your cravings, searches, personal commitments, and sobriety notes never leave your device. We do not sell data to advertisers, never track background location, and never build commercial user profiles."}
              </Text>
            </Card>

            <Text style={styles.sectionTitle}>
              {locale === "es" ? "1. Divulgación de Accesibilidad (Requisito de Tienda)" : "1. Accessibility API Disclosure"}
            </Text>
            <Text style={styles.paragraph}>
              {locale === "es"
                ? "En estricto cumplimiento de las políticas de Google Play Store y Samsung Galaxy Store, declaramos que el permiso AccessibilityService se utiliza exclusivamente para: (a) Leer el texto de la barra de direcciones de navegadores para detectar páginas explícitas para adultos, y (b) Detectar si se abre una aplicación bloqueada para cerrar la ventana y abrir la pantalla de intervención SOS. No se recopilan pulsaciones de teclado, mensajes privados, cuentas bancarias ni contraseñas."
                : "In strict compliance with Google Play and Samsung Store policies: AccessibilityService is used exclusively to: (a) Read browser address bars to identify adult websites, and (b) Detect when a blocked app is brought to foreground to redirect you to the SOS breathing screen. Keystrokes, private chats, bank info, and passwords are never read or collected."}
            </Text>

            <Text style={styles.sectionTitle}>
              {locale === "es" ? "2. Almacenamiento Seguro Local" : "2. Secure Local Storage"}
            </Text>
            <Text style={styles.paragraph}>
              {locale === "es"
                ? "Tus estadísticas de racha, compromiso personal redactado y publicaciones comunitarias anónimas se almacenan en el SecureStore encriptado de tu dispositivo. Puedes borrar todos los datos locales en cualquier momento desde la pestaña de Ajustes."
                : "Your streak statistics, personal commitment statement, and anonymous posts are stored in encrypted SecureStore on your device. You can purge all local data anytime from Settings."}
            </Text>

            <Text style={styles.sectionTitle}>
              {locale === "es" ? "3. Ubicación y Mapa Vivo" : "3. Location & Live Map"}
            </Text>
            <Text style={styles.paragraph}>
              {locale === "es"
                ? "La ubicación GPS solo se solicita en primer plano para centrar el Mapa Vivo comunitario de miaurora.app y permitirte descubrir lugares seguros para salir a caminar. Las coordenadas públicas son cuantizadas y difuminadas para garantizar total anonimato."
                : "GPS location is only requested in foreground while using the Live Map to help you find safe outdoor walking zones. Community coordinates are privacy-quantized to prevent identifying specific residences or buildings."}
            </Text>

            <Text style={styles.sectionTitle}>
              {locale === "es" ? "4. Contacto de Privacidad" : "4. Privacy Contact"}
            </Text>
            <Text style={styles.paragraph}>
              {locale === "es"
                ? "Para cualquier consulta, auditoría de privacidad o solicitud de eliminación de cuenta, contáctanos en hello@miaurora.app o visita https://miaurora.app/privacy."
                : "For privacy questions, audits, or data purge requests, contact us at hello@miaurora.app or visit https://miaurora.app/privacy."}
            </Text>
          </View>
        )}

        {/* Web link button */}
        <Pressable
          style={styles.webLinkBtn}
          onPress={() => void Linking.openURL("https://miaurora.app/privacy")}
        >
          <Text style={styles.webLinkBtnText}>
            {locale === "es" ? "Ver documento en la web oficial (miaurora.app)" : "View document on official web (miaurora.app)"}
          </Text>
          <ExternalLink color={colors.auroraBlue} size={16} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    borderRadius: radii.small,
    backgroundColor: colors.surfaceRaised,
  },
  topTitles: {
    flex: 1,
  },
  topHeaderTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 1,
  },
  tabSelectorRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: colors.night,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  tabButtonActive: {
    borderColor: colors.auroraBlue,
    backgroundColor: "rgba(117, 132, 193, 0.16)",
  },
  tabButtonText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  tabButtonTextActive: {
    color: colors.auroraBlue,
    fontWeight: "900",
  },
  scrollContent: {
    padding: spacing.md,
    gap: 16,
    maxWidth: 680,
    width: "100%",
    alignSelf: "center",
  },
  documentBody: {
    gap: 14,
  },
  highlightCard: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
  },
  highlightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  highlightTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  highlightText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  sectionTitle: {
    color: colors.auroraBlueLight,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 8,
  },
  paragraph: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
  },
  webLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  webLinkBtnText: {
    color: colors.auroraBlue,
    fontSize: 13,
    fontWeight: "700",
  },
});
