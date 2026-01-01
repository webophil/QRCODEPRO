"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import frTranslations from "@/locales/fr.json"
import enTranslations from "@/locales/en.json"

type Locale = "fr" | "en"

type Translations = typeof frTranslations

const translations: Record<Locale, Translations> = {
  fr: frTranslations,
  en: enTranslations,
}

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr")

  useEffect(() => {
    const savedLocale = (localStorage.getItem("locale") as Locale) || "fr"
    setLocaleState(savedLocale)
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem("locale", newLocale)
  }

  const t = translations[locale]

  return <LanguageContext.Provider value={{ locale, setLocale, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
