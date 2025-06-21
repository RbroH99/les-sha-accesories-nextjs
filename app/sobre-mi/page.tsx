import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Award, Users, Sparkles } from "lucide-react"
import Link from "next/link"

export default function SobreMiPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200">
                  <Heart className="w-3 h-3 mr-1" />
                  Mi Historia
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight font-playfair">
                  Creando
                  <span className="text-rose-600 block">con Pasión</span>
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Soy María Elena, artesana apasionada por crear piezas únicas que reflejen la belleza y personalidad de
                  cada mujer. Cada joya que creo lleva un pedacito de mi corazón.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="/placeholder.svg?height=500&width=500"
                  alt="María Elena - Artesana"
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

      {/* Mi Historia */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-playfair">Mi Historia</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Un viaje que comenzó con curiosidad y se convirtió en una pasión que define mi vida
            </p>
          </div>

          <div className="space-y-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Todo comenzó hace más de 10 años, cuando encontré una caja de cuentas y alambres en el ático de mi
                abuela. Lo que empezó como un pasatiempo de fin de semana se convirtió rápidamente en una obsesión
                creativa que cambiaría mi vida para siempre.
              </p>

              <p className="text-gray-700 leading-relaxed">
                Mi abuela había sido joyera en su juventud, y aunque nunca llegué a conocer esa faceta de ella, siento
                que su espíritu creativo vive en cada pieza que creo. Cada collar, cada par de aretes, cada pulsera
                lleva consigo no solo mi técnica y visión, sino también el legado de generaciones de mujeres artesanas.
              </p>

              <p className="text-gray-700 leading-relaxed">
                Lo que más me emociona de mi trabajo es la conexión personal que creo con cada cliente. No solo vendo
                joyas; creo piezas que se convierten en parte de los momentos más importantes de la vida de las
                personas. He tenido el honor de crear piezas para bodas, graduaciones, cumpleaños especiales y
                celebraciones familiares.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valores y Proceso */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-playfair">Mis Valores</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Los principios que guían cada creación y cada interacción con mis clientes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-rose-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Hecho con Amor</h3>
                <p className="text-gray-600">
                  Cada pieza es creada con dedicación y cariño, poniendo mi corazón en cada detalle para que sientas la
                  diferencia.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Calidad Artesanal</h3>
                <p className="text-gray-600">
                  Utilizo solo materiales de la más alta calidad y técnicas tradicionales para garantizar durabilidad y
                  belleza.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Conexión Personal</h3>
                <p className="text-gray-600">
                  Creo una relación especial con cada cliente, entendiendo sus gustos y necesidades para crear piezas
                  únicas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Proceso Creativo */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Mi Proceso
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-playfair">
                  De la Inspiración a la Creación
                </h2>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Inspiración</h3>
                    <p className="text-gray-600">
                      Encuentro inspiración en la naturaleza, los colores del atardecer, las texturas de las flores y
                      las historias de mis clientes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Diseño</h3>
                    <p className="text-gray-600">
                      Boceto cada idea, experimentando con formas, colores y materiales hasta encontrar la combinación
                      perfecta.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Creación</h3>
                    <p className="text-gray-600">
                      Con paciencia y precisión, doy vida a cada diseño, cuidando cada detalle para lograr la perfección
                      artesanal.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Entrega</h3>
                    <p className="text-gray-600">
                      Cada pieza se empaca con amor y se entrega con la esperanza de que traiga alegría a quien la
                      recibe.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <Image
                src="/placeholder.svg?height=600&width=500"
                alt="Proceso creativo"
                width={500}
                height={600}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-r from-rose-600 to-amber-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 font-playfair">
            ¿Lista para encontrar tu pieza perfecta?
          </h2>
          <p className="text-xl mb-8 opacity-90">Explora mi colección y descubre la joya que está esperando por ti</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-rose-600 hover:bg-gray-100">
              <Link href="/tienda">Explorar Colección</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-rose-600"
            >
              <Link href="/contacto">Contactar para Pedido Personalizado</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
