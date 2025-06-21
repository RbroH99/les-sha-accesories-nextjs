"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"

export interface FavoriteItem {
  id: number
  name: string
  price: number
  image: string
  category: string
}

interface FavoritesContextType {
  favorites: FavoriteItem[]
  addToFavorites: (item: FavoriteItem) => void
  removeFromFavorites: (id: number) => void
  isFavorite: (id: number) => boolean
  toggleFavorite: (item: FavoriteItem) => void
}

const FavoritesContext = createContext<FavoritesContextType | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const { user } = useAuth()

  // Cargar favoritos del usuario cuando se autentica
  useEffect(() => {
    if (user) {
      const savedFavorites = localStorage.getItem(`favorites_${user.id}`)
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites))
      }
    } else {
      // Si no hay usuario, limpiar favoritos
      setFavorites([])
    }
  }, [user])

  // Guardar favoritos cuando cambien
  useEffect(() => {
    if (user) {
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favorites))
    }
  }, [favorites, user])

  const addToFavorites = (item: FavoriteItem) => {
    setFavorites((prev) => {
      if (prev.find((fav) => fav.id === item.id)) {
        return prev
      }
      return [...prev, item]
    })
  }

  const removeFromFavorites = (id: number) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id))
  }

  const isFavorite = (id: number) => {
    return favorites.some((fav) => fav.id === id)
  }

  const toggleFavorite = (item: FavoriteItem) => {
    if (isFavorite(item.id)) {
      removeFromFavorites(item.id)
    } else {
      addToFavorites(item)
    }
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
