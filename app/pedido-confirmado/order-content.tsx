"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Package, 
  Mail, 
  ArrowRight, 
  Clock,
  User,
  MapPin,
  ShoppingBag,
  CreditCard,
  AlertCircle,
  Sparkles,
  Copy,
  CheckIcon
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/settings-context";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  image: string;
  originalPrice: number;
  finalPrice: number;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
}

interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { settings, loading: settingsLoading } = useSettings();

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    } else {
      setError('No se proporcionó un ID de pedido válido');
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrder = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Pedido no encontrado');
        } else {
          setError('Error al cargar el pedido');
        }
        return;
      }
      
      const orderData = await response.json();
      setOrder(orderData);
    } catch (err) {
      setError('Error de conexión al cargar el pedido');
    } finally {
      setLoading(false);
    }
  };

  const copyOrderId = async () => {
    if (order?.id) {
      try {
        await navigator.clipboard.writeText(order.id);
        setCopied(true);
        toast({
          title: "ID copiado",
          description: "El ID del pedido se copió al portapapeles",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast({
          title: "Error",
          description: "No se pudo copiar el ID",
          variant: "destructive",
        });
      }
    }
  };

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-600 font-medium">Cargando detalles del pedido...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="text-center shadow-xl border-0">
              <CardContent className="py-12">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops, algo salió mal</h2>
                <p className="text-gray-600 mb-8">{error || 'No se pudo encontrar el pedido'}</p>
                <div className="space-y-4">
                  <Button asChild className="bg-rose-600 hover:bg-rose-700">
                    <Link href="/tienda">Ir a la Tienda</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/">Volver al Inicio</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const orderDate = format(new Date(order.createdAt), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
  const shortOrderId = order.id.slice(-8).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Card with Success Animation */}
          <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-r from-white to-rose-50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-400/20 to-pink-600/20 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-400/20 to-orange-600/20 rounded-full transform -translate-x-12 translate-y-12"></div>
            
            <CardHeader className="text-center pb-8 relative">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-pulse">
                  <CheckCircle className="w-14 h-14 text-white drop-shadow-lg" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles className="w-4 h-4 text-yellow-800" />
                </div>
              </div>
              
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                ¡Pedido Confirmado!
              </CardTitle>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 inline-flex items-center gap-3 mx-auto shadow-lg border border-rose-100">
                <span className="text-sm text-gray-600 font-medium">ID del Pedido:</span>
                <Badge 
                  variant="outline" 
                  className="font-mono text-rose-700 bg-rose-50 border-rose-200 cursor-pointer hover:bg-rose-100 transition-colors"
                  onClick={copyOrderId}
                >
                  #{shortOrderId}
                  {copied ? (
                    <CheckIcon className="w-3 h-3 ml-2 text-green-600" />
                  ) : (
                    <Copy className="w-3 h-3 ml-2" />
                  )}
                </Badge>
              </div>
              
              <CardDescription className="text-lg text-gray-600 mt-4 font-medium">
                Gracias por tu compra. Hemos recibido tu pedido correctamente.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Resto del contenido se mantiene igual */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Summary */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-rose-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-white" />
                    </div>
                    Resumen del Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-gray-50/50 rounded-xl">
                        <div className="w-16 h-16 bg-white rounded-lg shadow-sm overflow-hidden flex-shrink-0">
                          <img 
                            src={item.image || "/placeholder.svg"} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow space-y-2">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">Cantidad: {item.quantity}</span>
                            <div className="flex items-center gap-2">
                              {item.discountType && (
                                <span className="text-sm text-gray-500 line-through">
                                  ${item.originalPrice.toFixed(2)}
                                </span>
                              )}
                              <span className="font-semibold text-rose-600">
                                ${item.finalPrice.toFixed(2)}
                              </span>
                              {item.discountType && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                  {item.discountType === "percentage" 
                                    ? `${item.discountValue}% OFF` 
                                    : `$${item.discountValue} OFF`}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            ${(item.finalPrice * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">${order.items.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Envío:</span>
                        <span className="font-medium">Gratis</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-rose-600">${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-rose-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    Información de Envío
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Datos del Cliente</h4>
                      <div className="bg-gray-50/50 rounded-xl p-4 space-y-2">
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-gray-600 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {order.customerEmail}
                        </p>
                        {order.customerPhone && (
                          <p className="text-gray-600">📱 {order.customerPhone}</p>
                        )}
                      </div>
                    </div>
                    
                    {order.shippingAddress && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Dirección de Envío</h4>
                        <div className="bg-gray-50/50 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="font-medium">{order.shippingAddress.address}</p>
                              <p className="text-gray-600">
                                {order.shippingAddress.city}, {order.shippingAddress.state}
                              </p>
                              <p className="text-gray-600">
                                CP: {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {order.notes && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Notas Especiales</h4>
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                          <p className="text-amber-800 text-sm leading-relaxed">{order.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Status */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    Estado del Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-semibold text-green-700">Pedido Confirmado</p>
                        <p className="text-sm text-gray-600">{orderDate}</p>
                      </div>
                    </div>
                    
                    <div className="border-l-2 border-gray-200 ml-1.5 pl-6 space-y-3">
                      <div className="flex items-center gap-3 opacity-50">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Preparando Envío</p>
                          <p className="text-xs text-gray-400">2-3 días hábiles</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 opacity-50">
                        <Package className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">En Tránsito</p>
                          <p className="text-xs text-gray-400">3-5 días hábiles</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 opacity-50">
                        <CheckCircle className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Entregado</p>
                          <p className="text-xs text-gray-400">Confirmación final</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    Próximos Pasos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Confirmación por Email</p>
                        <p className="text-xs text-gray-600">Se envió a {order.customerEmail}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Preparación del Pedido</p>
                        <p className="text-xs text-gray-600">Te notificaremos cuando esté listo</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Información de Envío</p>
                        <p className="text-xs text-gray-600">Recibirás el número de rastreo</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Support */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                      <Mail className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">¿Necesitas Ayuda?</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.
                      </p>
                      <Button asChild variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
                        <Link href="/contacto">
                          Contactar Soporte
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Continue Shopping */}
          <Card className="shadow-xl border-0 bg-gradient-to-r from-rose-500 to-pink-500 text-white">
            <CardContent className="py-8">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">¡Gracias por tu Compra!</h2>
                  <p className="text-rose-100 max-w-2xl mx-auto">
                    Tu pedido está siendo procesado con el mayor cuidado. Te mantendremos informado en cada paso del proceso de envío.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    asChild 
                    variant="secondary" 
                    className="bg-white text-rose-600 hover:bg-rose-50 shadow-lg"
                  >
                    <Link href="/tienda">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Seguir Comprando
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    variant="outline" 
                    className="border-white text-white hover:bg-white/10"
                  >
                    <Link href="/perfil">
                      <User className="w-4 h-4 mr-2" />
                      Ver Mis Pedidos
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
