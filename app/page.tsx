"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, ShoppingBag, Sparkles } from "lucide-react";
import { useFavorites } from "@/contexts/favorites-context";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

// Datos de ejemplo para productos destacados
const featuredProducts = [
  {
    id: 1,
    name: "Collar Luna Dorada",
    price: 45.0,
    image: "/placeholder.svg?height=300&width=300",
    category: "Collares",
    rating: 5,
    isNew: true,
  },
  {
    id: 2,
    name: "Aretes Cristal Rosa",
    price: 28.0,
    image: "/placeholder.svg?height=300&width=300",
    category: "Aretes",
    rating: 5,
    isNew: false,
  },
  {
    id: 3,
    name: "Pulsera Perlas Naturales",
    price: 35.0,
    image: "/placeholder.svg?height=300&width=300",
    category: "Pulseras",
    rating: 4,
    isNew: true,
  },
  {
    id: 4,
    name: "Anillo Flor Vintage",
    price: 22.0,
    image: "/placeholder.svg?height=300&width=300",
    category: "Accesorios",
    rating: 5,
    isNew: false,
  },
];

export default function HomePage() {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const router = useRouter();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Hecho a mano con amor
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Bisutería
                  <span className="text-rose-600 block">Artesanal</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-md">
                  Descubre piezas únicas creadas especialmente para ti. Cada
                  joya cuenta una historia y refleja tu personalidad única.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-rose-600 hover:bg-rose-700"
                >
                  <Link href="/tienda">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Explorar Tienda
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/sobre-mi">Conoce mi Historia</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="/placeholder.svg?height=500&width=500"
                  alt="Bisutería artesanal"
                  width={500}
                  height={500}
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-200 rounded-full opacity-60"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-rose-200 rounded-full opacity-40"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Productos Destacados
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubre nuestras piezas más populares, cada una creada con
              técnicas artesanales tradicionales y materiales de la más alta
              calidad.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card
                key={product.id}
                className="group hover:shadow-lg transition-shadow duration-300 border-0 shadow-md cursor-pointer"
                onClick={() => router.push(`/producto/${product.id}`)}
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    {product.isNew && (
                      <Badge className="absolute top-3 left-3 z-10 bg-amber-500 hover:bg-amber-600">
                        Nuevo
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFavorite(product.id)
                            ? "fill-rose-500 text-rose-500"
                            : ""
                        }`}
                      />
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
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < product.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-rose-600">
                        ${product.price.toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        className="bg-rose-600 hover:bg-rose-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          // código del botón
                        }}
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

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/tienda">Ver Todos los Productos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Sobre Nosotros */}
      <section className="py-16 px-4 bg-gradient-to-r from-rose-50 to-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Creado con Pasión y Dedicación
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Cada pieza de nuestra colección es única y está hecha a mano con
                amor. Utilizamos materiales naturales y técnicas tradicionales
                para crear joyas que no solo son hermosas, sino que también
                cuentan una historia.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Desde collares elegantes hasta aretes delicados, cada creación
                refleja nuestra pasión por el arte y nuestro compromiso con la
                calidad artesanal.
              </p>
              <Button asChild className="bg-amber-600 hover:bg-amber-700">
                <Link href="/sobre-mi">Conoce Más Sobre Mí</Link>
              </Button>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Proceso artesanal"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            ¿Tienes alguna pregunta?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Contáctanos para consultas sobre
            productos personalizados, tiempos de entrega o cualquier otra
            pregunta.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-rose-600 hover:bg-rose-700">
              <Link href="/contacto">Contáctanos</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="mailto:info@bisuteria.com">info@bisuteria.com</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
