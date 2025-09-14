"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AppSettings {
  shippingEnabled: boolean
  shippingMessage?: string
  paymentEnabled: boolean
  paymentMessage?: string
  taxEnabled: boolean
  taxRate: number
  taxName: string
}

interface SettingsContextType {
  settings: AppSettings
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<boolean>
  refreshSettings: () => Promise<void>
  loading: boolean
}

const SettingsContext = createContext<SettingsContextType | null>(null)

const defaultSettings: AppSettings = {
  shippingEnabled: true,
  shippingMessage:
    "Los envíos están temporalmente suspendidos. Nos pondremos en contacto contigo para coordinar la entrega.",
  paymentEnabled: true,
  paymentMessage:
    "Los pagos en línea están temporalmente deshabilitados. Nos pondremos en contacto contigo para coordinar el pago.",
  taxEnabled: true,
  taxRate: 16,
  taxName: "IVA",
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  // Fetch settings from database on mount
  useEffect(() => {
    fetchSettingsFromDB()
  }, [])

  const fetchSettingsFromDB = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        // Convert database format to our settings format
        const mappedSettings = {
          shippingEnabled: data.shippingEnabled === true || data.shippingEnabled === 'true',
          shippingMessage: data.shippingMessage || defaultSettings.shippingMessage,
          paymentEnabled: data.paymentEnabled === true || data.paymentEnabled === 'true',
          paymentMessage: data.paymentMessage || defaultSettings.paymentMessage,
          taxEnabled: data.taxEnabled === true || data.taxEnabled === 'true',
          taxRate: Number(data.taxRate) || defaultSettings.taxRate,
          taxName: data.taxName || defaultSettings.taxName,
        }
        setSettings(mappedSettings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      // Keep default settings if fetch fails
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: Partial<AppSettings>): Promise<boolean> => {
    try {
      // Prepare settings for database format
      const settingsToSave = Object.entries(newSettings).map(([key, value]) => ({
        key,
        value,
      }))

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsToSave),
      })

      if (response.ok) {
        // Update local state only if database update succeeded
        const updatedSettings = { ...settings, ...newSettings }
        setSettings(updatedSettings)
        return true
      } else {
        console.error('Failed to save settings to database')
        return false
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      return false
    }
  }

  const refreshSettings = async () => {
    await fetchSettingsFromDB()
  }

  return (
    <SettingsContext.Provider 
      value={{ settings, updateSettings, refreshSettings, loading }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
