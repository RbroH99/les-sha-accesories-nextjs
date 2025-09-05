"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface CustomTheme {
  id: string
  name: string
  description?: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
    border: string
    card: string
    destructive: string
  }
  isActive: boolean
  createdAt: string
}

interface ThemeContextType {
  currentTheme: "light" | "dark" | string
  customThemes: CustomTheme[]
  setTheme: (theme: "light" | "dark" | string) => void
  addCustomTheme: (theme: Omit<CustomTheme, "id" | "createdAt">) => void
  updateCustomTheme: (id: string, theme: Partial<CustomTheme>) => void
  deleteCustomTheme: (id: string) => void
  getThemeColors: (themeId?: string) => CustomTheme["colors"] | null
}

const ThemeContext = createContext<ThemeContextType | null>(null)

const THEME_STORAGE_KEY = "bisuteria_theme"
const CUSTOM_THEMES_STORAGE_KEY = "bisuteria_custom_themes"

const defaultCustomThemes: CustomTheme[] = [
  {
    id: "sage-theme",
    name: "Sage Green",
    description: "Tema inspirado en el logo de LesSha",
    colors: {
      primary: "#5a8b86",
      secondary: "#a8c5c1",
      accent: "#f59e0b",
      background: "#ffffff",
      foreground: "#1f2937",
      muted: "#f3f4f6",
      border: "#e5e7eb",
      card: "#ffffff",
      destructive: "#ef4444",
    },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "ocean-theme",
    name: "Ocean Blue",
    description: "Tema azul océano relajante",
    colors: {
      primary: "#0ea5e9",
      secondary: "#38bdf8",
      accent: "#06b6d4",
      background: "#ffffff",
      foreground: "#1e293b",
      muted: "#f1f5f9",
      border: "#e2e8f0",
      card: "#ffffff",
      destructive: "#ef4444",
    },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
]

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark" | string>("light")
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>(defaultCustomThemes)

  useEffect(() => {
    // Load theme from localStorage
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme) {
      setCurrentTheme(storedTheme)
    }

    // Load custom themes from localStorage
    const storedCustomThemes = localStorage.getItem(CUSTOM_THEMES_STORAGE_KEY)
    if (storedCustomThemes) {
      try {
        const parsed = JSON.parse(storedCustomThemes)
        setCustomThemes([...defaultCustomThemes, ...parsed])
      } catch (error) {
        console.error("Error parsing custom themes:", error)
      }
    }
  }, [])

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement

    if (currentTheme === "light") {
      root.classList.remove("dark")
      root.removeAttribute("data-theme")
    } else if (currentTheme === "dark") {
      root.classList.add("dark")
      root.removeAttribute("data-theme")
    } else {
      // Custom theme
      const customTheme = customThemes.find((t) => t.id === currentTheme)
      if (customTheme) {
        root.classList.remove("dark")
        root.setAttribute("data-theme", currentTheme)

        // Apply custom CSS variables
        Object.entries(customTheme.colors).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, value)
        })
      }
    }
  }, [currentTheme, customThemes])

  const setTheme = (theme: "light" | "dark" | string) => {
    setCurrentTheme(theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }

  const addCustomTheme = (theme: Omit<CustomTheme, "id" | "createdAt">) => {
    const newTheme: CustomTheme = {
      ...theme,
      id: `custom-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    const updatedThemes = [...customThemes, newTheme]
    setCustomThemes(updatedThemes)

    // Save only non-default themes
    const customOnly = updatedThemes.filter((t) => !defaultCustomThemes.some((dt) => dt.id === t.id))
    localStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(customOnly))
  }

  const updateCustomTheme = (id: string, updates: Partial<CustomTheme>) => {
    const updatedThemes = customThemes.map((theme) => (theme.id === id ? { ...theme, ...updates } : theme))
    setCustomThemes(updatedThemes)

    const customOnly = updatedThemes.filter((t) => !defaultCustomThemes.some((dt) => dt.id === t.id))
    localStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(customOnly))
  }

  const deleteCustomTheme = (id: string) => {
    // Don't allow deleting default themes
    if (defaultCustomThemes.some((t) => t.id === id)) return

    const updatedThemes = customThemes.filter((theme) => theme.id !== id)
    setCustomThemes(updatedThemes)

    const customOnly = updatedThemes.filter((t) => !defaultCustomThemes.some((dt) => dt.id === t.id))
    localStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(customOnly))

    // If current theme is deleted, switch to light
    if (currentTheme === id) {
      setTheme("light")
    }
  }

  const getThemeColors = (themeId?: string): CustomTheme["colors"] | null => {
    const id = themeId || currentTheme
    if (id === "light" || id === "dark") return null

    const theme = customThemes.find((t) => t.id === id)
    return theme?.colors || null
  }

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        customThemes,
        setTheme,
        addCustomTheme,
        updateCustomTheme,
        deleteCustomTheme,
        getThemeColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
