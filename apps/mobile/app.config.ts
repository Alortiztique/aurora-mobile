import * as fs from "node:fs";
import * as path from "node:path";
import type { ExpoConfig, ConfigContext } from "expo/config";
import {
  withAndroidManifest,
  withDangerousMod,
  withStringsXml,
  type ConfigPlugin,
} from "@expo/config-plugins";

const config: ExpoConfig = {
  name: "Aurora App",
  slug: "aurora-app",
  version: "1.0.0",
  orientation: "default",
  icon: "./assets/icon.png",
  scheme: "auroraapp",
  userInterfaceStyle: "dark",
  backgroundColor: "#08070C",
  android: {
    package: "app.miaurora",
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#08070C",
    },
    permissions: [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION",
      "POST_NOTIFICATIONS",
      "CAMERA",
    ],
    blockedPermissions: [
      "android.permission.ACCESS_BACKGROUND_LOCATION",
      "android.permission.RECORD_AUDIO",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.SYSTEM_ALERT_WINDOW",
    ],
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-notifications",
    [
      "expo-splash-screen",
      {
        image: "./assets/icon.png",
        imageWidth: 180,
        resizeMode: "contain",
        backgroundColor: "#08070C",
      },
    ],
    [
      "@rnmapbox/maps",
      {
        RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOADS_TOKEN ?? "",
      },
    ],
    [
      "onesignal-expo-plugin",
      {
        mode: "production",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: "REPLACE_WITH_EAS_PROJECT_ID",
    },
  },
};

const withSamsungFoldableSupport: ConfigPlugin = (baseConfig) => {
  return withAndroidManifest(baseConfig, (modConfig) => {
    const app = modConfig.modResults.manifest.application?.[0];
    if (app) {
      const activities = app.activity ?? [];
      const mainActivity = activities.find(
        (a) => a.$?.["android:name"] === ".MainActivity"
      );
      if (mainActivity) {
        mainActivity.$["android:resizeableActivity"] = "true";
      }
      app["meta-data"] = (app["meta-data"] ?? []).filter(
        (m) =>
          m.$?.["android:name"] !== "com.samsung.android.keepalive.density" &&
          m.$?.["android:name"] !== "android.max_aspect"
      );
      app["meta-data"].push({
        $: {
          "android:name": "com.samsung.android.keepalive.density",
          "android:value": "true",
        },
      });
      app["meta-data"].push({
        $: {
          "android:name": "android.max_aspect",
          "android:value": "2.5",
        },
      });

      // Register Aurora Shield Accessibility Service for adult domain blocking
      const services = (app.service = app.service || []);
      const hasAccessibility = services.some(
        (s) => s.$?.["android:name"] === ".AuroraShieldAccessibilityService"
      );
      if (!hasAccessibility) {
        // ManifestService XML schema requires nested meta-data for accessibility service config
        const customService: Record<string, unknown> = {
          $: {
            "android:name": ".AuroraShieldAccessibilityService",
            "android:permission": "android.permission.BIND_ACCESSIBILITY_SERVICE",
            "android:exported": "true",
          },
          "intent-filter": [
            {
              action: [
                {
                  $: {
                    "android:name": "android.accessibilityservice.AccessibilityService",
                  },
                },
              ],
            },
          ],
          "meta-data": [
            {
              $: {
                "android:name": "android.accessibilityservice",
                "android:resource": "@xml/aurora_accessibility_service",
              },
            },
          ],
        };
        (services as Array<Record<string, unknown>>).push(customService);
      }
    }
    return modConfig;
  });
};

const withAuroraShieldStrings: ConfigPlugin = (baseConfig) => {
  return withStringsXml(baseConfig, (modConfig) => {
    const strings = modConfig.modResults.resources.string || [];
    if (!strings.some((s) => s.$.name === "aurora_accessibility_service_description")) {
      strings.push({
        $: { name: "aurora_accessibility_service_description" },
        _: "Protección on-device de Aurora App frente a contenidos explícitos y pornografía.",
      });
    }
    modConfig.modResults.resources.string = strings;
    return modConfig;
  });
};

const withAuroraShieldNativeFiles: ConfigPlugin = (baseConfig) => {
  return withDangerousMod(baseConfig, [
    "android",
    async (modConfig) => {
      const projectRoot = modConfig.modRequest.projectRoot;
      const androidRoot = modConfig.modRequest.platformProjectRoot;

      // 1. Copy Kotlin service file to app/src/main/java/app/miaurora/
      const kotlinTargetDir = path.join(
        androidRoot,
        "app",
        "src",
        "main",
        "java",
        "app",
        "miaurora"
      );
      fs.mkdirSync(kotlinTargetDir, { recursive: true });
      for (const file of [
        "AuroraShieldAccessibilityService.kt",
        "AuroraShieldModule.kt",
        "AuroraShieldPackage.kt",
      ]) {
        const src = path.join(projectRoot, "native-templates", file);
        const dest = path.join(kotlinTargetDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      }

      // 1b. Register AuroraShieldPackage in MainApplication.kt
      const mainAppPath = path.join(kotlinTargetDir, "MainApplication.kt");
      if (fs.existsSync(mainAppPath)) {
        let content = fs.readFileSync(mainAppPath, "utf8");
        if (!content.includes("AuroraShieldPackage()")) {
          content = content.replace(
            "// add(MyReactNativePackage())",
            "add(AuroraShieldPackage())"
          );
          fs.writeFileSync(mainAppPath, content, "utf8");
        }
      }

      // 2. Copy XML config to app/src/main/res/xml/
      const xmlTargetDir = path.join(androidRoot, "app", "src", "main", "res", "xml");
      fs.mkdirSync(xmlTargetDir, { recursive: true });
      const xmlSrc = path.join(
        projectRoot,
        "native-templates",
        "aurora_accessibility_service.xml"
      );
      const xmlDest = path.join(xmlTargetDir, "aurora_accessibility_service.xml");
      if (fs.existsSync(xmlSrc)) {
        fs.copyFileSync(xmlSrc, xmlDest);
      }

      // 3. Ensure local.properties has sdk.dir
      const localPropsPath = path.join(androidRoot, "local.properties");
      if (!fs.existsSync(localPropsPath)) {
        const defaultSdk = "C:\\\\Users\\\\aleja\\\\AppData\\\\Local\\\\Android\\\\Sdk";
        fs.writeFileSync(localPropsPath, `sdk.dir=${defaultSdk}\n`);
      }

      return modConfig;
    },
  ]);
};

export default ({ config: _contextConfig }: ConfigContext): ExpoConfig => {
  return withAuroraShieldNativeFiles(
    withAuroraShieldStrings(withSamsungFoldableSupport(config))
  );
};
