// Datos extendidos de productos con múltiples imágenes e historias
export interface ProductDetail {
  id: number
  name: string
  price: number
  images: string[]
  category: string
  rating: number
  isNew: boolean
  description: string
  story: string
  materials: string[]
  dimensions: string
  care: string
  stock: number
  reviews: {
    id: number
    user: string
    rating: number
    comment: string
    date: string
  }[]
}

export const productsData: ProductDetail[] = [
  {
    id: 1,
    name: "Collar Luna Dorada",
    price: 45.0,
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    category: "collares",
    rating: 5,
    isNew: true,
    description: "Elegante collar con dije de luna en baño de oro, perfecto para ocasiones especiales",
    story:
      "Inspirado en las noches de luna llena, este collar nació de una caminata nocturna por la playa. La forma de la luna reflejándose en el agua me inspiró a crear esta pieza única. Cada curva del dije representa las fases lunares, simbolizando los ciclos de renovación y crecimiento personal. Trabajé durante semanas perfeccionando cada detalle, desde el brillo del baño de oro hasta la delicada cadena que complementa el diseño. Es una pieza que habla de misterio, feminidad y conexión con la naturaleza.",
    materials: ["Baño de oro 18k", "Aleación hipoalergénica", "Cadena de acero inoxidable"],
    dimensions: "Dije: 2.5cm x 2cm, Cadena: 45cm (ajustable)",
    care: "Evitar contacto con perfumes y agua. Limpiar con paño suave.",
    stock: 15,
    reviews: [
      {
        id: 1,
        user: "María González",
        rating: 5,
        comment: "¡Hermoso! La calidad es excelente y el diseño es único. Lo uso todos los días.",
        date: "2024-01-15",
      },
      {
        id: 2,
        user: "Ana Rodríguez",
        rating: 5,
        comment: "Me encanta la historia detrás de la pieza. Se siente muy especial usarlo.",
        date: "2024-01-10",
      },
    ],
  },
  {
    id: 2,
    name: "Aretes Cristal Rosa",
    price: 28.0,
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    category: "aretes",
    rating: 5,
    isNew: false,
    description: "Delicados aretes con cristales rosados que capturan la luz",
    story:
      "Estos aretes nacieron de mi fascinación por los cristales de cuarzo rosa que encontré en un viaje a las montañas. Cada cristal fue seleccionado personalmente por su transparencia y su tono rosado perfecto. El diseño busca realzar la belleza natural de la piedra, creando un juego de luces que cambia según el ángulo. Son perfectos para el día a día, pero también elegantes para ocasiones especiales. Representan el amor propio y la delicadeza femenina.",
    materials: ["Cristales de cuarzo rosa natural", "Plata 925", "Cierre de presión hipoalergénico"],
    dimensions: "2cm x 1.5cm",
    care: "Limpiar con agua tibia y jabón neutro. Secar completamente.",
    stock: 8,
    reviews: [
      {
        id: 1,
        user: "Carmen López",
        rating: 5,
        comment: "Los colores son preciosos y muy cómodos de usar.",
        date: "2024-01-12",
      },
    ],
  },
  {
    id: 3,
    name: "Pulsera Perlas Naturales",
    price: 35.0,
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    category: "pulseras",
    rating: 4,
    isNew: true,
    description: "Pulsera artesanal con perlas naturales de agua dulce",
    story:
      "Esta pulsera representa la elegancia atemporal. Cada perla fue cuidadosamente seleccionada por su lustre y forma única. Las perlas de agua dulce tienen una historia de miles de años, formándose lentamente en las profundidades de lagos y ríos. Al crear esta pulsera, quise capturar esa paciencia y belleza natural. El hilo de seda usado es resistente pero delicado, permitiendo que las perlas se muevan naturalmente. Es una pieza que se vuelve más hermosa con el uso, ya que las perlas adquieren el brillo natural de la piel.",
    materials: ["Perlas de agua dulce naturales", "Hilo de seda", "Cierre de plata 925"],
    dimensions: "Circunferencia: 18cm (ajustable)",
    care: "Evitar contacto con químicos. Guardar en lugar seco.",
    stock: 12,
    reviews: [
      {
        id: 1,
        user: "Isabel Martín",
        rating: 4,
        comment: "Muy elegante, aunque me gustaría que fuera un poco más larga.",
        date: "2024-01-08",
      },
    ],
  },
  {
    id: 4,
    name: "Anillo Flor Vintage",
    price: 22.0,
    images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
    category: "accesorios",
    rating: 5,
    isNew: false,
    description: "Anillo vintage con diseño floral inspirado en los años 20",
    story:
      "Este anillo es un homenaje a la elegancia de los años 20. El diseño floral está inspirado en los jardines de mi abuela, donde pasé muchas tardes de mi infancia. Cada pétalo está trabajado a mano, creando texturas que juegan con la luz. La pátina vintage le da un carácter único, como si fuera una pieza heredada de generación en generación. Es más que un accesorio; es una conexión con el pasado y una celebración de la artesanía tradicional.",
    materials: ["Aleación vintage", "Acabado envejecido", "Ajustable"],
    dimensions: "Motivo floral: 1.8cm x 1.5cm",
    care: "Limpiar con paño seco. Evitar humedad excesiva.",
    stock: 20,
    reviews: [
      {
        id: 1,
        user: "Lucía Fernández",
        rating: 5,
        comment: "¡Me encanta el estilo vintage! Es exactamente lo que buscaba.",
        date: "2024-01-05",
      },
    ],
  },
  {
    id: 5,
    name: "Collar Cadena Infinito",
    price: 52.0,
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    category: "collares",
    rating: 4,
    isNew: true,
    description: "Collar con símbolo de infinito en plata, representa el amor eterno",
    story:
      "El símbolo del infinito ha fascinado a la humanidad durante siglos. Este collar nació de la idea de crear algo que represente los vínculos eternos: el amor, la amistad, la familia. Trabajé el metal hasta lograr la curvatura perfecta del símbolo, puliendo cada superficie hasta obtener un brillo espejo. La cadena fue diseñada para complementar el dije sin competir con él. Es una pieza que habla de promesas eternas y conexiones que trascienden el tiempo.",
    materials: ["Plata 925", "Cadena de eslabones finos", "Cierre de seguridad"],
    dimensions: "Símbolo: 2cm x 1cm, Cadena: 50cm",
    care: "Limpiar con productos específicos para plata.",
    stock: 8,
    reviews: [
      {
        id: 1,
        user: "Patricia Ruiz",
        rating: 4,
        comment: "Hermoso diseño, aunque la cadena podría ser un poco más gruesa.",
        date: "2024-01-03",
      },
    ],
  },
  {
    id: 6,
    name: "Aretes Gota Esmeralda",
    price: 38.0,
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    category: "aretes",
    rating: 5,
    isNew: false,
    description: "Aretes en forma de gota con piedras verdes naturales",
    story:
      "Inspirados en las gotas de rocío matutino sobre las hojas, estos aretes capturan la esencia de la naturaleza en su estado más puro. Las piedras verdes fueron seleccionadas por su color vibrante que recuerda a los bosques profundos. Cada gota está tallada para maximizar el brillo de la piedra, creando un efecto hipnótico cuando se mueven. Son perfectos para quienes aman la naturaleza y buscan llevar un pedacito de ella siempre consigo.",
    materials: ["Piedras verdes naturales", "Engaste de plata", "Ganchos hipoalergénicos"],
    dimensions: "3cm x 1.5cm",
    care: "Limpiar con paño húmedo. Evitar golpes fuertes.",
    stock: 15,
    reviews: [
      {
        id: 1,
        user: "Elena Vega",
        rating: 5,
        comment: "El color es espectacular y quedan perfectos con todo.",
        date: "2024-01-01",
      },
    ],
  },
  {
    id: 7,
    name: "Pulsera Cuero Trenzado",
    price: 25.0,
    images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
    category: "pulseras",
    rating: 4,
    isNew: false,
    description: "Pulsera de cuero trenzado con detalles metálicos",
    story:
      "Esta pulsera combina la rusticidad del cuero con la elegancia del metal. Aprendí la técnica de trenzado de un artesano tradicional que me enseñó que cada trenza cuenta una historia. El cuero utilizado es de origen sostenible, tratado con métodos naturales que respetan el medio ambiente. Los detalles metálicos están inspirados en la joyería tribal, creando un contraste interesante entre lo moderno y lo ancestral. Es perfecta para quienes buscan un estilo bohemio con un toque contemporáneo.",
    materials: ["Cuero genuino", "Detalles en aleación", "Cierre ajustable"],
    dimensions: "Ancho: 1.5cm, Largo ajustable: 16-20cm",
    care: "Evitar agua. Acondicionar el cuero ocasionalmente.",
    stock: 25,
    reviews: [
      {
        id: 1,
        user: "Sofía Castro",
        rating: 4,
        comment: "Me gusta mucho el estilo, muy cómoda de usar.",
        date: "2023-12-28",
      },
    ],
  },
  {
    id: 8,
    name: "Broche Mariposa",
    price: 18.0,
    images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
    category: "accesorios",
    rating: 5,
    isNew: true,
    description: "Broche decorativo con forma de mariposa",
    story:
      "Las mariposas simbolizan la transformación y la libertad. Este broche nació durante mi proceso personal de cambio, cuando decidí dedicarme completamente a la joyería artesanal. Cada ala está trabajada con técnicas de repujado que aprendí de mi mentora, creando texturas que imitan las escamas reales de las alas de mariposa. Los colores cambian según la luz, igual que las mariposas reales. Es una pieza que celebra los momentos de transformación en nuestras vidas.",
    materials: ["Aleación artística", "Esmaltes de colores", "Prendedor de seguridad"],
    dimensions: "4cm x 3cm",
    care: "Limpiar con paño seco. Manejar con cuidado.",
    stock: 30,
    reviews: [
      {
        id: 1,
        user: "Raquel Moreno",
        rating: 5,
        comment: "¡Precioso! Lo uso en mi chaqueta favorita y siempre recibo cumplidos.",
        date: "2023-12-25",
      },
    ],
  },
]

export function getProductById(id: number): ProductDetail | undefined {
  return productsData.find((product) => product.id === id)
}

export function getRelatedProducts(categoryId: string, currentId: number, limit = 4): ProductDetail[] {
  return productsData.filter((product) => product.category === categoryId && product.id !== currentId).slice(0, limit)
}
