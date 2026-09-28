/// <reference types="expo/types" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly EXPO_PUBLIC_API_URL?: string;
    readonly EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN?: string;
    readonly EXPO_PUBLIC_MAPBOX_STYLE_URL?: string;
    readonly EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?: string;
    readonly EXPO_PUBLIC_ONESIGNAL_APP_ID?: string;
    readonly MAPBOX_DOWNLOADS_TOKEN?: string;
  }
}
