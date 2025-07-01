"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Heart,
  ShoppingBag,
  Search,
  Filter,
  X,
  Package,
  CheckCircle,
  Clock,
  ImageIcon,
} from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/contexts/favorites-context";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useCategories } from "@/contexts/categories-context";
import { useDiscounts } from "@/contexts/discounts-context";
import { ProductDetail } from "@/lib/repositories/products";
import { getOptimizedImageUrl } from "@/lib/imagekit-client";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const sortOptions = [
  { value: "featured", label: "Destacados" },
  { value: "price-low", label: "Precio: Menor a Mayor" },
  { value: "price-high", label: "Precio: Mayor a Menor" },
  { value: "newest", label: "Más Nuevos" },
  { value: "rating", label: "Mejor Valorados" },
];

export default function TiendaPage() {
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showDiscounted, setShowDiscounted] = useState(false);
  const [showWithImages, setShowWithImages] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const { addItem } = useCart();
  const { toast } = useToast();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const { categories } = useCategories();
  const { calculateDiscountedPrice } = useDiscounts();
  const searchParams = useSearchParams();
  const router = useRouter();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL("/api/products", window.location.origin);
      url.searchParams.set("page", currentPage.toString());
      url.searchParams.set("limit", "12");

      if (searchTerm) url.searchParams.set("search", searchTerm);
      selectedCategories.forEach((cat) =>
        url.searchParams.append("categoryId", cat)
      );
      if (priceRange.min)
        url.searchParams.set("minPrice", priceRange.min);
      if (priceRange.max)
        url.searchParams.set("maxPrice", priceRange.max);
      if (showDiscounted)
        url.searchParams.set("hasDiscount", "true");
      if (showWithImages)
        url.searchParams.set("hasImages", "true");
      if (selectedAvailability && selectedAvailability !== "all") {
        url.searchParams.set("availabilityType", selectedAvailability);
      }
      if (sortBy !== "featured") {
        const [sort, order] = sortBy.split("-");
        url.searchParams.set("sortBy", sort);
        url.searchParams.set("sortOrder", order || "asc");
      }

      const res = await fetch(url.toString());
      const { data, total, totalPages: newTotalPages } = await res.json();
      setProducts(data);
      setTotalProducts(total);
      setTotalPages(newTotalPages);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    searchTerm,
    selectedCategories,
    priceRange,
    showDiscounted,
    showWithImages,
    selectedAvailability,
    sortBy,
    toast,
  ]);

  useEffect(() => {
    const categoria = searchParams.get("categoria");
    if (categoria) {
      setSelectedCategories([categoria]);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = async (product: ProductDetail) => {
    await addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "/placeholder.svg?height=300&width=300",
      category: product.categoryId,
    });
  };

  const handleToggleFavorite = async (product: ProductDetail) => {
    await toggleFavorite({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "/placeholder.svg?height=300&width=300",
      category: product.categoryId,
    });
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setPriceRange({ min: "", max: "" });
    setShowDiscounted(false);
    setShowWithImages(false);
    setSelectedAvailability("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const activeFiltersCount =
    (searchTerm ? 1 : 0) +
    selectedCategories.length +
    (priceRange.min || priceRange.max ? 1 : 0) +
    (showDiscounted ? 1 : 0) +
    (showWithImages ? 1 : 0) +
    (selectedAvailability ? 1 : 0);

  const getAvailabilityIcon = (type: string) => {
    switch (type) {
      case "stock_only":
        return <Package className="w-4 h-4 text-blue-600" />;
      case "stock_and_order":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "order_only":
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const getAvailabilityText = (type: string) => {
    switch (type) {
      case "stock_only":
        return "Solo Stock";
      case "stock_and_order":
        return "Stock + Pedido";
      case "order_only":
        return "Solo Pedido";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-playfair">
            Nuestra Tienda
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Explora nuestra colección completa de bisutería artesanal. Cada
            pieza es única y está hecha con amor y dedicación.
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
                    <Label className="text-sm font-medium mb-2 block">
                      Buscar
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Categorías
                    </Label>
                    <div className="space-y-2">
                      {categories
                        .filter((cat) => cat.isActive)
                        .map((category) => (
                          <div
                            key={category.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`category-${category.id}`}
                              checked={selectedCategories.includes(category.id)}
                              onCheckedChange={() =>
                                handleCategoryToggle(category.id)
                              }
                            />
                            <Label
                              htmlFor={`category-${category.id}`}
                              className="text-sm"
                            >
                              {category.name}
                            </Label>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Availability Type */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Disponibilidad
                    </Label>
                    <Select
                      value={selectedAvailability}
                      onValueChange={(value) => {
                        setSelectedAvailability(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los tipos</SelectItem>
                        <SelectItem value="stock_only">
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-blue-600" />
                            <span>Solo Stock</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="stock_and_order">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Stock + Pedido</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="order_only">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span>Solo Pedido</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Rango de Precios
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Mín"
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => {
                          setPriceRange((prev) => ({
                            ...prev,
                            min: e.target.value,
                          }));
                          setCurrentPage(1);
                        }}
                      />
                      <Input
                        placeholder="Máx"
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => {
                          setPriceRange((prev) => ({
                            ...prev,
                            max: e.target.value,
                          }));
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  </div>

                  {/* Special Filters */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="discounted"
                        checked={showDiscounted}
                        onCheckedChange={(checked) => {
                          if (checked !== "indeterminate") {
                            setShowDiscounted(checked);
                            setCurrentPage(1);
                          }
                        }}
                      />
                      <Label htmlFor="discounted" className="text-sm">
                        Solo productos con descuento
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="withImages"
                        checked={showWithImages}
                        onCheckedChange={(checked) => {
                          if (checked !== "indeterminate") {
                            setShowWithImages(checked);
                            setCurrentPage(1);
                          }
                        }}
                      />
                      <Label
                        htmlFor="withImages"
                        className="text-sm flex items-center"
                      >
                        <ImageIcon className="w-4 h-4 mr-1" />
                        Solo productos con foto
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
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full"
              >
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Search */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Buscar
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Buscar productos..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">
                        Categorías
                      </Label>
                      <div className="space-y-2">
                        {categories
                          .filter((cat) => cat.isActive)
                          .map((category) => (
                            <div
                              key={category.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`mobile-category-${category.id}`}
                                checked={selectedCategories.includes(
                                  category.id
                                )}
                                onCheckedChange={() =>
                                  handleCategoryToggle(category.id)
                                }
                              />
                              <Label
                                htmlFor={`mobile-category-${category.id}`}
                                className="text-sm"
                              >
                                {category.name}
                              </Label>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Availability Type */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">
                        Disponibilidad
                      </Label>
                      <Select
                        value={selectedAvailability}
                        onValueChange={(value) => {
                          setSelectedAvailability(value);
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los tipos</SelectItem>
                          <SelectItem value="stock_only">
                            <div className="flex items-center space-x-2">
                              <Package className="w-4 h-4 text-blue-600" />
                              <span>Solo Stock</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="stock_and_order">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>Stock + Pedido</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="order_only">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-orange-600" />
                              <span>Solo Pedido</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">
                        Rango de Precios
                      </Label>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Mín"
                          type="number"
                          value={priceRange.min}
                          onChange={(e) => {
                            setPriceRange((prev) => ({
                              ...prev,
                              min: e.target.value,
                            }));
                            setCurrentPage(1);
                          }}
                        />
                        <Input
                          placeholder="Máx"
                          type="number"
                          value={priceRange.max}
                          onChange={(e) => {
                            setPriceRange((prev) => ({
                              ...prev,
                              max: e.target.value,
                            }));
                            setCurrentPage(1);
                          }}
                        />
                      </div>
                    </div>

                    {/* Special Filters */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="mobile-discounted"
                          checked={showDiscounted}
                          onCheckedChange={(checked) => {
                            if (checked !== "indeterminate") {
                              setShowDiscounted(checked);
                              setCurrentPage(1);
                            }
                          }}
                        />
                        <Label htmlFor="mobile-discounted" className="text-sm">
                          Solo productos con descuento
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="mobile-withImages"
                          checked={showWithImages}
                          onCheckedChange={(checked) => {
                            if (checked !== "indeterminate") {
                              setShowWithImages(checked);
                              setCurrentPage(1);
                            }
                          }}
                        />
                        <Label
                          htmlFor="mobile-withImages"
                          className="text-sm flex items-center"
                        >
                          <ImageIcon className="w-4 h-4 mr-1" />
                          Solo productos con foto
                        </Label>
                      </div>
                    </div>

                    {activeFiltersCount > 0 && (
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="w-full"
                      >
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
                {totalProducts} producto{totalProducts !== 1 ? "s" : ""}{" "}
                encontrado
                {totalProducts !== 1 ? "s" : ""}
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
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="group border-0 shadow-md bg-white">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <div className="w-full h-64 bg-gray-100 flex items-center justify-center animate-pulse"></div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No se encontraron productos que coincidan con tu búsqueda.
                </p>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="mt-4"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => {
                    const { price: discountedPrice, discount } =
                      calculateDiscountedPrice(product.price, product.id);
                    const category = categories.find(
                      (cat) => cat.id === product.categoryId
                    );

                    const imageUrl =
                      product.images && product.images.length > 0
                        ? getOptimizedImageUrl(product.images[0], {
                            width: 300,
                            height: 300,
                            quality: 80,
                            format: "webp",
                          })
                        : "/placeholder.svg";

                    return (
                      <Card
                        key={product.id}
                        className="group hover:shadow-lg transition-shadow duration-300 border-0 shadow-md bg-white cursor-pointer"
                        onClick={() => router.push(`/producto/${product.id}`)}
                      >
                        <CardContent className="p-0">
                          <div className="relative overflow-hidden rounded-t-lg">
                            {product.isNew && (
                              <Badge className="absolute top-3 left-3 z-10 bg-amber-500 hover:bg-amber-600">
                                Nuevo
                              </Badge>
                            )}
                            {discount && (
                              <Badge className="absolute top-3 right-12 z-10 bg-red-500 hover:bg-red-600">
                                {discount.type === "percentage"
                                  ? `${discount.value}%`
                                  : `${discount.value}`}{" "}
                                OFF
                              </Badge>
                            )}
                            {/* Availability Badge */}
                            <div className="absolute bottom-3 left-3 z-10">
                              <Badge
                                variant="outline"
                                className="bg-white/90 backdrop-blur-sm"
                              >
                                <div className="flex items-center space-x-1">
                                  {getAvailabilityIcon(
                                    product.availabilityType
                                  )}
                                  <span className="text-xs">
                                    {getAvailabilityText(
                                      product.availabilityType
                                    )}
                                  </span>
                                </div>
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!user) {
                                  toast({
                                    title: "Inicia sesión",
                                    description:
                                      "Debes iniciar sesión para agregar favoritos",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                await handleToggleFavorite(product);
                              }}
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  isFavorite(product.id)
                                    ? "fill-rose-600 text-rose-600"
                                    : ""
                                }`}
                              />
                            </Button>
                            {product.images && product.images.length > 0 ? (
                              <Image
                                src={imageUrl}
                                alt={product.name}
                                width={300}
                                height={300}
                                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-64 bg-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                <div className="text-center">
                                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                  <p className="text-xs text-gray-500">
                                    Sin imagen
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Producto personalizado
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge
                                variant="secondary"
                                className="text-xs capitalize"
                              >
                                {category?.name || "Sin categoría"}
                              </Badge>
                              {/* Removed rating display as it's not in the DB schema */}
                            </div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                {discount ? (
                                  <>
                                    <span className="text-xl font-bold text-rose-600">
                                      ${discountedPrice.toFixed(2)}
                                    </span>
                                    <span className="text-sm text-gray-500 line-through">
                                      ${product.price.toFixed(2)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-xl font-bold text-rose-600">
                                    ${product.price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                              <Button
                                size="sm"
                                className="bg-rose-600 hover:bg-rose-700"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (!user) {
                                    toast({
                                      title: "Inicia sesión",
                                      description:
                                        "Debes iniciar sesión para agregar productos al carrito",
                                      variant: "destructive",
                                    });
                                    return;
                                  }
                                  await handleAddToCart(product);
                                }}
                              >
                                <ShoppingBag className="w-3 h-3 mr-1" />
                                {product.availabilityType === "order_only"
                                  ? "Pedir"
                                  : "Agregar"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(Math.max(1, currentPage - 1));
                          }}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            isActive={currentPage === i + 1}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(i + 1);
                            }}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(
                              Math.min(totalPages, currentPage + 1)
                            );
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
