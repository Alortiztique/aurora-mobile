import { NativeModules, Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export interface Progress {
  readonly onboarded: boolean;
  readonly onboardedAt?: number;
  readonly streakStartedAt?: number;
  readonly resetsCompleted: number;
  readonly walksCompleted: number;
  readonly intentionalExits: number;
  readonly minutesReclaimed: number;
  readonly lastSupportPromptAt: number | null;
  readonly neverShowSupport: boolean;
  readonly cleanStreakDays: number;
  readonly urgesDefeated: number;
  readonly pledgesCount: number;
  readonly lastPledgeDate: string | null;
  readonly shieldEnabled: boolean;
  readonly signalsShared: number;
  readonly lockdownMode: boolean;
  readonly personalCommitment: string;
  readonly blockedPornEnabled: boolean;
  readonly blockedDoomscrollEnabled: boolean;
  readonly blockedCravingsEnabled: boolean;
  readonly relapsesCount: number;
  readonly totalBlocksCount: number;
  readonly weeklyHistory: readonly number[];
  readonly membershipTier: "free" | "guardian" | "pioneer";
  readonly membershipExpiresAt: number | null;
  readonly judgeUnlocked: boolean;
  readonly userAccount: {
    readonly id: string;
    readonly email: string;
    readonly displayName: string | null;
    readonly provider: "google" | "anonymous";
    readonly linkedAt: number;
  } | null;
  readonly customBlockedSites?: readonly string[];
}

const key = "aurora.progress.v1";
const empty: Progress = {
  onboarded: false,
  resetsCompleted: 0,
  walksCompleted: 0,
  intentionalExits: 0,
  minutesReclaimed: 0,
  lastSupportPromptAt: null,
  neverShowSupport: false,
  cleanStreakDays: 0,
  urgesDefeated: 0,
  pledgesCount: 0,
  lastPledgeDate: null,
  shieldEnabled: true,
  signalsShared: 0,
  lockdownMode: false,
  personalCommitment: "",
  blockedPornEnabled: true,
  blockedDoomscrollEnabled: true,
  blockedCravingsEnabled: true,
  customBlockedSites: [],
  relapsesCount: 0,
  totalBlocksCount: 0,
  weeklyHistory: [0, 0, 0, 0, 0, 0, 0],
  membershipTier: "free",
  membershipExpiresAt: null,
  judgeUnlocked: false,
  userAccount: null,
};

export function calculateStreakDays(progress: Progress): number {
  if (!progress.onboarded) return 0;
  const start = progress.streakStartedAt || progress.onboardedAt || Date.now();
  const diffMs = Math.max(0, Date.now() - start);
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  return Math.max(1, days + 1);
}

export function calculateReclaimedHours(progress: Progress): number {
  const streak = calculateStreakDays(progress);
  const baseHours = streak * 2;
  const blocksBonus = Math.round(((progress.totalBlocksCount || 0) * 15 + (progress.urgesDefeated || 0) * 20) / 60);
  return Math.max(baseHours + blocksBonus, progress.minutesReclaimed ? Math.round(progress.minutesReclaimed / 60) : 0);
}

export function getWeeklyHistory(progress: Progress): number[] {
  const streak = calculateStreakDays(progress);
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const history = [0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i <= 6; i++) {
    const daysAgo = dayOfWeek - i;
    if (daysAgo >= 0 && streak > daysAgo) {
      history[i] = 1;
    } else if (daysAgo < 0 && streak >= 7 + daysAgo) {
      history[i] = 1;
    }
  }
  return history;
}

export function syncNativeShieldSettings(progress: Progress): void {
  if (Platform.OS === "android" && NativeModules.AuroraShieldNative) {
    try {
      const customJoined = (progress.customBlockedSites || []).join(",");
      if (NativeModules.AuroraShieldNative.updateShieldSettingsWithCustom) {
        NativeModules.AuroraShieldNative.updateShieldSettingsWithCustom(
          Boolean(progress.shieldEnabled && progress.blockedPornEnabled),
          Boolean(progress.shieldEnabled && progress.blockedDoomscrollEnabled),
          Boolean(progress.shieldEnabled && progress.blockedCravingsEnabled),
          progress.shieldEnabled ? customJoined : ""
        );
      } else if (NativeModules.AuroraShieldNative.updateShieldSettings) {
        NativeModules.AuroraShieldNative.updateShieldSettings(
          Boolean(progress.shieldEnabled && progress.blockedPornEnabled),
          Boolean(progress.shieldEnabled && progress.blockedDoomscrollEnabled),
          Boolean(progress.shieldEnabled && progress.blockedCravingsEnabled)
        );
      }
    } catch {
      // native module unavailable or running in web
    }
  }
}

export async function getProgress(): Promise<Progress> {
  const stored = await SecureStore.getItemAsync(key);
  let current: Progress;
  if (!stored) {
    current = { ...empty };
  } else {
    try {
      const parsed: unknown = JSON.parse(stored);
      current = (!parsed || typeof parsed !== "object")
        ? { ...empty }
        : { ...empty, ...(parsed as Partial<Progress>) };
    } catch {
      current = { ...empty };
    }
  }

  if (current.onboarded) {
    let changed = false;
    const now = Date.now();
    if (!current.onboardedAt) {
      current = { ...current, onboardedAt: now - 2 * 86400000 };
      changed = true;
    }
    if (!current.streakStartedAt) {
      current = { ...current, streakStartedAt: current.onboardedAt || now - 2 * 86400000 };
      changed = true;
    }

    if (Platform.OS === "android" && NativeModules.AuroraShieldNative?.getBlockStats) {
      try {
        const nativeBlocks: number = await NativeModules.AuroraShieldNative.getBlockStats();
        if (typeof nativeBlocks === "number" && nativeBlocks > current.totalBlocksCount) {
          current = { ...current, totalBlocksCount: nativeBlocks };
          changed = true;
        }
      } catch {}
    }

    const dynamicStreak = calculateStreakDays(current);
    if (dynamicStreak !== current.cleanStreakDays) {
      current = { ...current, cleanStreakDays: dynamicStreak };
      changed = true;
    }

    if (changed) {
      await SecureStore.setItemAsync(key, JSON.stringify(current));
    }
  }

  syncNativeShieldSettings(current);
  return current;
}

export async function recordUrgeDefeated(): Promise<Progress> {
  return updateProgress((curr) => {
    const nextUrges = (curr.urgesDefeated || 0) + 1;
    const nextBlocks = Math.max(curr.totalBlocksCount || 0, nextUrges);
    return {
      ...curr,
      urgesDefeated: nextUrges,
      totalBlocksCount: nextBlocks,
      minutesReclaimed: (curr.minutesReclaimed || 0) + 20,
    };
  });
}

export async function updateProgress(update: (current: Progress) => Progress): Promise<Progress> {
  const next = update(await getProgress());
  await SecureStore.setItemAsync(key, JSON.stringify(next));
  syncNativeShieldSettings(next);
  return next;
}

export async function clearProgress(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(key),
    SecureStore.deleteItemAsync("aurora.locale"),
  ]);
}

export function isGuardian(progress: Progress | null): boolean {
  if (!progress) return false;
  if (progress.membershipTier === "guardian" || progress.membershipTier === "pioneer") {
    if (progress.membershipExpiresAt && Date.now() > progress.membershipExpiresAt) {
      return false;
    }
    return true;
  }
  return false;
}

export function isPioneer(progress: Progress | null): boolean {
  if (!progress) return false;
  return progress.membershipTier === "pioneer";
}

export async function unlockMembershipTier(
  tier: "guardian" | "pioneer",
  isJudge = false
): Promise<Progress> {
  return updateProgress((curr) => ({
    ...curr,
    membershipTier: tier,
    judgeUnlocked: isJudge || curr.judgeUnlocked,
    membershipExpiresAt: tier === "pioneer" ? null : Date.now() + 365 * 24 * 60 * 60 * 1000,
  }));
}
