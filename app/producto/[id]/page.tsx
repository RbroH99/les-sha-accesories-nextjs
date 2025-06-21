"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Heart, ShoppingBag, Star, Minus, Plus, Share2, Truck, Shield, RotateCcw } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { getProductById, getRelatedProducts, type ProductDetail } from "@/lib/products-data"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { addItem } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()
  const { user } = useAuth()

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<ProductDetail[]>([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const productId = Number.parseInt(params.id as string)
    const foundProduct = getProductById(productId)

    if (foundProduct) {
      setProduct(foundProduct)
      setRelatedProducts(getRelatedProducts(foundProduct.category, foundProduct.id))
    }
    setLoading(false)
  }, [params.id])

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para agregar productos al carrito",
        variant: "destructive",
      })
      return
    }

    if (!product) return

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        category: product.category,
      })
    }

    toast({
      title: "Producto agregado",
      description: `${quantity} ${product.name}${quantity > 1 ? "s" : ""} agregado${quantity > 1 ? "s" : ""} al carrito`,
    })
  }

  const handleToggleFavorite = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para agregar favoritos",
        variant: "destructive",
      })
      return
    }

    if (!product) return

    toggleFavorite({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      category: product.category,
    })

    toast({
      title: isFavorite(product.id) ? "Eliminado de favoritos" : "Agregado a favoritos",
      description: `${product.name} ${isFavorite(product.id) ? "se eliminó de" : "se agregó a"} tus favoritos`,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
          <Button asChild>
            <Link href="/tienda">Volver a la tienda</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/tienda">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la tienda
            </Link>
          </Button>
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-rose-600">
              Inicio
            </Link>
            <span className="mx-2">/</span>
            <Link href="/tienda" className="hover:text-rose-600">
              Tienda
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/tienda?categoria=${product.category}`} className="hover:text-rose-600 capitalize">
              {product.category}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Galería de Imágenes */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              <Image
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
              />
              {product.isNew && <Badge className="absolute top-4 left-4 bg-amber-500 hover:bg-amber-600">Nuevo</Badge>}
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square bg-white rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? "border-rose-600" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Información del Producto */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="capitalize">
                  {product.category}
                </Badge>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < product.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    ({product.reviews.length} reseña{product.reviews.length !== 1 ? "s" : ""})
                  </span>
                </div>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-playfair">{product.name}</h1>

              <p className="text-gray-600 text-lg mb-4">{product.description}</p>

              <div className="text-3xl font-bold text-rose-600 mb-6">${product.price.toFixed(2)}</div>
            </div>

            {/* Cantidad y Acciones */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 text-center min-w-[3rem]">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-gray-600">{product.stock} disponibles</span>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-rose-600 hover:bg-rose-700"
                  size="lg"
                  disabled={product.stock === 0}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  {product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
                </Button>

                <Button variant="outline" size="lg" onClick={handleToggleFavorite} className="px-4">
                  <Heart className={`w-4 h-4 ${isFavorite(product.id) ? "fill-rose-600 text-rose-600" : ""}`} />
                </Button>

                <Button variant="outline" size="lg" className="px-4">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Información de Envío */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-green-600" />
                <span className="text-sm">Envío gratuito en pedidos superiores a $50</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-sm">Garantía de 6 meses</span>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-5 h-5 text-purple-600" />
                <span className="text-sm">Devoluciones dentro de 30 días</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs con Información Detallada */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <Tabs defaultValue="story" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="story">Historia</TabsTrigger>
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="care">Cuidados</TabsTrigger>
                <TabsTrigger value="reviews">Reseñas</TabsTrigger>
              </TabsList>

              <TabsContent value="story" className="mt-6">
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-4">La Historia de {product.name}</h3>
                  <p className="text-gray-700 leading-relaxed">{product.story}</p>
                </div>
              </TabsContent>

              <TabsContent value="details" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Materiales:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {product.materials.map((material, index) => (
                        <li key={index} className="text-gray-700">
                          {material}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Dimensiones:</h4>
                    <p className="text-gray-700">{product.dimensions}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="care" className="mt-6">
                <div>
                  <h4 className="font-semibold mb-2">Instrucciones de Cuidado:</h4>
                  <p className="text-gray-700">{product.care}</p>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{review.user}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Productos Relacionados */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Productos Relacionados</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card
                  key={relatedProduct.id}
                  className="group hover:shadow-lg transition-shadow duration-300 border-0 shadow-md bg-white cursor-pointer"
                  onClick={() => router.push(`/producto/${relatedProduct.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      {relatedProduct.isNew && (
                        <Badge className="absolute top-3 left-3 z-10 bg-amber-500 hover:bg-amber-600">Nuevo</Badge>
                      )}
                      <Image
                        src={relatedProduct.images[0] || "/placeholder.svg"}
                        alt={relatedProduct.name}
                        width={300}
                        height={300}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {relatedProduct.category}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < relatedProduct.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-rose-600">${relatedProduct.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
