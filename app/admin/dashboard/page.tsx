"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useOrders } from "@/contexts/orders-context"
import { useSettings } from "@/contexts/settings-context"
import { useCategories } from "@/contexts/categories-context"
import { useDiscounts } from "@/contexts/discounts-context"
import {
  Plus,
  Edit,
  Trash2,
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  LogOut,
  X,
  Eye,
  Settings,
  Truck,
  AlertTriangle,
  Tag,
  Percent,
  Calendar,
  Search,
  Filter,
} from "lucide-react"
import Image from "next/image"

interface Product {
  id: number
  name: string
  price: number
  images: string[]
  categoryId: string
  tagIds: string[]
  description: string
  story?: string
  materials?: string[]
  dimensions?: string
  care?: string
  warranty?: {
    hasWarranty: boolean
    duration?: number
    unit?: "days" | "months" | "years"
  }
  discountId?: string
  stock: number
  isNew: boolean
}

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Collar Luna Dorada",
    price: 45.0,
    images: [
      "/placeholder.svg?height=300&width=300",
      "/placeholder.svg?height=300&width=300",
      "/placeholder.svg?height=300&width=300",
    ],
    categoryId: "cat_1",
    tagIds: ["tag_1", "tag_4"],
    description: "Elegante collar con dije de luna en baño de oro",
    story: "Inspirado en las noches de luna llena, este collar nació de una caminata nocturna por la playa...",
    materials: ["Baño de oro 18k", "Aleación hipoalergénica", "Cadena de acero inoxidable"],
    dimensions: "Dije: 2.5cm x 2cm, Cadena: 45cm (ajustable)",
    care: "Evitar contacto con perfumes y agua. Limpiar con paño suave.",
    warranty: {
      hasWarranty: true,
      duration: 6,
      unit: "months",
    },
    stock: 15,
    isNew: true,
  },
  {
    id: 2,
    name: "Aretes Cristal Rosa",
    price: 28.0,
    images: ["/placeholder.svg?height=300&width=300", "/placeholder.svg?height=300&width=300"],
    categoryId: "cat_2",
    tagIds: ["tag_1"],
    description: "Delicados aretes con cristales rosados",
    warranty: {
      hasWarranty: false,
    },
    stock: 8,
    isNew: false,
  },
  {
    id: 3,
    name: "Pulsera Perlas Naturales",
    price: 35.0,
    images: ["/placeholder.svg?height=300&width=300"],
    categoryId: "cat_3",
    tagIds: ["tag_3"],
    description: "Pulsera artesanal con perlas naturales",
    warranty: {
      hasWarranty: true,
      duration: 1,
      unit: "years",
    },
    stock: 12,
    isNew: true,
  },
]

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [viewingOrder, setViewingOrder] = useState<any>(null)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [editingTag, setEditingTag] = useState<any>(null)
  const [editingDiscount, setEditingDiscount] = useState<any>(null)

  // Filtros para productos
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("")
  const [selectedTagFilter, setSelectedTagFilter] = useState("")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [stockRange, setStockRange] = useState({ min: "", max: "" })

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Opciones para elementos por página
  const itemsPerPageOptions = [5, 10, 20, 50]

  // Calcular productos paginados
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  // Resetear página cuando cambien los filtros o elementos por página
  useEffect(() => {
    setCurrentPage(1)
  }, [filteredProducts.length, itemsPerPage])

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    categoryId: "",
    tagIds: [] as string[],
    description: "",
    story: "",
    materials: "",
    dimensions: "",
    care: "",
    hasWarranty: false,
    warrantyDuration: "",
    warrantyUnit: "months" as "days" | "months" | "years",
    discountId: "",
    stock: "",
    images: [""],
    isNew: false,
  })

  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  })

  const [tagFormData, setTagFormData] = useState({
    name: "",
    color: "#8B5CF6",
    isActive: true,
  })

  const [discountFormData, setDiscountFormData] = useState({
    name: "",
    description: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    reason: "",
    startDate: "",
    endDate: "",
    isActive: true,
    isGeneric: false,
    productIds: [] as number[],
  })

  const { orders, updateOrderStatus } = useOrders()
  const { settings, updateSettings } = useSettings()
  const { categories, tags, createCategory, updateCategory, deleteCategory, createTag, updateTag, deleteTag } =
    useCategories()
  const { discounts, createDiscount, updateDiscount, deleteDiscount, calculateDiscountedPrice } = useDiscounts()
  const [activeTab, setActiveTab] = useState("products")

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login")
    }
  }, [user, router])

  // Filtrar productos
  useEffect(() => {
    let filtered = products

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Filtro por categoría
    if (selectedCategoryFilter) {
      filtered = filtered.filter((product) => product.categoryId === selectedCategoryFilter)
    }

    // Filtro por tag
    if (selectedTagFilter) {
      filtered = filtered.filter((product) => product.tagIds?.includes(selectedTagFilter))
    }

    // Filtro por rango de precios
    if (priceRange.min) {
      filtered = filtered.filter((product) => product.price >= Number.parseFloat(priceRange.min))
    }
    if (priceRange.max) {
      filtered = filtered.filter((product) => product.price <= Number.parseFloat(priceRange.max))
    }

    // Filtro por rango de stock
    if (stockRange.min) {
      filtered = filtered.filter((product) => product.stock >= Number.parseInt(stockRange.min))
    }
    if (stockRange.max) {
      filtered = filtered.filter((product) => product.stock <= Number.parseInt(stockRange.max))
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, selectedCategoryFilter, selectedTagFilter, priceRange, stockRange])

  // Calcular productos paginados

  // Resetear página cuando cambien los filtros

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? value : img)),
    }))
  }

  const addImageField = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }))
  }

  const removeImageField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId) ? prev.tagIds.filter((id) => id !== tagId) : [...prev.tagIds, tagId],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const productData = {
      name: formData.name,
      price: Number.parseFloat(formData.price),
      categoryId: formData.categoryId,
      tagIds: formData.tagIds,
      description: formData.description,
      story: formData.story || undefined,
      materials: formData.materials ? formData.materials.split(",").map((m) => m.trim()) : undefined,
      dimensions: formData.dimensions || undefined,
      care: formData.care || undefined,
      warranty: {
        hasWarranty: formData.hasWarranty,
        duration: formData.hasWarranty ? Number.parseInt(formData.warrantyDuration) : undefined,
        unit: formData.hasWarranty ? formData.warrantyUnit : undefined,
      },
      discountId: formData.discountId || undefined,
      stock: Number.parseInt(formData.stock),
      images: formData.images.filter((img) => img.trim() !== ""),
      isNew: formData.isNew,
    }

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...productData, id: editingProduct.id } : p)),
      )
      toast({
        title: "Producto actualizado",
        description: "El producto se actualizó correctamente",
      })
    } else {
      const newProduct = {
        ...productData,
        id: Math.max(...products.map((p) => p.id)) + 1,
      }
      setProducts((prev) => [...prev, newProduct])
      toast({
        title: "Producto creado",
        description: "El nuevo producto se agregó correctamente",
      })
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      categoryId: "",
      tagIds: [],
      description: "",
      story: "",
      materials: "",
      dimensions: "",
      care: "",
      hasWarranty: false,
      warrantyDuration: "",
      warrantyUnit: "months",
      discountId: "",
      stock: "",
      images: [""],
      isNew: false,
    })
    setEditingProduct(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      categoryId: product.categoryId,
      tagIds: product.tagIds || [],
      description: product.description,
      story: product.story || "",
      materials: product.materials?.join(", ") || "",
      dimensions: product.dimensions || "",
      care: product.care || "",
      hasWarranty: product.warranty?.hasWarranty || false,
      warrantyDuration: product.warranty?.duration?.toString() || "",
      warrantyUnit: product.warranty?.unit || "months",
      discountId: product.discountId || "",
      stock: product.stock.toString(),
      images: product.images.length > 0 ? product.images : [""],
      isNew: product.isNew,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    toast({
      title: "Producto eliminado",
      description: "El producto se eliminó correctamente",
    })
  }

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    const success = await updateOrderStatus(orderId, newStatus as any)
    if (success) {
      toast({
        title: "Estado actualizado",
        description: "El estado del pedido se actualizó correctamente",
      })
    } else {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pedido",
        variant: "destructive",
      })
    }
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryFormData)
        toast({ title: "Categoría actualizada", description: "La categoría se actualizó correctamente" })
      } else {
        await createCategory(categoryFormData)
        toast({ title: "Categoría creada", description: "La nueva categoría se creó correctamente" })
      }
      setCategoryFormData({ name: "", description: "", isActive: true })
      setEditingCategory(null)
      setIsCategoryDialogOpen(false)
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar la categoría", variant: "destructive" })
    }
  }

  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingTag) {
        await updateTag(editingTag.id, tagFormData)
        toast({ title: "Tag actualizado", description: "El tag se actualizó correctamente" })
      } else {
        await createTag(tagFormData)
        toast({ title: "Tag creado", description: "El nuevo tag se creó correctamente" })
      }
      setTagFormData({ name: "", color: "#8B5CF6", isActive: true })
      setEditingTag(null)
      setIsTagDialogOpen(false)
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar el tag", variant: "destructive" })
    }
  }

  const handleDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const discountData = {
        ...discountFormData,
        value: Number.parseFloat(discountFormData.value),
        startDate: discountFormData.isGeneric ? undefined : discountFormData.startDate,
        endDate: discountFormData.isGeneric ? undefined : discountFormData.endDate,
      }

      if (editingDiscount) {
        await updateDiscount(editingDiscount.id, discountData)
        toast({ title: "Descuento actualizado", description: "El descuento se actualizó correctamente" })
      } else {
        await createDiscount(discountData)
        toast({ title: "Descuento creado", description: "El nuevo descuento se creó correctamente" })
      }
      setDiscountFormData({
        name: "",
        description: "",
        type: "percentage",
        value: "",
        reason: "",
        startDate: "",
        endDate: "",
        isActive: true,
        isGeneric: false,
        productIds: [],
      })
      setEditingDiscount(null)
      setIsDiscountDialogOpen(false)
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar el descuento", variant: "destructive" })
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategoryFilter("")
    setSelectedTagFilter("")
    setPriceRange({ min: "", max: "" })
    setStockRange({ min: "", max: "" })
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

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!user || user.role !== "admin") {
    return null
  }

  const stats = {
    totalProducts: products.length,
    totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
    lowStock: products.filter((p) => p.stock < 10).length,
    newProducts: products.filter((p) => p.isNew).length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.status === "pendiente").length,
    totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    totalCategories: categories.length,
    totalTags: tags.length,
    activeDiscounts: discounts.filter((d) => d.isActive).length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-gray-600">Bienvenido, {user.name}</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("products")}
              className={`py-4 px-1 text-sm font-medium border-b-2 ${
                activeTab === "products"
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Productos
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`py-4 px-1 text-sm font-medium border-b-2 ${
                activeTab === "categories"
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Categorías & Tags
            </button>
            <button
              onClick={() => setActiveTab("discounts")}
              className={`py-4 px-1 text-sm font-medium border-b-2 ${
                activeTab === "discounts"
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Descuentos
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`py-4 px-1 text-sm font-medium border-b-2 ${
                activeTab === "orders"
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pedidos ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-4 px-1 text-sm font-medium border-b-2 ${
                activeTab === "settings"
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Configuración
            </button>
          </nav>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProducts}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.lowStock}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Productos Nuevos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.newProducts}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros de Productos */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Filter className="w-5 h-5 mr-2" />
                    Filtros de Productos
                  </CardTitle>
                  <Button variant="outline" onClick={clearFilters}>
                    Limpiar Filtros
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select
                    value={selectedCategoryFilter || "all"}
                    onValueChange={(value) => setSelectedCategoryFilter(value === "all" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categories
                        .filter((cat) => cat.isActive)
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedTagFilter || "all"}
                    onValueChange={(value) => setSelectedTagFilter(value === "all" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tags</SelectItem>
                      {tags
                        .filter((tag) => tag.isActive)
                        .map((tag) => (
                          <SelectItem key={tag.id} value={tag.id}>
                            {tag.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <div className="flex space-x-2">
                    <Input
                      placeholder="Precio mín"
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                    />
                    <Input
                      placeholder="Precio máx"
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Input
                      placeholder="Stock mín"
                      type="number"
                      value={stockRange.min}
                      onChange={(e) => setStockRange((prev) => ({ ...prev, min: e.target.value }))}
                    />
                    <Input
                      placeholder="Stock máx"
                      type="number"
                      value={stockRange.max}
                      onChange={(e) => setStockRange((prev) => ({ ...prev, max: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Mostrando {filteredProducts.length} de {products.length} productos
                </div>
              </CardContent>
            </Card>

            {/* Products Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestión de Productos</CardTitle>
                    <CardDescription>Administra tu inventario de bisutería artesanal</CardDescription>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-rose-600 hover:bg-rose-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Producto
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
                        <DialogDescription>
                          {editingProduct
                            ? "Modifica los datos del producto"
                            : "Agrega un nuevo producto a tu inventario"}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Información Básica */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Información Básica</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">Nombre del Producto *</Label>
                              <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="price">Precio *</Label>
                              <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => handleInputChange("price", e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="categoryId">Categoría *</Label>
                              <Select
                                value={formData.categoryId}
                                onValueChange={(value) => handleInputChange("categoryId", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories
                                    .filter((cat) => cat.isActive)
                                    .map((category) => (
                                      <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="stock">Stock *</Label>
                              <Input
                                id="stock"
                                type="number"
                                value={formData.stock}
                                onChange={(e) => handleInputChange("stock", e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {tags
                                .filter((tag) => tag.isActive)
                                .map((tag) => (
                                  <div key={tag.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`tag-${tag.id}`}
                                      checked={formData.tagIds.includes(tag.id)}
                                      onCheckedChange={() => handleTagToggle(tag.id)}
                                    />
                                    <Label htmlFor={`tag-${tag.id}`} className="text-sm" style={{ color: tag.color }}>
                                      {tag.name}
                                    </Label>
                                  </div>
                                ))}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="discountId">Descuento Asociado</Label>
                            <Select
                              value={formData.discountId || "none"}
                              onValueChange={(value) => handleInputChange("discountId", value === "none" ? "" : value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sin descuento" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Sin descuento</SelectItem>
                                {discounts
                                  .filter((discount) => discount.isActive)
                                  .map((discount) => (
                                    <SelectItem key={discount.id} value={discount.id}>
                                      {discount.name} (
                                      {discount.type === "percentage" ? `${discount.value}%` : `$${discount.value}`})
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="description">Descripción *</Label>
                            <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) => handleInputChange("description", e.target.value)}
                              required
                              rows={3}
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="isNew"
                              checked={formData.isNew}
                              onCheckedChange={(checked) => handleInputChange("isNew", checked)}
                            />
                            <Label htmlFor="isNew">Marcar como producto nuevo</Label>
                          </div>
                        </div>

                        {/* Garantía */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Garantía</h3>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="hasWarranty"
                              checked={formData.hasWarranty}
                              onCheckedChange={(checked) => handleInputChange("hasWarranty", checked)}
                            />
                            <Label htmlFor="hasWarranty">Este producto tiene garantía</Label>
                          </div>

                          {formData.hasWarranty && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="warrantyDuration">Duración de la Garantía *</Label>
                                <Input
                                  id="warrantyDuration"
                                  type="number"
                                  value={formData.warrantyDuration}
                                  onChange={(e) => handleInputChange("warrantyDuration", e.target.value)}
                                  required={formData.hasWarranty}
                                />
                              </div>
                              <div>
                                <Label htmlFor="warrantyUnit">Unidad *</Label>
                                <Select
                                  value={formData.warrantyUnit}
                                  onValueChange={(value) => handleInputChange("warrantyUnit", value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="days">Días</SelectItem>
                                    <SelectItem value="months">Meses</SelectItem>
                                    <SelectItem value="years">Años</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Imágenes */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Imágenes del Producto</h3>
                            <Button type="button" onClick={addImageField} variant="outline" size="sm">
                              <Plus className="w-4 h-4 mr-2" />
                              Agregar Imagen
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {formData.images.map((image, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Input
                                  type="url"
                                  placeholder={`URL de imagen ${index + 1}`}
                                  value={image}
                                  onChange={(e) => handleImageChange(index, e.target.value)}
                                />
                                {formData.images.length > 1 && (
                                  <Button
                                    type="button"
                                    onClick={() => removeImageField(index)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Información Detallada */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Información Detallada (Opcional)</h3>

                          <div>
                            <Label htmlFor="story">Historia del Producto</Label>
                            <Textarea
                              id="story"
                              value={formData.story}
                              onChange={(e) => handleInputChange("story", e.target.value)}
                              placeholder="Cuenta la historia detrás de esta pieza..."
                              rows={4}
                            />
                          </div>

                          <div>
                            <Label htmlFor="materials">Materiales (separados por comas)</Label>
                            <Input
                              id="materials"
                              value={formData.materials}
                              onChange={(e) => handleInputChange("materials", e.target.value)}
                              placeholder="Ej: Plata 925, Cristales naturales, Hilo de seda"
                            />
                          </div>

                          <div>
                            <Label htmlFor="dimensions">Dimensiones</Label>
                            <Input
                              id="dimensions"
                              value={formData.dimensions}
                              onChange={(e) => handleInputChange("dimensions", e.target.value)}
                              placeholder="Ej: 2.5cm x 2cm, Cadena: 45cm"
                            />
                          </div>

                          <div>
                            <Label htmlFor="care">Instrucciones de Cuidado</Label>
                            <Textarea
                              id="care"
                              value={formData.care}
                              onChange={(e) => handleInputChange("care", e.target.value)}
                              placeholder="Ej: Evitar contacto con agua, limpiar con paño suave..."
                              rows={3}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4 border-t">
                          <Button type="button" variant="outline" onClick={resetForm}>
                            Cancelar
                          </Button>
                          <Button type="submit" className="bg-rose-600 hover:bg-rose-700">
                            {editingProduct ? "Actualizar" : "Crear"} Producto
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Imagen</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Descuento</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Garantía</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((product) => {
                      const category = categories.find((cat) => cat.id === product.categoryId)
                      const productTags = tags.filter((tag) => product.tagIds?.includes(tag.id))
                      const discount = discounts.find((d) => d.id === product.discountId)
                      const { price: discountedPrice } = calculateDiscountedPrice(product.price, product.id)

                      return (
                        <TableRow key={product.id} className="cursor-pointer hover:bg-gray-50">
                          <TableCell onClick={() => setViewingProduct(product)}>
                            <Image
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              width={50}
                              height={50}
                              className="rounded-lg object-cover"
                            />
                          </TableCell>
                          <TableCell onClick={() => setViewingProduct(product)}>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-600 line-clamp-1">{product.description}</p>
                              <p className="text-xs text-gray-500">
                                {product.images.length} imagen{product.images.length !== 1 ? "es" : ""}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell onClick={() => setViewingProduct(product)}>
                            <Badge variant="secondary" className="capitalize">
                              {category?.name || "Sin categoría"}
                            </Badge>
                          </TableCell>
                          <TableCell onClick={() => setViewingProduct(product)}>
                            <div className="flex flex-wrap gap-1">
                              {productTags.map((tag) => (
                                <Badge
                                  key={tag.id}
                                  variant="outline"
                                  className="text-xs"
                                  style={{ borderColor: tag.color, color: tag.color }}
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell onClick={() => setViewingProduct(product)}>
                            <div className="font-medium">
                              {discount ? (
                                <div>
                                  <span className="text-red-600">${discountedPrice.toFixed(2)}</span>
                                  <span className="text-gray-500 line-through text-sm ml-2">
                                    ${product.price.toFixed(2)}
                                  </span>
                                </div>
                              ) : (
                                <span>${product.price.toFixed(2)}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell onClick={() => setViewingProduct(product)}>
                            {discount ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                {discount.type === "percentage" ? `${discount.value}%` : `$${discount.value}`}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-sm">Sin descuento</span>
                            )}
                          </TableCell>
                          <TableCell onClick={() => setViewingProduct(product)}>
                            <span className={product.stock < 10 ? "text-red-600 font-medium" : ""}>
                              {product.stock}
                            </span>
                          </TableCell>
                          <TableCell onClick={() => setViewingProduct(product)}>
                            {product.warranty?.hasWarranty ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                {product.warranty.duration} {product.warranty.unit}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-sm">Sin garantía</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(product.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                {/* Paginación */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      Mostrando {startIndex + 1} a {Math.min(endIndex, filteredProducts.length)} de{" "}
                      {filteredProducts.length} productos
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="itemsPerPage" className="text-sm">
                        Mostrar:
                      </Label>
                      <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {itemsPerPageOptions.map((option) => (
                            <SelectItem key={option} value={option.toString()}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let page
                        if (totalPages <= 5) {
                          page = i + 1
                        } else if (currentPage <= 3) {
                          page = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i
                        } else {
                          page = currentPage - 2 + i
                        }

                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={currentPage === page ? "bg-rose-600 hover:bg-rose-700" : ""}
                          >
                            {page}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product View Dialog */}
            <Dialog open={!!viewingProduct} onOpenChange={() => setViewingProduct(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle>{viewingProduct?.name}</DialogTitle>
                    <Button
                      onClick={() => {
                        if (viewingProduct) {
                          handleEdit(viewingProduct)
                          setViewingProduct(null)
                        }
                      }}
                      className="bg-rose-600 hover:bg-rose-700"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Producto
                    </Button>
                  </div>
                </DialogHeader>
                {viewingProduct && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                          <Image
                            src={viewingProduct.images[0] || "/placeholder.svg"}
                            alt={viewingProduct.name}
                            width={400}
                            height={400}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {viewingProduct.images.length > 1 && (
                          <div className="grid grid-cols-4 gap-2">
                            {viewingProduct.images.slice(1).map((image, index) => (
                              <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden">
                                <Image
                                  src={image || "/placeholder.svg"}
                                  alt={`${viewingProduct.name} ${index + 2}`}
                                  width={100}
                                  height={100}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Información General</h3>
                          <div className="space-y-2">
                            <p>
                              <strong>Precio:</strong> ${viewingProduct.price.toFixed(2)}
                            </p>
                            <p>
                              <strong>Stock:</strong> {viewingProduct.stock} unidades
                            </p>
                            <p>
                              <strong>Categoría:</strong>{" "}
                              {categories.find((c) => c.id === viewingProduct.categoryId)?.name || "Sin categoría"}
                            </p>
                            {viewingProduct.tagIds && viewingProduct.tagIds.length > 0 && (
                              <div>
                                <strong>Tags:</strong>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {tags
                                    .filter((tag) => viewingProduct.tagIds?.includes(tag.id))
                                    .map((tag) => (
                                      <Badge
                                        key={tag.id}
                                        variant="outline"
                                        style={{ borderColor: tag.color, color: tag.color }}
                                      >
                                        {tag.name}
                                      </Badge>
                                    ))}
                                </div>
                              </div>
                            )}
                            {viewingProduct.discountId && (
                              <div>
                                <strong>Descuento:</strong>
                                <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                                  {discounts.find((d) => d.id === viewingProduct.discountId)?.name}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                          <p className="text-gray-700">{viewingProduct.description}</p>
                        </div>

                        {viewingProduct.story && (
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Historia</h3>
                            <p className="text-gray-700">{viewingProduct.story}</p>
                          </div>
                        )}

                        {viewingProduct.materials && (
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Materiales</h3>
                            <ul className="list-disc list-inside space-y-1">
                              {viewingProduct.materials.map((material, index) => (
                                <li key={index} className="text-gray-700">
                                  {material}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {viewingProduct.dimensions && (
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Dimensiones</h3>
                            <p className="text-gray-700">{viewingProduct.dimensions}</p>
                          </div>
                        )}

                        {viewingProduct.care && (
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Cuidados</h3>
                            <p className="text-gray-700">{viewingProduct.care}</p>
                          </div>
                        )}

                        {viewingProduct.warranty?.hasWarranty && (
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Garantía</h3>
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              {viewingProduct.warranty.duration} {viewingProduct.warranty.unit}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Categories & Tags Tab */}
        {activeTab === "categories" && (
          <div className="space-y-8">
            {/* Categories Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestión de Categorías</CardTitle>
                    <CardDescription>Organiza tus productos por categorías</CardDescription>
                  </div>
                  <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-rose-600 hover:bg-rose-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Categoría
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCategorySubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="categoryName">Nombre *</Label>
                          <Input
                            id="categoryName"
                            value={categoryFormData.name}
                            onChange={(e) => setCategoryFormData((prev) => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="categoryDescription">Descripción</Label>
                          <Textarea
                            id="categoryDescription"
                            value={categoryFormData.description}
                            onChange={(e) => setCategoryFormData((prev) => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="categoryActive"
                            checked={categoryFormData.isActive}
                            onCheckedChange={(checked) =>
                              setCategoryFormData((prev) => ({ ...prev, isActive: checked as boolean }))
                            }
                          />
                          <Label htmlFor="categoryActive">Categoría activa</Label>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsCategoryDialogOpen(false)
                              setEditingCategory(null)
                              setCategoryFormData({ name: "", description: "", isActive: true })
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit" className="bg-rose-600 hover:bg-rose-700">
                            {editingCategory ? "Actualizar" : "Crear"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Productos</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => {
                      const productCount = products.filter((p) => p.categoryId === category.id).length
                      return (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{category.description || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={category.isActive ? "default" : "secondary"}>
                              {category.isActive ? "Activa" : "Inactiva"}
                            </Badge>
                          </TableCell>
                          <TableCell>{productCount} productos</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingCategory(category)
                                  setCategoryFormData({
                                    name: category.name,
                                    description: category.description || "",
                                    isActive: category.isActive,
                                  })
                                  setIsCategoryDialogOpen(true)
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteCategory(category.id)}
                                className="text-red-600 hover:text-red-700"
                                disabled={productCount > 0}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Tags Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestión de Tags</CardTitle>
                    <CardDescription>Etiqueta tus productos para mejor organización</CardDescription>
                  </div>
                  <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-rose-600 hover:bg-rose-700">
                        <Tag className="w-4 h-4 mr-2" />
                        Nuevo Tag
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingTag ? "Editar Tag" : "Nuevo Tag"}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleTagSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="tagName">Nombre *</Label>
                          <Input
                            id="tagName"
                            value={tagFormData.name}
                            onChange={(e) => setTagFormData((prev) => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="tagColor">Color</Label>
                          <Input
                            id="tagColor"
                            type="color"
                            value={tagFormData.color}
                            onChange={(e) => setTagFormData((prev) => ({ ...prev, color: e.target.value }))}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="tagActive"
                            checked={tagFormData.isActive}
                            onCheckedChange={(checked) =>
                              setTagFormData((prev) => ({ ...prev, isActive: checked as boolean }))
                            }
                          />
                          <Label htmlFor="tagActive">Tag activo</Label>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsTagDialogOpen(false)
                              setEditingTag(null)
                              setTagFormData({ name: "", color: "#8B5CF6", isActive: true })
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit" className="bg-rose-600 hover:bg-rose-700">
                            {editingTag ? "Actualizar" : "Crear"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Productos</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tags.map((tag) => {
                      const productCount = products.filter((p) => p.tagIds?.includes(tag.id)).length
                      return (
                        <TableRow key={tag.id}>
                          <TableCell className="font-medium">{tag.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }}></div>
                              <span>{tag.color}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={tag.isActive ? "default" : "secondary"}>
                              {tag.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell>{productCount} productos</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingTag(tag)
                                  setTagFormData({
                                    name: tag.name,
                                    color: tag.color,
                                    isActive: tag.isActive,
                                  })
                                  setIsTagDialogOpen(true)
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteTag(tag.id)}
                                className="text-red-600 hover:text-red-700"
                                disabled={productCount > 0}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Discounts Tab */}
        {activeTab === "discounts" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Descuentos Activos</CardTitle>
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeDiscounts}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Descuentos</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{discounts.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Próximos a Vencer</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">
                    {
                      discounts.filter((d) => {
                        if (d.isGeneric || !d.endDate) return false
                        const endDate = new Date(d.endDate)
                        const now = new Date()
                        const diffTime = endDate.getTime() - now.getTime()
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        return diffDays <= 7 && diffDays > 0
                      }).length
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestión de Descuentos</CardTitle>
                    <CardDescription>Crea y administra descuentos para tus productos</CardDescription>
                  </div>
                  <Dialog open={isDiscountDialogOpen} onOpenChange={setIsDiscountDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-rose-600 hover:bg-rose-700">
                        <Percent className="w-4 h-4 mr-2" />
                        Nuevo Descuento
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingDiscount ? "Editar Descuento" : "Nuevo Descuento"}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleDiscountSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="discountName">Nombre del Descuento *</Label>
                            <Input
                              id="discountName"
                              value={discountFormData.name}
                              onChange={(e) => setDiscountFormData((prev) => ({ ...prev, name: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="discountReason">Motivo *</Label>
                            <Select
                              value={discountFormData.reason}
                              onValueChange={(value) => setDiscountFormData((prev) => ({ ...prev, reason: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar motivo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="black-friday">Black Friday</SelectItem>
                                <SelectItem value="cyber-monday">Cyber Monday</SelectItem>
                                <SelectItem value="navidad">Navidad</SelectItem>
                                <SelectItem value="san-valentin">San Valentín</SelectItem>
                                <SelectItem value="dia-madre">Día de la Madre</SelectItem>
                                <SelectItem value="liquidacion">Liquidación</SelectItem>
                                <SelectItem value="lanzamiento">Lanzamiento</SelectItem>
                                <SelectItem value="cliente-frecuente">Cliente Frecuente</SelectItem>
                                <SelectItem value="otro">Otro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="discountDescription">Descripción</Label>
                          <Textarea
                            id="discountDescription"
                            value={discountFormData.description}
                            onChange={(e) => setDiscountFormData((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe el descuento..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="discountType">Tipo de Descuento *</Label>
                            <Select
                              value={discountFormData.type}
                              onValueChange={(value) =>
                                setDiscountFormData((prev) => ({ ...prev, type: value as "percentage" | "fixed" }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                                <SelectItem value="fixed">Cantidad Fija ($)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="discountValue">
                              Valor * {discountFormData.type === "percentage" ? "(%)" : "($)"}
                            </Label>
                            <Input
                              id="discountValue"
                              type="number"
                              step="0.01"
                              value={discountFormData.value}
                              onChange={(e) => setDiscountFormData((prev) => ({ ...prev, value: e.target.value }))}
                              required
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isGeneric"
                            checked={discountFormData.isGeneric}
                            onCheckedChange={(checked) =>
                              setDiscountFormData((prev) => ({ ...prev, isGeneric: checked as boolean }))
                            }
                          />
                          <Label htmlFor="isGeneric">Descuento genérico (sin fecha límite)</Label>
                        </div>

                        {!discountFormData.isGeneric && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="startDate">Fecha de Inicio *</Label>
                              <Input
                                id="startDate"
                                type="datetime-local"
                                value={discountFormData.startDate}
                                onChange={(e) =>
                                  setDiscountFormData((prev) => ({ ...prev, startDate: e.target.value }))
                                }
                                required={!discountFormData.isGeneric}
                              />
                            </div>
                            <div>
                              <Label htmlFor="endDate">Fecha de Fin *</Label>
                              <Input
                                id="endDate"
                                type="datetime-local"
                                value={discountFormData.endDate}
                                onChange={(e) => setDiscountFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                                required={!discountFormData.isGeneric}
                              />
                            </div>
                          </div>
                        )}

                        <div>
                          <Label>Productos Aplicables *</Label>
                          <div className="mt-2 max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                            {products.map((product) => (
                              <div key={product.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`product-${product.id}`}
                                  checked={discountFormData.productIds.includes(product.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setDiscountFormData((prev) => ({
                                        ...prev,
                                        productIds: [...prev.productIds, product.id],
                                      }))
                                    } else {
                                      setDiscountFormData((prev) => ({
                                        ...prev,
                                        productIds: prev.productIds.filter((id) => id !== product.id),
                                      }))
                                    }
                                  }}
                                />
                                <Label htmlFor={`product-${product.id}`} className="text-sm">
                                  {product.name} - ${product.price.toFixed(2)}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="discountActive"
                            checked={discountFormData.isActive}
                            onCheckedChange={(checked) =>
                              setDiscountFormData((prev) => ({ ...prev, isActive: checked as boolean }))
                            }
                          />
                          <Label htmlFor="discountActive">Descuento activo</Label>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsDiscountDialogOpen(false)
                              setEditingDiscount(null)
                              setDiscountFormData({
                                name: "",
                                description: "",
                                type: "percentage",
                                value: "",
                                reason: "",
                                startDate: "",
                                endDate: "",
                                isActive: true,
                                isGeneric: false,
                                productIds: [],
                              })
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit" className="bg-rose-600 hover:bg-rose-700">
                            {editingDiscount ? "Actualizar" : "Crear"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {discounts.length === 0 ? (
                  <div className="text-center py-8">
                    <Percent className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay descuentos creados aún</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Vigencia</TableHead>
                        <TableHead>Productos</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {discounts.map((discount) => {
                        const now = new Date()
                        const startDate = discount.startDate ? new Date(discount.startDate) : null
                        const endDate = discount.endDate ? new Date(discount.endDate) : null
                        const isActive =
                          discount.isActive &&
                          (discount.isGeneric || ((!startDate || startDate <= now) && (!endDate || endDate >= now)))

                        return (
                          <TableRow key={discount.id}>
                            <TableCell className="font-medium">{discount.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{discount.type === "percentage" ? "Porcentaje" : "Fijo"}</Badge>
                            </TableCell>
                            <TableCell>
                              {discount.type === "percentage" ? `${discount.value}%` : `$${discount.value}`}
                            </TableCell>
                            <TableCell className="capitalize">{discount.reason.replace("-", " ")}</TableCell>
                            <TableCell>
                              {discount.isGeneric ? (
                                <Badge variant="outline" className="text-blue-600 border-blue-600">
                                  Genérico
                                </Badge>
                              ) : (
                                <div className="text-sm">
                                  <div>{startDate?.toLocaleDateString("es-ES")}</div>
                                  <div className="text-gray-500">hasta {endDate?.toLocaleDateString("es-ES")}</div>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{discount.productIds.length} productos</TableCell>
                            <TableCell>
                              <Badge
                                variant={isActive ? "default" : "secondary"}
                                className={isActive ? "bg-green-100 text-green-800" : ""}
                              >
                                {isActive ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingDiscount(discount)
                                    setDiscountFormData({
                                      name: discount.name,
                                      description: discount.description || "",
                                      type: discount.type,
                                      value: discount.value.toString(),
                                      reason: discount.reason,
                                      startDate: discount.startDate || "",
                                      endDate: discount.endDate || "",
                                      isActive: discount.isActive,
                                      isGeneric: discount.isGeneric,
                                      productIds: discount.productIds,
                                    })
                                    setIsDiscountDialogOpen(true)
                                  }}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteDiscount(discount.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Promedio por Pedido</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : "0.00"}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Gestión de Pedidos</CardTitle>
                <CardDescription>Administra los pedidos de tus clientes</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay pedidos aún</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">#{order.id.slice(-8)}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.customerName}</p>
                              <p className="text-sm text-gray-600">{order.customerEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </TableCell>
                          <TableCell>
                            {order.items.length} producto{order.items.length !== 1 ? "s" : ""}
                          </TableCell>
                          <TableCell className="font-medium">${order.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleOrderStatusChange(order.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue>
                                  <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pendiente">Pendiente</SelectItem>
                                <SelectItem value="aceptado">Aceptado</SelectItem>
                                <SelectItem value="en_proceso">En Proceso</SelectItem>
                                <SelectItem value="enviado">Enviado</SelectItem>
                                <SelectItem value="entregado">Entregado</SelectItem>
                                <SelectItem value="cancelado">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => setViewingOrder(order)}>
                              <Eye className="w-3 h-3 mr-1" />
                              Ver
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Order Details Dialog */}
            <Dialog open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Detalles del Pedido #{viewingOrder?.id.slice(-8)}</DialogTitle>
                </DialogHeader>
                {viewingOrder && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Información del Cliente</h4>
                        <p>
                          <strong>Nombre:</strong> {viewingOrder.customerName}
                        </p>
                        <p>
                          <strong>Email:</strong> {viewingOrder.customerEmail}
                        </p>
                        {viewingOrder.customerPhone && (
                          <p>
                            <strong>Teléfono:</strong> {viewingOrder.customerPhone}
                          </p>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Información del Pedido</h4>
                        <p>
                          <strong>Fecha:</strong> {new Date(viewingOrder.createdAt).toLocaleDateString("es-ES")}
                        </p>
                        <p>
                          <strong>Estado:</strong>
                          <Badge className={`ml-2 ${getStatusColor(viewingOrder.status)}`}>
                            {getStatusText(viewingOrder.status)}
                          </Badge>
                        </p>
                        <p>
                          <strong>Total:</strong> ${viewingOrder.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Dirección de Envío</h4>
                      <p>{viewingOrder.shippingAddress.address}</p>
                      <p>
                        {viewingOrder.shippingAddress.city}, {viewingOrder.shippingAddress.state}
                      </p>
                      <p>
                        {viewingOrder.shippingAddress.zipCode}, {viewingOrder.shippingAddress.country}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Productos</h4>
                      <div className="space-y-2">
                        {viewingOrder.items.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center space-x-3">
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                width={40}
                                height={40}
                                className="rounded object-cover"
                              />
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {viewingOrder.notes && (
                      <div>
                        <h4 className="font-medium mb-2">Notas del Cliente</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded">{viewingOrder.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Configuración de Envíos
                </CardTitle>
                <CardDescription>Controla la disponibilidad y configuración de envíos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="shippingEnabled">Envíos Habilitados</Label>
                    <p className="text-sm text-gray-600">
                      Cuando está deshabilitado, los clientes no podrán seleccionar dirección de envío
                    </p>
                  </div>
                  <Switch
                    id="shippingEnabled"
                    checked={settings.shippingEnabled}
                    onCheckedChange={(checked) => updateSettings({ shippingEnabled: checked })}
                  />
                </div>

                {!settings.shippingEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="shippingMessage">Mensaje para Clientes</Label>
                    <Textarea
                      id="shippingMessage"
                      value={settings.shippingMessage || ""}
                      onChange={(e) => updateSettings({ shippingMessage: e.target.value })}
                      placeholder="Mensaje que verán los clientes cuando los envíos estén deshabilitados"
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Configuración General
                </CardTitle>
                <CardDescription>Ajustes generales de la tienda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moneda</Label>
                    <Select defaultValue="USD">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="MXN">MXN ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tasa de Impuestos (%)</Label>
                    <Input id="taxRate" type="number" step="0.01" defaultValue="16" placeholder="16.00" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="freeShippingThreshold">Envío Gratis a partir de</Label>
                  <Input id="freeShippingThreshold" type="number" step="0.01" defaultValue="50" placeholder="50.00" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Email de la Tienda</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    defaultValue="info@bisuteria.com"
                    placeholder="info@bisuteria.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storePhone">Teléfono de la Tienda</Label>
                  <Input id="storePhone" type="tel" defaultValue="+1 (555) 123-4567" placeholder="+1 (555) 123-4567" />
                </div>

                <Button className="bg-rose-600 hover:bg-rose-700">Guardar Configuración</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
