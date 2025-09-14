import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Package, Mail, ArrowRight } from "lucide-react";
import { settingsRepository } from "@/lib/repositories/settings";

export default async function PedidoConfirmadoPage() {
  const settings = await settingsRepository.getAllSettings();
  const shippingEnabled =
    settings.find((s) => s.key === "shippingEnabled")?.value ?? true;
  const shippingMessage =
    settings.find((s) => s.key === "shippingMessage")?.value ??
    "3-5 días hábiles";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader className="pb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                ¡Pedido Confirmado!
              </CardTitle>
              <CardDescription className="text-lg">
                Gracias por tu compra. Tu pedido ha sido recibido y está siendo
                procesado.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  ¿Qué sigue?
                </h3>
                <div className="space-y-4 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Confirmación por email
                      </p>
                      <p className="text-sm text-gray-600">
                        Recibirás un email con los detalles de tu pedido en los
                        próximos minutos.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Preparación del pedido
                      </p>
                      <p className="text-sm text-gray-600">
                        Comenzaremos a preparar tu pedido con el cuidado y
                        atención que merece.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Envío</p>
                      <p className="text-sm text-gray-600">
                        Te notificaremos cuando tu pedido esté listo para ser
                        recogido.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <Mail className="w-8 h-8 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">
                      Email de confirmación
                    </p>
                    <p className="text-sm text-gray-600">
                      Revisa tu bandeja de entrada
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-lg">
                  <Package className="w-8 h-8 text-amber-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">
                      Tiempo de entrega
                    </p>
                    {shippingEnabled ? (
                      <p className="text-sm text-gray-600">{shippingMessage}</p>
                    ) : (
                      <p className="text-sm text-red-600">
                        Los envíos están desactivados. Nos pondremos en contacto
                        contigo.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  asChild
                  className="w-full bg-rose-600 hover:bg-rose-700"
                  size="lg"
                >
                  <Link href="/tienda">
                    Continuar Comprando
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>

                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link href="/">Volver al Inicio</Link>
                </Button>
              </div>

              <div className="text-center pt-6 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  ¿Tienes alguna pregunta sobre tu pedido?
                </p>
                <Button asChild variant="link" className="text-rose-600">
                  <Link href="/contacto">Contáctanos</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
