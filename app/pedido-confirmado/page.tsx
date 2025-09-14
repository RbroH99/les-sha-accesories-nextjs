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

export default function PedidoConfirmadoPage() {
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
              
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-rose-200">
                <span className="text-sm font-medium text-gray-600">Pedido</span>
                <Badge variant="secondary" className="font-mono text-rose-700 bg-rose-100 hover:bg-rose-200">
                  #{shortOrderId}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyOrderId}
                  className="h-6 w-6 p-0 hover:bg-rose-100"
                >
                  {copied ? (
                    <CheckIcon className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3 text-gray-400" />
                  )}
                </Button>
              </div>
              
              <CardDescription className="text-lg text-gray-600 mt-4">
                Gracias <span className="font-semibold text-rose-600">{order.customerName}</span>, tu pedido ha sido recibido y está siendo procesado.
              </CardDescription>
              
              <p className="text-sm text-gray-500 mt-2">
                Creado el {orderDate}
              </p>
            </CardHeader>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg">
                    <User className="w-5 h-5 mr-2 text-rose-600" />
                    Información del Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre:</span>
                    <span className="font-medium">{order.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{order.customerEmail}</span>
                  </div>
                  {order.customerPhone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Teléfono:</span>
                      <span className="font-medium">{order.customerPhone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shipping Address */}
              {order.shippingAddress && settings.shippingEnabled && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <MapPin className="w-5 h-5 mr-2 text-rose-600" />
                      Dirección de Envío
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-700">
                      <p className="font-medium">{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                      <p>{order.shippingAddress.zipCode}, {order.shippingAddress.country}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Items */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg">
                    <ShoppingBag className="w-5 h-5 mr-2 text-rose-600" />
                    Artículos del Pedido ({order.items.length} {order.items.length === 1 ? 'artículo' : 'artículos'})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => (e.currentTarget.src = '/placeholder.jpg')}
                            />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                          {item.discountValue && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {item.discountType === 'percentage' ? `${item.discountValue}% OFF` : `$${item.discountValue} OFF`}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          {item.discountValue && (
                            <p className="text-sm text-gray-400 line-through">
                              ${(item.originalPrice * item.quantity).toFixed(2)}
                            </p>
                          )}
                          <p className="font-bold text-rose-600">
                            ${(item.finalPrice * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Notes */}
              {order.notes && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Notas del Pedido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{order.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm sticky top-8">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg">
                    <CreditCard className="w-5 h-5 mr-2 text-rose-600" />
                    Resumen del Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Total Pagado</span>
                      <span className="font-bold text-2xl text-rose-600">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Estado</span>
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                        {order.status}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Next Steps */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-rose-600" />
                      Próximos Pasos
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          1
                        </div>
                        <div>
                          <p className="font-medium text-sm">Confirmación por email</p>
                          <p className="text-xs text-gray-600">En los próximos minutos</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          2
                        </div>
                        <div>
                          <p className="font-medium text-sm">Preparación</p>
                          <p className="text-xs text-gray-600">Con cuidado artesanal</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          3
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {settings.shippingEnabled ? 'Envío' : 'Contacto'}
                          </p>
                          <p className="text-xs text-gray-600">
                            {settings.shippingEnabled 
                              ? settings.shippingMessage || '3-5 días hábiles'
                              : 'Nos pondremos en contacto'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Info Cards */}
              <div className="grid gap-4">
                <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-blue-100">
                  <CardContent className="flex items-center space-x-3 p-4">
                    <Mail className="w-8 h-8 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 text-sm">Email de confirmación</p>
                      <p className="text-xs text-gray-600">Revisa tu bandeja de entrada</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-gradient-to-r from-amber-50 to-orange-100">
                  <CardContent className="flex items-center space-x-3 p-4">
                    <Package className="w-8 h-8 text-amber-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 text-sm">Tiempo de entrega</p>
                      <p className="text-xs text-gray-600">
                        {settings.shippingEnabled 
                          ? settings.shippingMessage || '3-5 días hábiles'
                          : 'Te contactaremos pronto'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button asChild className="w-full bg-rose-600 hover:bg-rose-700 shadow-lg" size="lg">
                  <Link href="/tienda">
                    Continuar Comprando
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full shadow-lg" size="lg">
                  <Link href="/">Volver al Inicio</Link>
                </Button>
              </div>

              {/* Contact Support */}
              <Card className="shadow-lg border-0 bg-gradient-to-r from-rose-50 to-pink-100 text-center">
                <CardContent className="py-6">
                  <p className="text-sm text-gray-600 mb-3">
                    ¿Tienes alguna pregunta sobre tu pedido?
                  </p>
                  <Button asChild variant="link" className="text-rose-600 font-semibold">
                    <Link href="/contacto">Contáctanos</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
