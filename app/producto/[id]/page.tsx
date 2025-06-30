"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  ImageIcon,
} from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useFavorites } from "@/contexts/favorites-context";
import { useAuth } from "@/contexts/auth-context";
import { useSettings } from "@/contexts/settings-context";
import { useToast } from "@/hooks/use-toast";
import { type ProductDetail } from "@/lib/repositories/products";
import { getOptimizedImageUrl } from "@/lib/imagekit-client";
import { useCategories } from "@/contexts/categories-context";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const { settings } = useSettings();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductDetail[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const { categories } = useCategories();

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const productId = params.id;

        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error("Producto no encontrado");

        const foundProduct = await res.json();
        setProduct(foundProduct);

        // Obtener productos relacionados (suponiendo que tienes endpoint que recibe categoryId)
        if (foundProduct.categoryId) {
          const relatedRes = await fetch(
            `/api/products?categoryId=${foundProduct.categoryId}&excludeId=${foundProduct.id}`
          );
          if (relatedRes.ok) {
            const related = await relatedRes.json();
            setRelatedProducts(related);
          }
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
        router.push("/tienda");
        toast({
          title: "Error",
          description: "No se pudo cargar la información del producto.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [params.id, router, toast]);

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para agregar productos al carrito",
        variant: "destructive",
      });
      return;
    }

    if (!product) return;

    // Verificar disponibilidad
    if (product.availabilityType === "stock_only" && product.stock < quantity) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${product.stock} unidades disponibles`,
        variant: "destructive",
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image:
          product.images && product.images.length > 0
            ? product.images[0]
            : "/placeholder.svg",
        category: product.categoryName || "Sin categoría",
      });
    }

    toast({
      title: "Producto agregado",
      description: `${quantity} ${product.name}${
        quantity > 1 ? "s" : ""
      } agregado${quantity > 1 ? "s" : ""} al carrito`,
    });
  };

  const handleToggleFavorite = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para agregar favoritos",
        variant: "destructive",
      });
      return;
    }

    if (!product) return;

    toggleFavorite({
      id: product.id,
      name: product.name,
      price: product.price,
      image:
        product.images && product.images.length > 0
          ? product.images[0]
          : "/placeholder.svg",
      category: product.categoryName || "Sin categoría",
    });

    toast({
      title: isFavorite(product.id)
        ? "Eliminado de favoritos"
        : "Agregado a favoritos",
      description: `${product.name} ${
        isFavorite(product.id) ? "se eliminó de" : "se agregó a"
      } tus favoritos`,
    });
  };

  const getAvailabilityIcon = (type: string) => {
    switch (type) {
      case "stock_only":
        return <Package className="w-5 h-5 text-blue-600" />;
      case "stock_and_order":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "order_only":
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAvailabilityText = (type: string) => {
    switch (type) {
      case "stock_only":
        return "Solo disponible en stock";
      case "stock_and_order":
        return "Disponible en stock y por pedido";
      case "order_only":
        return "Solo disponible por pedido";
      default:
        return "Disponibilidad desconocida";
    }
  };

  const getAvailabilityDescription = (type: string, stock: number) => {
    switch (type) {
      case "stock_only":
        return stock > 0
          ? `Tenemos ${stock} unidades en stock. Una vez agotado, no estará disponible hasta reposición.`
          : "Producto agotado. No disponible hasta reposición.";
      case "stock_and_order":
        return stock > 0
          ? `Tenemos ${stock} unidades en stock. Si se agota, puedes hacer un pedido y lo fabricaremos especialmente para ti.`
          : "Sin stock actual, pero puedes hacer un pedido y lo fabricaremos especialmente para ti.";
      case "order_only":
        return "Este producto se fabrica únicamente por encargo. Cada pieza es única y hecha especialmente para ti.";
      default:
        return "";
    }
  };

  const canAddToCart = (type: string, stock: number) => {
    switch (type) {
      case "stock_only":
        return stock > 0;
      case "stock_and_order":
      case "order_only":
        return true;
      default:
        return false;
    }
  };

  const getButtonText = (type: string, stock: number) => {
    switch (type) {
      case "stock_only":
        return stock > 0 ? "Agregar al Carrito" : "Agotado";
      case "stock_and_order":
        return stock > 0 ? "Agregar al Carrito" : "Hacer Pedido";
      case "order_only":
        return "Hacer Pedido";
      default:
        return "No Disponible";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Producto no encontrado
          </h1>
          <Button asChild>
            <Link href="/tienda">Volver a la tienda</Link>
          </Button>
        </div>
      </div>
    );
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
            <Link
              href={`/tienda?categoria=${product.categoryId}`}
              className="hover:text-rose-600 capitalize"
            >
              {product.categoryName || "Sin categoría"}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Galería de Imágenes */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={getOptimizedImageUrl(product.images[selectedImage], {
                    width: 600,
                    height: 600,
                    quality: 90,
                    format: "webp",
                  })}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">
                      Sin imagen disponible
                    </p>
                    <p className="text-sm text-gray-400">
                      Producto personalizado
                    </p>
                  </div>
                </div>
              )}
              {product.isNew && (
                <Badge className="absolute top-4 left-4 bg-amber-500 hover:bg-amber-600">
                  Nuevo
                </Badge>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square bg-white rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? "border-rose-600"
                        : "border-gray-200 hover:border-gray-300"
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
            )}
          </div>

          {/* Información del Producto */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="capitalize">
                  {product.categoryName}
                </Badge>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-playfair">
                {product.name}
              </h1>

              <p className="text-gray-600 text-lg mb-4">
                {product.description}
              </p>

              <div className="text-3xl font-bold text-rose-600 mb-6">
                ${product.price.toFixed(2)}
              </div>
            </div>

            {/* Información de Disponibilidad */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start space-x-3">
                {getAvailabilityIcon(product.availabilityType)}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {getAvailabilityText(product.availabilityType)}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {getAvailabilityDescription(
                      product.availabilityType,
                      product.stock
                    )}
                  </p>
                  {product.availabilityType !== "stock_only" && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-600 font-medium">
                        Tiempo de fabricación: {product.estimatedDeliveryDays}{" "}
                        días
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cantidad y Acciones */}
            <div className="space-y-4">
              {product.availabilityType !== "order_only" &&
                product.stock > 0 && (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">
                      Cantidad:
                    </span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="h-10 w-10"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="px-4 py-2 text-center min-w-[3rem]">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setQuantity(Math.min(product.stock, quantity + 1))
                        }
                        className="h-10 w-10"
                        disabled={
                          product.availabilityType === "stock_only" &&
                          quantity >= product.stock
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {product.availabilityType === "stock_only" && (
                      <span className="text-sm text-gray-600">
                        {product.stock} disponibles
                      </span>
                    )}
                  </div>
                )}

              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-rose-600 hover:bg-rose-700"
                  size="lg"
                  disabled={
                    !canAddToCart(product.availabilityType, product.stock)
                  }
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  {getButtonText(product.availabilityType, product.stock)}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleToggleFavorite}
                  className="px-4"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFavorite(product.id)
                        ? "fill-rose-600 text-rose-600"
                        : ""
                    }`}
                  />
                </Button>

                <Button variant="outline" size="lg" className="px-4">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Información de Políticas */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {settings.shippingEnabled && (
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-green-600" />
                  <span className="text-sm">
                    Envío gratuito en pedidos superiores a $50
                  </span>
                </div>
              )}
              {product.returnPeriodDays > 0 && (
                <div className="flex items-center space-x-3">
                  <RotateCcw className="w-5 h-5 text-purple-600" />
                  <span className="text-sm">
                    Devoluciones dentro de {product.returnPeriodDays} días
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-sm">Garantía de 6 meses</span>
              </div>
            </div>

            {/* Mensaje de envíos deshabilitados */}
            {!settings.shippingEnabled && settings.shippingMessage && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">
                      Información de Envíos
                    </h4>
                    <p className="text-sm text-amber-700 mt-1">
                      {settings.shippingMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}
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
                  <h3 className="text-xl font-semibold mb-4">
                    La Historia de {product.name}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.story}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="details" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Materiales:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {product.materials?.map((material, index) => (
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
                  <div>
                    <h4 className="font-semibold mb-2">Disponibilidad:</h4>
                    <div className="flex items-center space-x-2">
                      {getAvailabilityIcon(product.availabilityType)}
                      <span className="text-gray-700">
                        {getAvailabilityText(product.availabilityType)}
                      </span>
                    </div>
                    {product.availabilityType !== "stock_only" && (
                      <p className="text-sm text-gray-600 mt-1">
                        Tiempo de fabricación: {product.estimatedDeliveryDays}{" "}
                        días
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      Política de Devoluciones:
                    </h4>
                    <p className="text-gray-700">
                      {product.returnPeriodDays > 0
                        ? `Puedes devolver este producto dentro de ${product.returnPeriodDays} días desde la compra.`
                        : "Este producto no acepta devoluciones debido a su naturaleza personalizada."}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="care" className="mt-6">
                <div>
                  <h4 className="font-semibold mb-2">
                    Instrucciones de Cuidado:
                  </h4>
                  <p className="text-gray-700">{product.care}</p>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  <p className="text-gray-500 text-center py-8">
                    Aún no hay reseñas para este producto.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Productos Relacionados */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Productos Relacionados
            </h2>
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
                        <Badge className="absolute top-3 left-3 z-10 bg-amber-500 hover:bg-amber-600">
                          Nuevo
                        </Badge>
                      )}
                      {relatedProduct.images.length > 0 ? (
                        <Image
                          src={relatedProduct.images[0] || "/placeholder.svg"}
                          alt={relatedProduct.name}
                          width={300}
                          height={300}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className="text-xs capitalize"
                        >
                          {relatedProduct.categoryName}
                        </Badge>
                        {/* RATING SECTION */}
                        {/* <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < relatedProduct.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div> */}
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-rose-600">
                          ${relatedProduct.price.toFixed(2)}
                        </span>
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
  );
}
