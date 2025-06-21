"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import { useOrders } from "@/contexts/orders-context"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, ShoppingBag, Heart, Package, MapPin, Phone, AtSign } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function PerfilPage() {
  const { user, logout, updateProfile } = useAuth()
  const { items } = useCart()
  const { favorites } = useFavorites()
  const { userOrders } = useOrders()
  const { toast } = useToast()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "México",
  })
  const [activeTab, setActiveTab] = useState("profile")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else {
      setFormData({
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        address: user.defaultAddress?.address || "",
        city: user.defaultAddress?.city || "",
        state: user.defaultAddress?.state || "",
        zipCode: user.defaultAddress?.zipCode || "",
        country: user.defaultAddress?.country || "México",
      })
    }
  }, [user, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async () => {
    if (!user) return

    const updateData = {
      username: formData.username,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      defaultAddress: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      },
    }

    const success = await updateProfile(updateData)

    if (success) {
      toast({
        title: "Perfil actualizado",
        description: "Tus cambios han sido guardados exitosamente",
      })
      setIsEditing(false)
    } else {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil. El nombre de usuario podría estar en uso.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "aceptado":
        return "bg-blue-100 text-blue-800"
      case "en_proceso":
        return "bg-purple-100 text-purple-800"
      case "enviado":
        return "bg-green-100 text-green-800"
      case "entregado":
        return "bg-green-100 text-green-800"
      case "cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pendiente":
        return "Pendiente"
      case "aceptado":
        return "Aceptado"
      case "en_proceso":
        return "En Proceso"
      case "enviado":
        return "Enviado"
      case "entregado":
        return "Entregado"
      case "cancelado":
        return "Cancelado"
      default:
        return status
    }
  }

  const handleViewOrderDetails = (order: any) => {
    setSelectedOrder(order)
    setIsOrderDialogOpen(true)
  }

  if (!user) {
    return null
  }

  const totalCartValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 font-playfair">Mi Perfil</h1>
              <p className="text-gray-600 mt-2">Gestiona tu información personal y preferencias</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Información Personal</TabsTrigger>
                <TabsTrigger value="orders">Mis Pedidos ({userOrders.length})</TabsTrigger>
                <TabsTrigger value="activity">Actividad</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Información Personal */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <User className="w-5 h-5 mr-2" />
                          Información Personal
                        </CardTitle>
                        <CardDescription>Actualiza tu información de perfil</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Nombre de Usuario *</Label>
                          <div className="relative">
                            <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              id="username"
                              value={formData.username}
                              onChange={(e) => handleInputChange("username", e.target.value)}
                              disabled={!isEditing}
                              className="pl-10"
                              placeholder="Tu nombre de usuario"
                            />
                          </div>
                          <p className="text-xs text-gray-500">Este es tu identificador único en la plataforma</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">Nombre</Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) => handleInputChange("firstName", e.target.value)}
                              disabled={!isEditing}
                              placeholder="Tu nombre"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Apellidos</Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) => handleInputChange("lastName", e.target.value)}
                              disabled={!isEditing}
                              placeholder="Tus apellidos"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input id="email" value={user.email} disabled className="pl-10" />
                          </div>
                          <p className="text-xs text-gray-500">El email no se puede modificar</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Teléfono</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) => handleInputChange("phone", e.target.value)}
                              disabled={!isEditing}
                              className="pl-10"
                              placeholder="+52 123 456 7890"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Tipo de Cuenta</Label>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {user.role === "admin" ? "Administrador" : "Usuario"}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          {isEditing ? (
                            <>
                              <Button onClick={handleSaveProfile} className="bg-rose-600 hover:bg-rose-700">
                                Guardar Cambios
                              </Button>
                              <Button variant="outline" onClick={() => setIsEditing(false)}>
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <Button onClick={() => setIsEditing(true)} variant="outline">
                              Editar Perfil
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Dirección por Defecto */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <MapPin className="w-5 h-5 mr-2" />
                          Dirección de Envío por Defecto
                        </CardTitle>
                        <CardDescription>Esta dirección se usará automáticamente en tus pedidos</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="address">Dirección</Label>
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => handleInputChange("address", e.target.value)}
                            disabled={!isEditing}
                            placeholder="Calle, número, colonia"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">Ciudad</Label>
                            <Input
                              id="city"
                              value={formData.city}
                              onChange={(e) => handleInputChange("city", e.target.value)}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">Estado</Label>
                            <Input
                              id="state"
                              value={formData.state}
                              onChange={(e) => handleInputChange("state", e.target.value)}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="zipCode">Código Postal</Label>
                            <Input
                              id="zipCode"
                              value={formData.zipCode}
                              onChange={(e) => handleInputChange("zipCode", e.target.value)}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country">País</Label>
                            <Input
                              id="country"
                              value={formData.country}
                              onChange={(e) => handleInputChange("country", e.target.value)}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Acciones Rápidas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button asChild className="w-full" variant="outline">
                          <a href="/carrito">Ver Carrito</a>
                        </Button>
                        <Button asChild className="w-full" variant="outline">
                          <a href="/favoritos">Ver Favoritos</a>
                        </Button>
                        <Button asChild className="w-full" variant="outline">
                          <a href="/tienda">Explorar Tienda</a>
                        </Button>
                        {user.role === "admin" && (
                          <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                            <a href="/admin/dashboard">Panel de Admin</a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-red-600">Zona de Peligro</CardTitle>
                        <CardDescription>Acciones irreversibles</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button onClick={handleLogout} variant="destructive" className="w-full">
                          Cerrar Sesión
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mis Pedidos</CardTitle>
                    <CardDescription>Historial de todos tus pedidos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userOrders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No tienes pedidos aún</p>
                        <Button asChild className="mt-4">
                          <a href="/tienda">Explorar Tienda</a>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userOrders.map((order) => (
                          <Card key={order.id} className="border border-gray-200">
                            <CardContent className="p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">Pedido #{order.id.slice(-8)}</span>
                                    <Badge className={getStatusColor(order.status)}>
                                      {getStatusText(order.status)}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {new Date(order.createdAt).toLocaleDateString("es-ES", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {order.items.length} producto{order.items.length !== 1 ? "s" : ""}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-rose-600">${order.totalAmount.toFixed(2)}</p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => handleViewOrderDetails(order)}
                                  >
                                    Ver Detalles
                                  </Button>
                                </div>
                              </div>

                              {order.items.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                  <div className="flex gap-2 overflow-x-auto">
                                    {order.items.slice(0, 3).map((item, index) => (
                                      <div key={index} className="flex-shrink-0 text-xs text-gray-600">
                                        {item.name} (x{item.quantity})
                                      </div>
                                    ))}
                                    {order.items.length > 3 && (
                                      <span className="text-xs text-gray-500">+{order.items.length - 3} más</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                {/* Estadísticas de Actividad */}
                <Card>
                  <CardHeader>
                    <CardTitle>Actividad de la Cuenta</CardTitle>
                    <CardDescription>Resumen de tu actividad en la tienda</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Link
                        href="/carrito"
                        className="flex items-center space-x-3 p-4 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{items.length}</p>
                          <p className="text-sm text-gray-600">Productos en carrito</p>
                          <p className="text-xs text-gray-500">${totalCartValue.toFixed(2)} total</p>
                        </div>
                      </Link>

                      <Link
                        href="/favoritos"
                        className="flex items-center space-x-3 p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                          <Heart className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
                          <p className="text-sm text-gray-600">Productos favoritos</p>
                        </div>
                      </Link>

                      <Link
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setActiveTab("orders")
                        }}
                        className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer w-full text-left"
                      >
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{userOrders.length}</p>
                          <p className="text-sm text-gray-600">Pedidos realizados</p>
                        </div>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Modal de Detalles del Pedido */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Pedido #{selectedOrder?.id.slice(-8)}</DialogTitle>
            <DialogDescription>
              Información completa del pedido realizado el{" "}
              {selectedOrder &&
                new Date(selectedOrder.createdAt).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Estado del Pedido */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">Estado del Pedido</h3>
                  <Badge className={getStatusColor(selectedOrder.status)} size="lg">
                    {getStatusText(selectedOrder.status)}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total del Pedido</p>
                  <p className="text-2xl font-bold text-rose-600">${selectedOrder.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              {/* Información de Envío - Solo mostrar si hay dirección */}
              {selectedOrder.shippingAddress && selectedOrder.shippingAddress.address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Dirección de Envío
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">{selectedOrder.customerName}</p>
                      <p>{selectedOrder.shippingAddress.address}</p>
                      <p>
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{" "}
                        {selectedOrder.shippingAddress.zipCode}
                      </p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                      {selectedOrder.customerPhone && (
                        <p className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          {selectedOrder.customerPhone}
                        </p>
                      )}
                      {selectedOrder.customerEmail && (
                        <p className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          {selectedOrder.customerEmail}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Información de contacto para pedidos sin envío */}
              {(!selectedOrder.shippingAddress || !selectedOrder.shippingAddress.address) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Información de Contacto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">{selectedOrder.customerName}</p>
                      {selectedOrder.customerEmail && (
                        <p className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          {selectedOrder.customerEmail}
                        </p>
                      )}
                      {selectedOrder.customerPhone && (
                        <p className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          {selectedOrder.customerPhone}
                        </p>
                      )}
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800 font-medium">Pedido sin envío</p>
                        <p className="text-xs text-blue-600">
                          Este pedido será entregado en persona o retirado en tienda
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Productos del Pedido */}
              <Card>
                <CardHeader>
                  <CardTitle>Productos Ordenados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.image ? (
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                          <p className="text-sm text-gray-600">Precio unitario: ${item.price.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Resumen de Costos */}
                  <div className="mt-6 pt-4 border-t space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${(selectedOrder.totalAmount - (selectedOrder.shippingCost || 0)).toFixed(2)}</span>
                    </div>
                    {selectedOrder.shippingCost > 0 && (
                      <div className="flex justify-between">
                        <span>Envío:</span>
                        <span>${selectedOrder.shippingCost.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span className="text-rose-600">${selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información Adicional */}
              {selectedOrder.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notas del Pedido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
