import Purchases from "react-native-purchases";
import { getProgress, updateProgress } from "./progress";
import { configureRevenueCat } from "./integrations";

export interface UserAccount {
  readonly id: string;
  readonly email: string;
  readonly displayName: string | null;
  readonly provider: "google" | "anonymous";
  readonly linkedAt: number;
}

export async function getCurrentAccount(): Promise<UserAccount | null> {
  const progress = await getProgress();
  return progress.userAccount;
}

export async function linkGoogleAccount(
  email: string,
  displayName?: string | null
): Promise<UserAccount> {
  const trimmedEmail = email.trim().toLowerCase();
  const userId = `google_${trimmedEmail.replace(/[^a-z0-9]/g, "_")}`;
  
  const account: UserAccount = {
    id: userId,
    email: trimmedEmail,
    displayName: displayName?.trim() || trimmedEmail.split("@")[0] || null,
    provider: "google",
    linkedAt: Date.now(),
  };

  // Sync with RevenueCat identity so entitlements follow this user account
  const status = await configureRevenueCat();
  if (status === "ready") {
    try {
      await Purchases.logIn(account.id);
    } catch {
      // Allow offline / graceful continuation if network is unavailable
    }
  }

  await updateProgress((curr) => ({
    ...curr,
    userAccount: account,
  }));

  return account;
}

export async function unlinkAccount(): Promise<void> {
  const status = await configureRevenueCat();
  if (status === "ready") {
    try {
      await Purchases.logOut();
    } catch {
      // Ignore if offline
    }
  }

  await updateProgress((curr) => ({
    ...curr,
    userAccount: null,
  }));
}
