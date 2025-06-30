"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingBag, ArrowLeft } from "lucide-react"
import { useFavorites } from "@/contexts/favorites-context"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function FavoritosPage() {
  const { favorites, removeFromFavorites, loading } = useFavorites();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleAddToCart = async (favorite: any) => {
    await addItem({
      id: favorite.id,
      name: favorite.name,
      price: favorite.price,
      image: favorite.image,
      category: favorite.category,
    });
  };

  const handleRemoveFromFavorites = async (id: string, name: string) => {
    await removeFromFavorites(id);
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto text-center py-16">
                    <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Cargando tus favoritos...</h1>
                </div>
            </div>
        </div>
    )
  }

  if (!user) {
    return null;
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-16">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No tienes favoritos aún</h1>
            <p className="text-gray-600 mb-8">
              Explora nuestra tienda y agrega productos a tus favoritos para encontrarlos fácilmente después.
            </p>
            <Button asChild className="bg-rose-600 hover:bg-rose-700">
              <Link href="/tienda">Explorar Tienda</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/tienda">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la Tienda
            </Link>
          </Button>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 font-playfair">Mis Favoritos</h1>
          <p className="text-gray-600 mt-2">
            Tienes {favorites.length} producto{favorites.length !== 1 ? "s" : ""} en tus favoritos
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((favorite) => (
            <Card
              key={favorite.id}
              className="group hover:shadow-lg transition-shadow duration-300 border-0 shadow-md bg-white"
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white"
                    onClick={async () => await handleRemoveFromFavorites(favorite.id, favorite.name)}
                  >
                    <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                  </Button>
                  <Image
                    src={favorite.image || "/placeholder.svg"}
                    alt={favorite.name}
                    width={300}
                    height={300}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {favorite.category}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">
                    {favorite.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-rose-600">${favorite.price.toFixed(2)}</span>
                    <Button
                      size="sm"
                      className="bg-rose-600 hover:bg-rose-700"
                      onClick={async () => await handleAddToCart(favorite)}
                    >
                      <ShoppingBag className="w-3 h-3 mr-1" />
                      Agregar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
