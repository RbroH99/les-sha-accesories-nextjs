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
      if (priceRange.min) url.searchParams.set("minPrice", priceRange.min);
      if (priceRange.max) url.searchParams.set("maxPrice", priceRange.max);
      if (showDiscounted) url.searchParams.set("hasDiscount", "true");
      if (showWithImages) url.searchParams.set("hasImages", "true");
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
      setProducts(Array.isArray(data) ? data : []);
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
      productId: product.id,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/20 to-gray-50">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header con diseño mejorado */}
        <div className="mb-8 lg:mb-12">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 font-playfair bg-gradient-to-r from-gray-900 via-rose-800 to-gray-900 bg-clip-text text-transparent">
              Nuestra Tienda
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto lg:mx-0 text-lg leading-relaxed">
              Descubre nuestra colección exclusiva de bisutería artesanal. Cada
              pieza es única y está hecha con amor y dedicación.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop Modernizado */}
          <div className="hidden lg:block w-80 space-y-6">
            <div className="sticky top-24">
              <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-4 rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <Filter className="w-5 h-5 mr-2" />
                        Filtros de Búsqueda
                      </h3>
                      {activeFiltersCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-white/20 text-white border-white/30"
                        >
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </div>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="mt-2 text-white hover:bg-white/20 w-full justify-center"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Limpiar Filtros
                      </Button>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {/* Search mejorado */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700 flex items-center">
                          <Search className="w-4 h-4 mr-2 text-rose-500" />
                          Buscar Productos
                        </Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rose-400 h-4 w-4" />
                          <Input
                            placeholder="¿Qué estás buscando?"
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value);
                              setCurrentPage(1);
                            }}
                            className="pl-10 border-rose-200 focus:border-rose-400 focus:ring-rose-400 bg-rose-50/30"
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
                                  checked={selectedCategories.includes(
                                    category.id
                                  )}
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filters Toggle con chips de filtros activos */}
            <div className="lg:hidden mb-6 space-y-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-rose-200 hover:bg-rose-50 hover:border-rose-300 transition-all duration-200"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </Button>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Limpiar
                  </Button>
                )}
              </div>

              {/* Chips de filtros activos */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <div className="flex items-center gap-1 bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm">
                      <Search className="w-3 h-3" />
                      <span>"{searchTerm}"</span>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setCurrentPage(1);
                        }}
                        className="ml-1 hover:bg-rose-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {selectedCategories.map((catId) => {
                    const category = categories.find((c) => c.id === catId);
                    return category ? (
                      <div
                        key={catId}
                        className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{category.name}</span>
                        <button
                          onClick={() => handleCategoryToggle(catId)}
                          className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : null;
                  })}
                  {(priceRange.min || priceRange.max) && (
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      <span>
                        ${priceRange.min || "0"} - ${priceRange.max || "∞"}
                      </span>
                      <button
                        onClick={() => {
                          setPriceRange({ min: "", max: "" });
                          setCurrentPage(1);
                        }}
                        className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {showDiscounted && (
                    <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">
                      <span>Con descuento</span>
                      <button
                        onClick={() => {
                          setShowDiscounted(false);
                          setCurrentPage(1);
                        }}
                        className="ml-1 hover:bg-amber-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {showWithImages && (
                    <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                      <ImageIcon className="w-3 h-3" />
                      <span>Con foto</span>
                      <button
                        onClick={() => {
                          setShowWithImages(false);
                          setCurrentPage(1);
                        }}
                        className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {selectedAvailability && selectedAvailability !== "all" && (
                    <div className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                      {getAvailabilityIcon(selectedAvailability)}
                      <span>{getAvailabilityText(selectedAvailability)}</span>
                      <button
                        onClick={() => {
                          setSelectedAvailability("");
                          setCurrentPage(1);
                        }}
                        className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Filters - Drawer mejorado */}
            {showFilters && (
              <div className="lg:hidden mb-6">
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-4 rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                          <Filter className="w-5 h-5 mr-2" />
                          Filtros de Búsqueda
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFilters(false)}
                          className="text-white hover:bg-white/20 h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-6">
                        {/* Search mejorado */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-700 flex items-center">
                            <Search className="w-4 h-4 mr-2 text-rose-500" />
                            Buscar Productos
                          </Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rose-400 h-4 w-4" />
                            <Input
                              placeholder="¿Qué estás buscando?"
                              value={searchTerm}
                              onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                              }}
                              className="pl-10 border-rose-200 focus:border-rose-400 focus:ring-rose-400 bg-rose-50/30"
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
                              <SelectItem value="all">
                                Todos los tipos
                              </SelectItem>
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
                            <Label
                              htmlFor="mobile-discounted"
                              className="text-sm"
                            >
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
                          <div className="pt-4 border-t border-gray-200">
                            <Button
                              variant="outline"
                              onClick={clearFilters}
                              className="w-full bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 hover:border-rose-300"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Limpiar Filtros ({activeFiltersCount})
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Sort and Results - Diseño mejorado */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-6 border border-rose-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium text-gray-700">
                    <span className="text-rose-600 font-semibold text-lg">
                      {totalProducts}
                    </span>
                    <span className="ml-1">
                      producto{totalProducts !== 1 ? "s" : ""} encontrado
                      {totalProducts !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {currentPage > 1 && (
                    <Badge variant="outline" className="text-xs">
                      Página {currentPage} de {totalPages}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 hidden sm:block">
                    Ordenar:
                  </span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-48 bg-white border-rose-200 focus:border-rose-400">
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
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card
                    key={i}
                    className="group border-0 shadow-lg bg-white overflow-hidden"
                  >
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="w-full h-64 sm:h-72 lg:h-64 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/50 animate-pulse" />
                        </div>
                        {/* Skeleton badges */}
                        <div className="absolute top-3 left-3 space-y-2">
                          <div className="w-16 h-6 bg-white/30 rounded-full animate-pulse" />
                        </div>
                        <div className="absolute top-3 right-3">
                          <div className="w-8 h-8 bg-white/50 rounded-full animate-pulse" />
                        </div>
                      </div>
                      <div className="p-4 lg:p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="h-5 w-20 bg-rose-100 rounded-full animate-pulse"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="space-y-1">
                            <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                            <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse"></div>
                          </div>
                        </div>
                        <div className="flex items-end justify-between pt-2">
                          <div className="space-y-1">
                            <div className="h-8 w-24 bg-rose-100 rounded animate-pulse"></div>
                            <div className="h-4 w-16 bg-gray-100 rounded animate-pulse"></div>
                          </div>
                          <div className="h-9 w-20 bg-gradient-to-r from-rose-200 to-rose-300 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 lg:py-20">
                <div className="max-w-md mx-auto">
                  <div className="mb-6">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-rose-100 to-rose-200 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-12 h-12 text-rose-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 font-playfair">
                      No encontramos productos
                    </h3>
                    <p className="text-gray-500 text-base leading-relaxed">
                      No se encontraron productos que coincidan con tu búsqueda.
                      {activeFiltersCount > 0
                        ? " Intenta ajustar los filtros o buscar algo diferente."
                        : " ¡Pero no te preocupes! Tenemos muchísimos productos esperando por ti."}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {activeFiltersCount > 0 ? (
                      <>
                        <Button
                          onClick={clearFilters}
                          className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Limpiar todos los filtros
                        </Button>
                        <p className="text-sm text-gray-400">
                          O intenta con una búsqueda más general
                        </p>
                      </>
                    ) : (
                      <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                      >
                        Recargar productos
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
                        className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg bg-white overflow-hidden backdrop-blur-sm"
                      >
                        <CardContent className="p-0">
                          <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-br from-gray-50 to-gray-100">
                            {/* Badges mejorados */}
                            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                              {product.isNew && (
                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg animate-pulse-glow">
                                  Nuevo
                                </Badge>
                              )}
                              {discount && (
                                <Badge className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg">
                                  {discount.type === "percentage"
                                    ? `${discount.value}%`
                                    : `${discount.value}`}{" "}
                                  OFF
                                </Badge>
                              )}
                            </div>

                            {/* Availability Badge */}
                            <div className="absolute bottom-3 left-3 z-10">
                              <Badge
                                variant="outline"
                                className="bg-white/95 backdrop-blur-md border-white/50 shadow-lg"
                              >
                                <div className="flex items-center space-x-1">
                                  {getAvailabilityIcon(
                                    product.availabilityType
                                  )}
                                  <span className="text-xs font-medium">
                                    {getAvailabilityText(
                                      product.availabilityType
                                    )}
                                  </span>
                                </div>
                              </Badge>
                            </div>
                            {/* Botón de favoritos mejorado */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-3 right-3 z-50 bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg hover:scale-110 transition-all duration-200"
                              onClick={async (e) => {
                                e.preventDefault();
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
                                className={`w-4 h-4 transition-all duration-200 ${
                                  isFavorite(product.id)
                                    ? "fill-rose-500 text-rose-500 scale-110"
                                    : "hover:text-rose-400"
                                }`}
                              />
                            </Button>
                            {/* Contenedor de imagen mejorado */}
                            <div
                              className="relative w-full h-64 sm:h-72 lg:h-64 overflow-hidden cursor-pointer"
                              onClick={() =>
                                router.push(`/producto/${product.id}`)
                              }
                            >
                              {product.images && product.images.length > 0 ? (
                                <>
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                                  <Image
                                    src={imageUrl}
                                    alt={product.name}
                                    width={300}
                                    height={300}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ease-out"
                                  />
                                </>
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 relative">
                                  <div className="text-center z-10">
                                    <div className="bg-white/80 backdrop-blur-sm rounded-full p-4 mb-3 mx-auto w-fit">
                                      <ImageIcon className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium">
                                      Sin imagen
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Producto personalizado
                                    </p>
                                  </div>
                                  <div className="absolute inset-0 bg-gradient-to-br from-rose-100/30 to-amber-100/30 opacity-50" />
                                </div>
                              )}
                            </div>
                          </div>
                          <div
                            className="p-4 lg:p-5 space-y-4 cursor-pointer"
                            onClick={() =>
                              router.push(`/producto/${product.id}`)
                            }
                          >
                            <div className="flex items-center justify-between">
                              <Badge
                                variant="secondary"
                                className="text-xs capitalize bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                              >
                                {category?.name || "Sin categoría"}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors text-base lg:text-lg line-clamp-2 leading-tight">
                                {product.name}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                {product.description}
                              </p>
                            </div>
                          </div>
                          {/* Área de precios y acciones - NO clickeable para navegación */}
                          <div className="p-4 lg:p-5 pt-0">
                            <div className="flex items-end justify-between">
                              <div className="flex flex-col space-y-1">
                                {discount ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xl lg:text-2xl font-bold text-rose-600">
                                        ${discountedPrice.toFixed(2)}
                                      </span>
                                      <Badge
                                        variant="destructive"
                                        className="text-xs px-2 py-0.5"
                                      >
                                        -
                                        {Math.round(
                                          ((product.price - discountedPrice) /
                                            product.price) *
                                            100
                                        )}
                                        %
                                      </Badge>
                                    </div>
                                    <span className="text-sm text-gray-500 line-through">
                                      ${product.price.toFixed(2)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xl lg:text-2xl font-bold text-rose-600">
                                    ${product.price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 text-white font-medium px-4 py-2 relative z-10"
                                onClick={async (e) => {
                                  e.preventDefault();
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
                                <ShoppingBag className="w-3 h-3 mr-1.5" />
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
                <div className="mt-12">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-rose-100">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                      <div className="text-sm text-gray-600">
                        Mostrando página{" "}
                        <span className="font-semibold text-rose-600">
                          {currentPage}
                        </span>{" "}
                        de <span className="font-semibold">{totalPages}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold text-rose-600">
                          {totalProducts}
                        </span>{" "}
                        productos en total
                      </div>
                    </div>
                    <Pagination>
                      <PaginationContent className="flex-wrap gap-1">
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            className={`transition-all duration-200 ${
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "hover:bg-rose-50 hover:border-rose-200"
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) {
                                handlePageChange(currentPage - 1);
                              }
                            }}
                          />
                        </PaginationItem>
                        {totalPages <= 7 ? (
                          // Mostrar todas las páginas si son pocas
                          [...Array(totalPages)].map((_, i) => (
                            <PaginationItem key={i}>
                              <PaginationLink
                                href="#"
                                isActive={currentPage === i + 1}
                                className={`transition-all duration-200 ${
                                  currentPage === i + 1
                                    ? "bg-rose-500 text-white hover:bg-rose-600"
                                    : "hover:bg-rose-50 hover:text-rose-600"
                                }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(i + 1);
                                }}
                              >
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))
                        ) : (
                          // Lógica para muchas páginas con elipsis
                          <>
                            {currentPage > 3 && (
                              <>
                                <PaginationItem>
                                  <PaginationLink
                                    href="#"
                                    className="hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handlePageChange(1);
                                    }}
                                  >
                                    1
                                  </PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              </>
                            )}
                            {[-1, 0, 1].map((offset) => {
                              const pageNum = currentPage + offset;
                              if (pageNum >= 1 && pageNum <= totalPages) {
                                return (
                                  <PaginationItem key={pageNum}>
                                    <PaginationLink
                                      href="#"
                                      isActive={pageNum === currentPage}
                                      className={`transition-all duration-200 ${
                                        pageNum === currentPage
                                          ? "bg-rose-500 text-white hover:bg-rose-600"
                                          : "hover:bg-rose-50 hover:text-rose-600"
                                      }`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(pageNum);
                                      }}
                                    >
                                      {pageNum}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              }
                              return null;
                            })}
                            {currentPage < totalPages - 2 && (
                              <>
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                                <PaginationItem>
                                  <PaginationLink
                                    href="#"
                                    className="hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handlePageChange(totalPages);
                                    }}
                                  >
                                    {totalPages}
                                  </PaginationLink>
                                </PaginationItem>
                              </>
                            )}
                          </>
                        )}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            className={`transition-all duration-200 ${
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : "hover:bg-rose-50 hover:border-rose-200"
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < totalPages) {
                                handlePageChange(currentPage + 1);
                              }
                            }}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
