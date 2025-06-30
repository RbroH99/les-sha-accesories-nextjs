"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

export default function CarritoPage() {
  const { items, total, updateQuantity, removeItem, clearCart, loading } = useCart();

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(id);
    } else {
      await updateQuantity(id, newQuantity);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto text-center py-16">
                    <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Cargando tu carrito...</h1>
                </div>
            </div>
        </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-16">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h1>
            <p className="text-gray-600 mb-8">
              Descubre nuestros hermosos productos artesanales y agrega algunos a tu carrito.
            </p>
            <Button asChild className="bg-rose-600 hover:bg-rose-700">
              <Link href="/tienda">Explorar Tienda</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/tienda">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continuar Comprando
            </Link>
          </Button>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 font-playfair">Carrito de Compras</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="bg-white">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Imagen del producto */}
                    <div className="flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                      />
                    </div>

                    {/* Información del producto */}
                    <div className="flex-1 min-w-0">
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">{item.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 capitalize">{item.category}</p>
                          <p className="text-lg font-bold text-rose-600">${item.price.toFixed(2)}</p>
                        </div>

                        {/* Controles de cantidad - Layout móvil */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="px-3 py-1 text-center min-w-[2.5rem] text-sm">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 self-start sm:self-center"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            <span className="text-sm">Eliminar</span>
                          </Button>
                        </div>

                        {/* Subtotal */}
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-right font-semibold text-gray-900">
                            Subtotal: ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-center sm:justify-end">
              <Button
                variant="outline"
                onClick={async () => await clearCart()}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vaciar Carrito
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-white sticky top-8">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>Gratis</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Impuestos</span>
                    <span>Calculados en checkout</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-rose-600">${total.toFixed(2)}</span>
                </div>

                <Button asChild className="w-full bg-rose-600 hover:bg-rose-700" size="lg">
                  <Link href="/checkout">Proceder al Checkout</Link>
                </Button>

                <p className="text-xs text-gray-500 text-center">Envío gratuito en pedidos superiores a $50</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
