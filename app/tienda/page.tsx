"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Star, Heart, ShoppingBag, Search, Filter, X } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useFavorites } from "@/contexts/favorites-context"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useCategories } from "@/contexts/categories-context"
import { useDiscounts } from "@/contexts/discounts-context"

// Datos de ejemplo para productos
const allProducts = [
  {
    id: 1,
    name: "Collar Luna Dorada",
    price: 45.0,
    image: "/placeholder.svg?height=300&width=300",
    categoryId: "cat_1",
    tagIds: ["tag_1", "tag_4"],
    rating: 5,
    isNew: true,
    description: "Elegante collar con dije de luna en baño de oro",
    discountId: "discount_1",
  },
  {
    id: 2,
    name: "Aretes Cristal Rosa",
    price: 28.0,
    image: "/placeholder.svg?height=300&width=300",
    categoryId: "cat_2",
    tagIds: ["tag_1"],
    rating: 5,
    isNew: false,
    description: "Delicados aretes con cristales rosados",
  },
  {
    id: 3,
    name: "Pulsera Perlas Naturales",
    price: 35.0,
    image: "/placeholder.svg?height=300&width=300",
    categoryId: "cat_3",
    tagIds: ["tag_3"],
    rating: 4,
    isNew: true,
    description: "Pulsera artesanal con perlas naturales",
  },
  {
    id: 4,
    name: "Anillo Flor Vintage",
    price: 22.0,
    image: "/placeholder.svg?height=300&width=300",
    categoryId: "cat_4",
    tagIds: ["tag_2"],
    rating: 5,
    isNew: false,
    description: "Anillo vintage con diseño floral",
  },
  {
    id: 5,
    name: "Collar Cadena Infinito",
    price: 52.0,
    image: "/placeholder.svg?height=300&width=300",
    categoryId: "cat_1",
    tagIds: ["tag_1", "tag_4"],
    rating: 4,
    isNew: true,
    description: "Collar con símbolo de infinito en plata",
    discountId: "discount_2",
  },
  {
    id: 6,
    name: "Aretes Gota Esmeralda",
    price: 38.0,
    image: "/placeholder.svg?height=300&width=300",
    categoryId: "cat_2",
    tagIds: ["tag_1"],
    rating: 5,
    isNew: false,
    description: "Aretes en forma de gota con piedras verdes",
  },
  {
    id: 7,
    name: "Pulsera Cuero Trenzado",
    price: 25.0,
    image: "/placeholder.svg?height=300&width=300",
    categoryId: "cat_3",
    tagIds: ["tag_3"],
    rating: 4,
    isNew: false,
    description: "Pulsera de cuero trenzado con detalles metálicos",
  },
  {
    id: 8,
    name: "Broche Mariposa",
    price: 18.0,
    image: "/placeholder.svg?height=300&width=300",
    categoryId: "cat_4",
    tagIds: ["tag_2"],
    rating: 5,
    isNew: true,
    description: "Broche decorativo con forma de mariposa",
  },
]

const sortOptions = [
  { value: "featured", label: "Destacados" },
  { value: "price-low", label: "Precio: Menor a Mayor" },
  { value: "price-high", label: "Precio: Mayor a Menor" },
  { value: "newest", label: "Más Nuevos" },
  { value: "rating", label: "Mejor Valorados" },
]

