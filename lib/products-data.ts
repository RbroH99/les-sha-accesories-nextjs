export interface ProductDetail {
  id: number
  name: string
  description: string
  story: string
  price: number
  images: string[]
  category: string
  materials: string[]
  dimensions: string
  care: string
  stock: number
  availabilityType: "stock_only" | "stock_and_order" | "order_only"
  estimatedDeliveryDays: number
  returnPeriodDays: number // Nuevo campo
  rating: number
  isNew: boolean
  reviews: Array<{
    id: number
    user: string
    rating: number
    comment: string
    date: string
  }>
}

const products: ProductDetail[] = [
  {
    id: 1,
    name: "Collar Luna Dorada",
    description: "Elegante collar con dije de luna en baño de oro",
    story:
      "Inspirado en las noches de luna llena, este collar nació de una caminata nocturna por la playa. Cada dije es cuidadosamente trabajado a mano para capturar la magia y misterio de la luna.",
    price: 45.0,
    images: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
    ],
    category: "collares",
    materials: ["Baño de oro 18k", "Aleación hipoalergénica", "Cadena de acero inoxidable"],
    dimensions: "Dije: 2.5cm x 2cm, Cadena: 45cm (ajustable)",
    care: "Evitar contacto con perfumes y agua. Limpiar con paño suave.",
    stock: 15,
    availabilityType: "stock_only",
    estimatedDeliveryDays: 3,
    returnPeriodDays: 30,
    rating: 5,
    isNew: true,
    reviews: [
      {
        id: 1,
        user: "María González",
        rating: 5,
        comment: "Hermoso collar, la calidad es excelente y llegó muy rápido.",
        date: "2024-01-15",
      },
      {
        id: 2,
        user: "Ana Rodríguez",
        rating: 5,
        comment: "Me encanta, es exactamente como se ve en las fotos.",
        date: "2024-01-10",
      },
    ],
  },
  {
    id: 2,
    name: "Aretes Cristal Rosa",
    description: "Delicados aretes con cristales rosados",
    story: "Estos aretes capturan la delicadeza de los pétalos de rosa al amanecer.",
    price: 28.0,
    images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
    category: "aretes",
    materials: ["Cristales naturales", "Plata 925"],
    dimensions: "2cm x 1.5cm",
    care: "Limpiar con paño húmedo suavemente.",
    stock: 8,
    availabilityType: "stock_and_order",
    estimatedDeliveryDays: 7,
    returnPeriodDays: 15,
    rating: 5,
    isNew: false,
    reviews: [
      {
        id: 3,
        user: "Carmen López",
        rating: 5,
        comment: "Perfectos para ocasiones especiales.",
        date: "2024-01-12",
      },
    ],
  },
  {
    id: 3,
    name: "Pulsera Perlas Naturales",
    description: "Pulsera artesanal con perlas naturales",
    story: "Cada perla cuenta una historia del océano, seleccionadas una por una.",
    price: 35.0,
    images: ["/placeholder.svg?height=400&width=400"],
    category: "pulseras",
    materials: ["Perlas naturales", "Hilo de seda"],
    dimensions: "Circunferencia: 18cm (ajustable)",
    care: "Evitar humedad excesiva.",
    stock: 12,
    availabilityType: "stock_only",
    estimatedDeliveryDays: 2,
    returnPeriodDays: 45,
    rating: 4,
    isNew: true,
    reviews: [],
  },
  {
    id: 4,
    name: "Anillo Flor Vintage",
    description: "Anillo vintage con diseño floral",
    story: "Inspirado en los jardines victorianos, cada detalle evoca la elegancia del pasado.",
    price: 22.0,
    images: ["/placeholder.svg?height=400&width=400"],
    category: "anillos",
    materials: ["Aleación vintage", "Esmalte"],
    dimensions: "Tallas disponibles: 6-9",
    care: "Evitar contacto con químicos.",
    stock: 5,
    availabilityType: "stock_and_order",
    estimatedDeliveryDays: 5,
    returnPeriodDays: 30,
    rating: 5,
    isNew: false,
    reviews: [
      {
        id: 4,
        user: "Isabel Martín",
        rating: 5,
        comment: "Diseño único y muy bien acabado.",
        date: "2024-01-08",
      },
    ],
  },
  {
    id: 5,
    name: "Collar Cadena Infinito",
    description: "Collar con símbolo de infinito en plata",
    story: "Representa el amor eterno y las conexiones que trascienden el tiempo.",
    price: 52.0,
    images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
    category: "collares",
    materials: ["Plata 925", "Cadena ajustable"],
    dimensions: "Símbolo: 1.5cm, Cadena: 40-45cm",
    care: "Limpiar con productos específicos para plata.",
    stock: 7,
    availabilityType: "stock_and_order",
    estimatedDeliveryDays: 4,
    returnPeriodDays: 30,
    rating: 4,
    isNew: true,
    reviews: [],
  },
  {
    id: 6,
    name: "Anillo Personalizado",
    description: "Anillo único hecho completamente a medida según tus especificaciones",
    story:
      "Cada anillo es una obra de arte única, diseñada especialmente para ti. Trabajamos contigo para crear la pieza perfecta que refleje tu personalidad y estilo.",
    price: 85.0,
    images: [], // Sin imágenes
    category: "anillos",
    materials: ["Materiales a elegir", "Piedras opcionales", "Grabado personalizado"],
    dimensions: "Según especificaciones del cliente",
    care: "Depende de los materiales seleccionados.",
    stock: 0,
    availabilityType: "order_only",
    estimatedDeliveryDays: 14,
    returnPeriodDays: 7, // Período más corto para productos personalizados
    rating: 5,
    isNew: true,
    reviews: [
      {
        id: 5,
        user: "Patricia Ruiz",
        rating: 5,
        comment: "Increíble trabajo personalizado, superó mis expectativas.",
        date: "2024-01-05",
      },
    ],
  },
]

export function getProductById(id: number): ProductDetail | undefined {
  return products.find((product) => product.id === id)
}

export function getRelatedProducts(category: string, excludeId: number): ProductDetail[] {
  return products.filter((product) => product.category === category && product.id !== excludeId).slice(0, 4)
}

export function getAllProducts(): ProductDetail[] {
  return products
}
