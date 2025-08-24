"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./auth-context";
import { useToast } from "@/hooks/use-toast";

export interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  productId: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  loading: boolean;
  addToFavorites: (item: FavoriteItem) => Promise<void>;
  removeFromFavorites: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: FavoriteItem) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, fetchWithAuth } = useAuth();
  const { toast } = useToast();

  const fetchFavorites = useCallback(async () => {
    if (!user || !fetchWithAuth) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithAuth("/api/favorites");
      if (response?.ok) {
        const data = await response.json();
        setFavorites(
          data.map((fav: any) => ({ ...fav.product, id: fav.productId }))
        );
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [user, fetchWithAuth]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addToFavorites = async (item: FavoriteItem) => {
    if (!user || !fetchWithAuth) return;
    try {
      const response = await fetchWithAuth("/api/favorites", {
        method: "POST",
        body: JSON.stringify({ productId: item.id }),
      });
      if (response?.ok) {
        setFavorites((prev) => [...prev, item]);
        toast({
          title: "Agregado a favoritos",
          description: `${item.name} se agregó a tus favoritos`,
        });
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  };

  const removeFromFavorites = async (id: string) => {
    if (!user || !fetchWithAuth) return;
    try {
      const response = await fetchWithAuth(`/api/favorites/${id}`, {
        method: "DELETE",
      });
      if (response?.ok) {
        setFavorites((prev) => prev.filter((fav) => fav.id !== id));
        toast({
          title: "Eliminado de favoritos",
          description: `El producto se eliminó de tus favoritos`,
        });
      }
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

  const isFavorite = (id: string) => {
    return favorites.some((fav) => fav.id === id);
  };

  const toggleFavorite = async (item: FavoriteItem) => {
    if (isFavorite(item.id)) {
      await removeFromFavorites(item.id);
    } else {
      await addToFavorites(item);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
