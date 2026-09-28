import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { copyFor, type Locale } from "@aurora/domain";

interface LocaleValue {
  readonly locale: Locale;
  readonly copy: ReturnType<typeof copyFor>;
  readonly setLocale: (locale: Locale) => Promise<void>;
}

const Context = createContext<LocaleValue | null>(null);

export function LocaleProvider({ children }: { readonly children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  useEffect(() => {
    void SecureStore.getItemAsync("aurora.locale").then((value) => {
      if (value === "es" || value === "en") setLocaleState(value);
    });
  }, []);
  const value = useMemo<LocaleValue>(
    () => ({
      locale,
      copy: copyFor(locale),
      setLocale: async (next) => {
        await SecureStore.setItemAsync("aurora.locale", next);
        setLocaleState(next);
      },
    }),
    [locale],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useLocale(): LocaleValue {
  const value = useContext(Context);
  if (!value) throw new Error("useLocale must be used within LocaleProvider");
  return value;
}
