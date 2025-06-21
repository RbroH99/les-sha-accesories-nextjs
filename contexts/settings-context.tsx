"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AppSettings {
  shippingEnabled: boolean
  shippingMessage?: string
}

interface SettingsContextType {
  settings: AppSettings
  updateSettings: (newSettings: Partial<AppSettings>) => void
}

const SettingsContext = createContext<SettingsContextType | null>(null)

const SETTINGS_STORAGE_KEY = "bisuteria_settings"

const defaultSettings: AppSettings = {
  shippingEnabled: true,
  shippingMessage:
    "Los envíos están temporalmente suspendidos. Nos pondremos en contacto contigo para coordinar la entrega.",
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (stored) {
      setSettings(JSON.parse(stored))
    }
  }, [])

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings))
  }

  return <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
