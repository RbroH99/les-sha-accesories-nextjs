"use client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Palette, Sun, Moon, Check } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"

export function ThemeSelector() {
  const { currentTheme, customThemes, setTheme } = useTheme()

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />
      case "dark":
        return <Moon className="h-4 w-4" />
      default:
        return <Palette className="h-4 w-4" />
    }
  }

  const getThemeName = (theme: string) => {
    switch (theme) {
      case "light":
        return "Claro"
      case "dark":
        return "Oscuro"
      default:
        const customTheme = customThemes.find((t) => t.id === theme)
        return customTheme?.name || "Personalizado"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {getThemeIcon(currentTheme)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Seleccionar Tema</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Default themes */}
        <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
          <Sun className="mr-2 h-4 w-4" />
          Claro
          {currentTheme === "light" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
          <Moon className="mr-2 h-4 w-4" />
          Oscuro
          {currentTheme === "dark" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>

        {/* Custom themes */}
        {customThemes.filter((t) => t.isActive).length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Temas Personalizados</DropdownMenuLabel>
            {customThemes
              .filter((t) => t.isActive)
              .map((theme) => (
                <DropdownMenuItem key={theme.id} onClick={() => setTheme(theme.id)} className="cursor-pointer">
                  <div className="mr-2 h-4 w-4 rounded-full border" style={{ backgroundColor: theme.colors.primary }} />
                  {theme.name}
                  {currentTheme === theme.id && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
              ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
