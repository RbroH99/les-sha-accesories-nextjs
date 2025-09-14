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
import { useEffect, useState, useRef } from "react";
import { ProductWithRelations } from "@/lib/repositories/products";
import { StarRating } from "@/components/ui/star-rating";
import { motion, useInView } from "framer-motion";
import { useAnimations } from "@/hooks/useAnimations";

export default function HomePage() {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState<
    ProductWithRelations[]
  >([]);
  const [loading, setLoading] = useState(true);
  
  // Refs para animaciones
  const heroRef = useRef<HTMLElement>(null);
  const featuredRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  
  // Hooks para animaciones
  const animations = useAnimations();
  const heroInView = useInView(heroRef, { once: true, margin: "-10%" });
  const featuredInView = useInView(featuredRef, { once: true, margin: "-10%" });
  const aboutInView = useInView(aboutRef, { once: true, margin: "-10%" });
  const contactInView = useInView(contactRef, { once: true, margin: "-10%" });

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await fetch("/api/products?sortBy=newest&limit=4");
        if (res.ok) {
          const { data } = await res.json();
          setFeaturedProducts(data);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        className="relative bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 py-20 px-4 overflow-hidden"
      >
        {/* Subtle animated background */}
        <motion.div 
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'linear-gradient(45deg, rgba(251,113,133,0.05), rgba(251,191,36,0.05))',
              'linear-gradient(225deg, rgba(251,191,36,0.05), rgba(251,113,133,0.05))',
              'linear-gradient(45deg, rgba(251,113,133,0.05), rgba(251,191,36,0.05))'
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            className="grid lg:grid-cols-2 gap-12 items-center"
            variants={animations.staggerContainer}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
          >
            <motion.div 
              className="space-y-8"
              variants={animations.fadeInLeft}
            >
              <div className="space-y-6">
                <motion.div
                  variants={animations.scaleIn}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge className="bg-rose-100/80 backdrop-blur-sm text-rose-800 hover:bg-rose-200/80 transition-all duration-300">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Hecho a mano con amor
                  </Badge>
                </motion.div>
                
                <motion.h1 
                  className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight"
                  variants={animations.fadeInUp}
                >
                  Bisutería
                  <motion.span 
                    className="text-rose-600 block bg-gradient-to-r from-rose-500 to-rose-700 bg-clip-text text-transparent"
                    initial={{ opacity: 0 }}
                    animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    Artesanal
                  </motion.span>
                </motion.h1>
                
                <motion.p 
                  className="text-lg text-gray-600 max-w-md leading-relaxed"
                  variants={animations.fadeInUp}
                >
                  Descubre piezas únicas creadas especialmente para ti. Cada
                  joya cuenta una historia y refleja tu personalidad única.
                </motion.p>
              </div>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                variants={animations.fadeInUp}
              >
                <motion.div 
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link href="/tienda">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Explorar Tienda
                    </Link>
                  </Button>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg"
                    className="border-2 hover:bg-rose-50 transition-all duration-300"
                  >
                    <Link href="/sobre-mi">Conoce mi Historia</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="relative"
              variants={animations.fadeInRight}
            >
              <motion.div 
                className="relative z-10 group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="/landing_img.JPG?height=500&width=500"
                  alt="Bisutería artesanal"
                  width={500}
                  height={500}
                  className="rounded-2xl shadow-2xl group-hover:shadow-3xl transition-shadow duration-300"
                />
                
                {/* Subtle shimmer effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000 rounded-2xl"></div>
              </motion.div>
              
              {/* Floating decorative elements with subtle animation */}
              <motion.div 
                className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full opacity-60 blur-sm"
                animate={{ 
                  y: [-5, 5, -5],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              
              <motion.div 
                className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-rose-200 to-rose-300 rounded-full opacity-40 blur-sm"
                animate={{ 
                  y: [3, -8, 3],
                  x: [-2, 2, -2],
                  scale: [1, 1.08, 1]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Productos Destacados */}
      <motion.section 
        ref={featuredRef}
        className="py-16 px-4 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            variants={animations.staggerContainer}
            initial="hidden"
            animate={featuredInView ? "visible" : "hidden"}
          >
            <motion.h2 
              className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
              variants={animations.fadeInUp}
            >
              Productos Destacados
            </motion.h2>
            <motion.p 
              className="text-gray-600 max-w-2xl mx-auto"
              variants={animations.fadeInUp}
            >
              Descubre nuestras piezas más populares, cada una creada con
              técnicas artesanales tradicionales y materiales de la más alta
              calidad.
            </motion.p>
          </motion.div>

          {loading ? (
            <motion.div 
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={animations.staggerContainer}
              initial="hidden"
              animate={featuredInView ? "visible" : "hidden"}
            >
              {[...Array(4)].map((_, i) => (
                <motion.div key={i} variants={animations.scaleIn}>
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-0">
                      <div className="animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 h-64 w-full rounded-t-lg"></div>
                      <div className="p-4 space-y-3">
                        <div className="animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 h-4 w-1/2 rounded"></div>
                        <div className="animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 h-6 w-3/4 rounded"></div>
                        <div className="flex items-center justify-between">
                          <div className="animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 h-8 w-1/3 rounded"></div>
                          <div className="animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 h-8 w-1/4 rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={animations.staggerContainer}
              initial="hidden"
              animate={featuredInView ? "visible" : "hidden"}
            >
              {featuredProducts.map((product) => (
                <motion.div key={product.id} variants={animations.scaleIn}>
                  <Card
                    className="group hover:shadow-lg transition-shadow duration-300 border-0 shadow-md cursor-pointer overflow-hidden"
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
                        src={
                          product.images.length > 0
                            ? product.images[0]
                            : "/placeholder.svg"
                        }
                        alt={product.name}
                        width={300}
                        height={300}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {product.categoryName}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <StarRating
                            rating={product.averageRating}
                            readOnly
                            size={12}
                          />
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
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div 
            className="text-center mt-12"
            variants={animations.fadeInUp}
            initial="hidden"
            animate={featuredInView ? "visible" : "hidden"}
          >
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-2 hover:bg-rose-50 transition-all duration-300"
              >
                <Link href="/tienda">Ver Todos los Productos</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Sobre Nosotros */}
      <motion.section 
        ref={aboutRef}
        className="py-16 px-4 bg-gradient-to-r from-rose-50 to-amber-50 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="grid lg:grid-cols-2 gap-12 items-center"
            variants={animations.staggerContainer}
            initial="hidden"
            animate={aboutInView ? "visible" : "hidden"}
          >
            <motion.div 
              className="space-y-6"
              variants={animations.fadeInLeft}
            >
              <motion.h2 
                className="text-3xl lg:text-4xl font-bold text-gray-900"
                variants={animations.fadeInUp}
              >
                Creado con Pasión y Dedicación
              </motion.h2>
              
              <motion.p 
                className="text-gray-600 leading-relaxed"
                variants={animations.fadeInUp}
              >
                Cada pieza está hecha a mano con amor. Utilizamos materiales y
                técnicas tradicionales para crear joyas que no solo son
                hermosas, sino que también cuentan una historia.
              </motion.p>
              
              <motion.p 
                className="text-gray-600 leading-relaxed"
                variants={animations.fadeInUp}
              >
                Desde collares elegantes hasta aretes delicados, cada creación
                refleja nuestra pasión por el arte y nuestro compromiso con la
                calidad artesanal.
              </motion.p>
              
              <motion.div
                variants={animations.fadeInUp}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href="/sobre-mi">Conoce Más Sobre Mí</Link>
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="relative"
              variants={animations.fadeInRight}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group"
              >
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Proceso artesanal"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg group-hover:shadow-2xl transition-shadow duration-300"
                />
                
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000 rounded-lg"></div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Contacto */}
      <motion.section 
        ref={contactRef}
        className="py-16 px-4 bg-white"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={animations.staggerContainer}
            initial="hidden"
            animate={contactInView ? "visible" : "hidden"}
            className="space-y-8"
          >
            <motion.h2 
              className="text-3xl lg:text-4xl font-bold text-gray-900"
              variants={animations.fadeInUp}
            >
              ¿Tienes alguna pregunta?
            </motion.h2>
            
            <motion.p 
              className="text-gray-600 max-w-2xl mx-auto leading-relaxed"
              variants={animations.fadeInUp}
            >
              Estamos aquí para ayudarte. Contáctanos para consultas sobre
              productos personalizados, tiempos de entrega o cualquier otra
              pregunta.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={animations.staggerContainer}
            >
              <motion.div
                variants={animations.fadeInUp}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href="/contacto">Contáctanos</Link>
                </Button>
              </motion.div>
              
              <motion.div
                variants={animations.fadeInUp}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg"
                  className="border-2 hover:bg-gray-50 transition-all duration-300"
                >
                  <Link href="mailto:les.sha.accesorios@gmail.com">
                    les.sha.accesorios@gmail.com
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