export default function TiendaPage() {
  const [products, setProducts] = useState(allProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [showDiscounted, setShowDiscounted] = useState(false)
  const [sortBy, setSortBy] = useState("featured")
  const [showFilters, setShowFilters] = useState(false)

  const { addItem } = useCart()
  const { toast } = useToast()
  const { toggleFavorite, isFavorite } = useFavorites()
  const { user } = useAuth()
  const { categories } = useCategories()
  const { calculateDiscountedPrice } = useDiscounts()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const categoria = searchParams.get("categoria")
    if (categoria) {
      setSelectedCategories([categoria])
    }
  }, [searchParams])

  useEffect(() => {
    let filteredProducts = allProducts

    // Filter by search term
    if (searchTerm) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filteredProducts = filteredProducts.filter((product) => selectedCategories.includes(product.categoryId))
    }

    // Filter by price range
    if (priceRange.min) {
      filteredProducts = filteredProducts.filter((product) => {
        const { price } = calculateDiscountedPrice(product.price, product.id)
        return price >= Number.parseFloat(priceRange.min)
      })
    }
    if (priceRange.max) {
      filteredProducts = filteredProducts.filter((product) => {
        const { price } = calculateDiscountedPrice(product.price, product.id)
        return price <= Number.parseFloat(priceRange.max)
      })
    }

    // Filter by discounted products
    if (showDiscounted) {
      filteredProducts = filteredProducts.filter((product) => {
        const { discount } = calculateDiscountedPrice(product.price, product.id)
        return !!discount
      })
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filteredProducts.sort((a, b) => {
          const priceA = calculateDiscountedPrice(a.price, a.id).price
          const priceB = calculateDiscountedPrice(b.price, b.id).price
          return priceA - priceB
        })
        break
      case "price-high":
        filteredProducts.sort((a, b) => {
          const priceA = calculateDiscountedPrice(a.price, a.id).price
          const priceB = calculateDiscountedPrice(b.price, b.id).price
          return priceB - priceA
        })
        break
      case "newest":
        filteredProducts.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
      case "rating":
        filteredProducts.sort((a, b) => b.rating - a.rating)
        break
      default:
        // Keep original order for featured
        break
    }

    setProducts(filteredProducts)
  }, [searchTerm, selectedCategories, priceRange, showDiscounted, sortBy, calculateDiscountedPrice])

  const handleAddToCart = (product: (typeof allProducts)[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.categoryId,
    })
    toast({
      title: "Producto agregado",
      description: `${product.name} se agregó al carrito`,
    })
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategories([])
    setPriceRange({ min: "", max: "" })
    setShowDiscounted(false)
  }

  const activeFiltersCount =
    (searchTerm ? 1 : 0) +
    selectedCategories.length +
    (priceRange.min || priceRange.max ? 1 : 0) +
    (showDiscounted ? 1 : 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-playfair">Nuestra Tienda</h1>
          <p className="text-gray-600 max-w-2xl">
            Explora nuestra colección completa de bisutería artesanal. Cada pieza es única y está hecha con amor y
            dedicación.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-80 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Filtros</h3>
                  {activeFiltersCount > 0 && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Limpiar ({activeFiltersCount})
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Search */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Categorías</Label>
                    <div className="space-y-2">
                      {categories
                        .filter((cat) => cat.isActive)
                        .map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category.id}`}
                              checked={selectedCategories.includes(category.id)}
                              onCheckedChange={() => handleCategoryToggle(category.id)}
                            />
                            <Label htmlFor={`category-${category.id}`} className="text-sm">
                              {category.name}
                            </Label>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Rango de Precios</Label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Mín"
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                      />
                      <Input
                        placeholder="Máx"
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Discounted Products */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="discounted" checked={showDiscounted} onCheckedChange={setShowDiscounted} />
                      <Label htmlFor="discounted" className="text-sm">
                        Solo productos con descuento
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filters Toggle */}
            <div className="lg:hidden mb-6">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </Button>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <Card className="lg:hidden mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Filtros</h3>
                    <Button variant="outline" size="sm" onClick={() => setShowFilters(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Search */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Buscar</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Buscar productos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Categorías</Label>
                      <div className="space-y-2">
                        {categories
                          .filter((cat) => cat.isActive)
                          .map((category) => (
                            <div key={category.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`mobile-category-${category.id}`}
                                checked={selectedCategories.includes(category.id)}
                                onCheckedChange={() => handleCategoryToggle(category.id)}
                              />
                              <Label htmlFor={`mobile-category-${category.id}`} className="text-sm">
                                {category.name}
                              </Label>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Rango de Precios</Label>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Mín"
                          type="number"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                        />
                        <Input
                          placeholder="Máx"
                          type="number"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Discounted Products */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="mobile-discounted" checked={showDiscounted} onCheckedChange={setShowDiscounted} />
                        <Label htmlFor="mobile-discounted" className="text-sm">
                          Solo productos con descuento
                        </Label>
                      </div>
                    </div>

                    {activeFiltersCount > 0 && (
                      <Button variant="outline" onClick={clearFilters} className="w-full">
                        <X className="w-4 h-4 mr-2" />
                        Limpiar Filtros ({activeFiltersCount})
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sort and Results */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                {products.length} producto{products.length !== 1 ? "s" : ""} encontrado
                {products.length !== 1 ? "s" : ""}
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const { price: discountedPrice, discount } = calculateDiscountedPrice(product.price, product.id)
                const category = categories.find((cat) => cat.id === product.categoryId)

                return (
                  <Card
                    key={product.id}
                    className="group hover:shadow-lg transition-shadow duration-300 border-0 shadow-md bg-white cursor-pointer"
                    onClick={() => router.push(`/producto/${product.id}`)}
                  >
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg">
                        {product.isNew && (
                          <Badge className="absolute top-3 left-3 z-10 bg-amber-500 hover:bg-amber-600">Nuevo</Badge>
                        )}
                        {discount && (
                          <Badge className="absolute top-3 right-12 z-10 bg-red-500 hover:bg-red-600">
                            {discount.type === "percentage" ? `${discount.value}%` : `$${discount.value}`} OFF
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!user) {
                              toast({
                                title: "Inicia sesión",
                                description: "Debes iniciar sesión para agregar favoritos",
                                variant: "destructive",
                              })
                              return
                            }
                            toggleFavorite({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.image,
                              category: product.categoryId,
                            })
                            toast({
                              title: isFavorite(product.id) ? "Eliminado de favoritos" : "Agregado a favoritos",
                              description: `${product.name} ${isFavorite(product.id) ? "se eliminó de" : "se agregó a"} tus favoritos`,
                            })
                          }}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite(product.id) ? "fill-rose-600 text-rose-600" : ""}`} />
                        </Button>
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {category?.name || "Sin categoría"}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < product.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            {discount ? (
                              <>
                                <span className="text-xl font-bold text-rose-600">${discountedPrice.toFixed(2)}</span>
                                <span className="text-sm text-gray-500 line-through">${product.price.toFixed(2)}</span>
                              </>
                            ) : (
                              <span className="text-xl font-bold text-rose-600">${product.price.toFixed(2)}</span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            className="bg-rose-600 hover:bg-rose-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!user) {
                                toast({
                                  title: "Inicia sesión",
                                  description: "Debes iniciar sesión para agregar productos al carrito",
                                  variant: "destructive",
                                })
                                return
                              }
                              handleAddToCart(product)
                            }}
                          >
                            <ShoppingBag className="w-3 h-3 mr-1" />
                            Agregar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No se encontraron productos que coincidan con tu búsqueda.</p>
                {activeFiltersCount > 0 && (
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Limpiar filtros
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
