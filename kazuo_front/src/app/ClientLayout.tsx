"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader/Loader";
import { AppProvider } from "@/context/AppContext";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { Spanish } from "../translations/es/global";
import { English } from "../translations/en/global";
import { Portuguese } from "../translations/pt/global";
import { French } from "../translations/fr/global";

i18next.use(LanguageDetector).init({
  interpolation: { escapeValue: false },
  fallbackLng: "es",
  detection: {
    order: ["localStorage", "navigator"],
    caches: ["localStorage"],
  },
  resources: {
    es: {
      global: Spanish,
    },
    en: {
      global: English,
    },
    pt: {
      global: Portuguese,
    },
    fr: {
      global: French,
    },
  },
});

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18next}>
      <AppProvider>{children}</AppProvider>
    </I18nextProvider>
  );
}
