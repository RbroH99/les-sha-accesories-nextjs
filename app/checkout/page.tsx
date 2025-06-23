"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useOrders } from "@/contexts/orders-context"
import { useSettings } from "@/contexts/settings-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Lock, ArrowLeft, AlertTriangle, Truck, DollarSign, Info } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const { createOrder } = useOrders()
  const { settings } = useSettings()
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    // Información personal
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",

    // Dirección de envío
    address: user?.defaultAddress?.address || "",
    city: user?.defaultAddress?.city || "",
    state: user?.defaultAddress?.state || "",
    zipCode: user?.defaultAddress?.zipCode || "",
    country: user?.defaultAddress?.country || "México",

    // Información de pago
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",

    // Notas adicionales
    notes: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Calcular totales con impuestos configurables
  const subtotal = total
  const taxAmount = settings.taxEnabled ? subtotal * (settings.taxRate / 100) : 0
  const finalTotal = subtotal + taxAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para realizar un pedido",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Simular procesamiento de pago solo si está habilitado
      if (settings.paymentEnabled) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      // Crear el pedido
      const orderData = {
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        customerEmail: formData.email,
        customerPhone: formData.phone,
        // Solo incluir shippingAddress si los envíos están habilitados
        ...(settings.shippingEnabled && {
          shippingAddress: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
          },
        }),
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal: subtotal,
        taxAmount: taxAmount,
        totalAmount: finalTotal,
        paymentMethod: settings.paymentEnabled ? "online" : "offline",
        notes: formData.notes,
      }

      const orderId = await createOrder(orderData)

      toast({
        title: "¡Pedido confirmado!",
        description: `Tu pedido #${orderId.slice(-8)} ha sido creado exitosamente.`,
      })

      clearCart()
      router.push(`/pedido-confirmado?orderId=${orderId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al procesar tu pedido. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    router.push("/carrito")
    return null
  }

  if (!user) {
    router.push("/login")
    return null
  }

  // Verificar si faltan datos del usuario
  const missingUserData = !user.firstName || !user.lastName || !user.phone
  const missingAddressData =
    settings.shippingEnabled &&
    (!user.defaultAddress?.address ||
      !user.defaultAddress?.city ||
      !user.defaultAddress?.state ||
      !user.defaultAddress?.zipCode)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/carrito">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Carrito
            </Link>
          </Button>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 font-playfair">Finalizar Compra</h1>
        </div>

        {/* Alerta de envíos deshabilitados */}
        {!settings.shippingEnabled && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Envíos temporalmente suspendidos:</strong> {settings.shippingMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Alerta de pagos deshabilitados */}
        {!settings.paymentEnabled && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Pagos en línea deshabilitados:</strong> {settings.paymentMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Alerta de datos faltantes */}
        {(missingUserData || missingAddressData) && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Información incompleta:</strong> Por favor completa los siguientes campos para continuar.
              {missingUserData && " Faltan datos personales (nombre y apellidos)."}
              {missingAddressData && " Falta dirección de envío."}
              <Link href="/perfil" className="ml-2 underline font-medium">
                Actualizar en mi perfil
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulario de Checkout */}
            <div className="space-y-6">
              {/* Información Personal */}
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Nombre *</Label>
                      <Input
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Apellidos *</Label>
                      <Input
                        id="lastName"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Tus apellidos"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+52 123 456 7890"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Dirección de Envío - Solo si los envíos están habilitados */}
              {settings.shippingEnabled && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Truck className="w-5 h-5 mr-2" />
                      Dirección de Envío
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address">Dirección *</Label>
                      <Input
                        id="address"
                        required
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Calle, número, colonia"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">Ciudad *</Label>
                        <Input
                          id="city"
                          required
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">Estado *</Label>
                        <Input
                          id="state"
                          required
                          value={formData.state}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="zipCode">Código Postal *</Label>
                        <Input
                          id="zipCode"
                          required
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange("zipCode", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">País *</Label>
                        <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="México">México</SelectItem>
                            <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                            <SelectItem value="Canadá">Canadá</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Información de Pago - Solo si los pagos están habilitados */}
              {settings.paymentEnabled && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Información de Pago
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="cardName">Nombre en la Tarjeta *</Label>
                      <Input
                        id="cardName"
                        required
                        value={formData.cardName}
                        onChange={(e) => handleInputChange("cardName", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardNumber">Número de Tarjeta *</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        required
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Fecha de Vencimiento *</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/AA"
                          required
                          value={formData.expiryDate}
                          onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV *</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          required
                          value={formData.cvv}
                          onChange={(e) => handleInputChange("cvv", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Lock className="w-4 h-4 mr-2" />
                      Tu información está segura y encriptada
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notas Adicionales */}
              <Card>
                <CardHeader>
                  <CardTitle>Notas Adicionales</CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="notes">Instrucciones especiales (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder={
                      settings.shippingEnabled
                        ? "Ej: Dejar en la puerta, llamar antes de entregar..."
                        : "Ej: Horario preferido para contacto, instrucciones especiales..."
                    }
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Resumen del Pedido */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Envío</span>
                      <span>{settings.shippingEnabled ? "Gratis" : "N/A"}</span>
                    </div>
                    {settings.taxEnabled && (
                      <div className="flex justify-between">
                        <span>
                          {settings.taxName} ({settings.taxRate}%)
                        </span>
                        <span>${taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {!settings.taxEnabled && (
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Impuestos</span>
                        <span>No aplicables</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-rose-600">${finalTotal.toFixed(2)}</span>
                  </div>

                  {/* Información adicional sobre impuestos */}
                  {settings.taxEnabled && (
                    <div className="flex items-start space-x-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>
                        El {settings.taxName} del {settings.taxRate}% está incluido en el total final.
                      </span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-rose-600 hover:bg-rose-700"
                    size="lg"
                    disabled={isProcessing || missingUserData || missingAddressData}
                  >
                    {isProcessing
                      ? "Procesando..."
                      : settings.paymentEnabled
                        ? "Confirmar y Pagar"
                        : "Confirmar Pedido"}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Al confirmar tu pedido, aceptas nuestros términos y condiciones
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
