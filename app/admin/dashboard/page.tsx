"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  Filter,
  Search,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Clock,
  Percent,
  Tag,
  Folder,
  Hash,
  Menu,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ImageUpload } from "@/components/image-upload"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CardDescription } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// Mock data for demonstration
const mockStats = {
  totalProducts: 24,
  totalOrders: 156,
  totalCustomers: 89,
  totalRevenue: 12450.0,
}

const mockOrders = [
  {
    id: "ORD-001",
    customer: "María González",
    email: "maria@email.com",
    total: 85.0,
    status: "pendiente",
    date: "2024-01-15",
    items: 3,
  },
  {
    id: "ORD-002",
    customer: "Carlos Ruiz",
    email: "carlos@email.com",
    total: 125.5,
    status: "enviado",
    date: "2024-01-14",
    items: 2,
  },
  {
    id: "ORD-003",
    customer: "Ana López",
    email: "ana@email.com",
    total: 67.25,
    status: "entregado",
    date: "2024-01-13",
    items: 1,
  },
]

const mockProducts = [
  {
    id: 1,
    name: "Collar Luna Dorada",
    price: 45.0,
    stock: 15,
    category: "Collares",
    status: "active",
    image: "/placeholder.svg?height=100&width=100",
    availabilityType: "stock_only",
    estimatedDeliveryDays: 3,
    hasWarranty: true,
    warrantyDuration: 6,
    warrantyUnit: "months",
    discountId: null,
    hasReturns: false,
    returnDays: 30,
  },
  {
    id: 2,
    name: "Aretes Cristal Rosa",
    price: 28.0,
    stock: 8,
    category: "Aretes",
    status: "active",
    image: "/placeholder.svg?height=100&width=100",
    availabilityType: "stock_and_order",
    estimatedDeliveryDays: 7,
    hasWarranty: false,
    discountId: "desc_1",
    hasReturns: true,
    returnDays: 15,
  },
  {
    id: 3,
    name: "Pulsera Perlas",
    price: 35.0,
    stock: 0,
    category: "Pulseras",
    status: "inactive",
    image: "/placeholder.svg?height=100&width=100",
    availabilityType: "order_only",
    estimatedDeliveryDays: 14,
    hasWarranty: true,
    warrantyDuration: 1,
    warrantyUnit: "years",
    discountId: null,
    hasReturns: false,
    returnDays: null,
  },
]

const mockDiscounts = [
  {
    id: "desc_1",
    name: "Descuento Primavera",
    description: "Descuento especial de temporada",
    type: "percentage",
    value: 15,
    reason: "Promoción de temporada",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    isActive: true,
    isGeneric: false,
    productIds: [2],
    createdAt: "2024-01-01",
  },
  {
    id: "desc_2",
    name: "Descuento VIP",
    description: "Descuento para clientes VIP",
    type: "fixed",
    value: 10,
    reason: "Cliente VIP",
    isActive: true,
    isGeneric: true,
    productIds: [],
    createdAt: "2024-01-01",
  },
]

const mockCategories = [
  {
    id: "cat_1",
    name: "Collares",
    description: "Collares artesanales únicos y elegantes",
    isActive: true,
    createdAt: "2024-01-01",
  },
  {
    id: "cat_2",
    name: "Aretes",
    description: "Aretes delicados y llamativos para toda ocasión",
    isActive: true,
    createdAt: "2024-01-01",
  },
  {
    id: "cat_3",
    name: "Pulseras",
    description: "Pulseras cómodas y hermosas hechas a mano",
    isActive: true,
    createdAt: "2024-01-01",
  },
  {
    id: "cat_4",
    name: "Anillos",
    description: "Anillos únicos y especiales",
    isActive: true,
    createdAt: "2024-01-01",
  },
]

const mockTags = [
  { id: "tag_1", name: "elegante", color: "#8B5CF6", isActive: true, createdAt: "2024-01-01" },
  { id: "tag_2", name: "casual", color: "#10B981", isActive: true, createdAt: "2024-01-01" },
  { id: "tag_3", name: "vintage", color: "#F59E0B", isActive: true, createdAt: "2024-01-01" },
  { id: "tag_4", name: "moderno", color: "#EF4444", isActive: true, createdAt: "2024-01-01" },
]

export default function AdminDashboard() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [orders, setOrders] = useState(mockOrders)
  const [products, setProducts] = useState(mockProducts)
  const [discounts, setDiscounts] = useState(mockDiscounts)
  const [categories, setCategories] = useState(mockCategories)
  const [tags, setTags] = useState(mockTags)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    images: [] as string[],
    availabilityType: "stock_only",
    estimatedDeliveryDays: "7",
    hasWarranty: false,
    warrantyDuration: "",
    warrantyUnit: "months",
    discountId: "",
    hasReturns: false,
    returnDays: "",
  })

  // Discount form state
  const [newDiscount, setNewDiscount] = useState({
    name: "",
    description: "",
    type: "percentage",
    value: "",
    reason: "",
    startDate: "",
    endDate: "",
    isActive: true,
    isGeneric: false,
    productIds: [] as number[],
  })

  // Category form state
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    isActive: true,
  })

  // Tag form state
  const [newTag, setNewTag] = useState({
    name: "",
    color: "#8B5CF6",
    isActive: true,
  })

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("")
  const [selectedAvailabilityFilter, setSelectedAvailabilityFilter] = useState("")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [stockRange, setStockRange] = useState({ min: "", max: "" })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editingDiscount, setEditingDiscount] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingTag, setEditingTag] = useState(null)
  const [viewingProduct, setViewingProduct] = useState(null)
  const [filteredProducts, setFilteredProducts] = useState(mockProducts)

  const itemsPerPageOptions = [5, 10, 20, 50]

  // Filter products
  useEffect(() => {
    let filtered = products

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Category filter
    if (selectedCategoryFilter) {
      filtered = filtered.filter((product) => product.category === selectedCategoryFilter)
    }

    // Status filter
    if (selectedStatusFilter) {
      filtered = filtered.filter((product) => product.status === selectedStatusFilter)
    }

    // Availability filter
    if (selectedAvailabilityFilter) {
      filtered = filtered.filter((product) => product.availabilityType === selectedAvailabilityFilter)
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter((product) => product.price >= Number.parseFloat(priceRange.min))
    }
    if (priceRange.max) {
      filtered = filtered.filter((product) => product.price <= Number.parseFloat(priceRange.max))
    }

    // Stock range filter
    if (stockRange.min) {
      filtered = filtered.filter((product) => product.stock >= Number.parseInt(stockRange.min))
    }
    if (stockRange.max) {
      filtered = filtered.filter((product) => product.stock <= Number.parseInt(stockRange.max))
    }

    setFilteredProducts(filtered)
  }, [
    products,
    searchTerm,
    selectedCategoryFilter,
    selectedStatusFilter,
    selectedAvailabilityFilter,
    priceRange,
    stockRange,
  ])

  // Calculate paginated products
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filteredProducts.length, itemsPerPage])

  const getAvailabilityIcon = (type: string) => {
    switch (type) {
      case "stock_only":
        return <Package className="w-4 h-4 text-blue-600" />
      case "stock_and_order":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "order_only":
        return <Clock className="w-4 h-4 text-orange-600" />
      default:
        return <XCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getAvailabilityText = (type: string) => {
    switch (type) {
      case "stock_only":
        return "Solo Stock"
      case "stock_and_order":
        return "Stock + Pedido"
      case "order_only":
        return "Solo Pedido"
      default:
        return "Desconocido"
    }
  }

  const handleSubmitProduct = (e) => {
    e.preventDefault()
    handleAddProduct()
    setIsProductDialogOpen(false)
  }

  const handleSubmitDiscount = (e) => {
    e.preventDefault()
    handleAddDiscount()
    setIsDiscountDialogOpen(false)
  }

  const handleSubmitCategory = (e) => {
    e.preventDefault()
    handleAddCategory()
    setIsCategoryDialogOpen(false)
  }

  const handleSubmitTag = (e) => {
    e.preventDefault()
    handleAddTag()
    setIsTagDialogOpen(false)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setNewProduct({
      name: product.name,
      description: "",
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      images: [product.image],
      availabilityType: product.availabilityType,
      estimatedDeliveryDays: product.estimatedDeliveryDays?.toString() || "7",
      hasWarranty: product.hasWarranty || false,
      warrantyDuration: product.warrantyDuration?.toString() || "",
      warrantyUnit: product.warrantyUnit || "months",
      discountId: product.discountId || "",
      hasReturns: product.hasReturns || false,
      returnDays: product.returnDays?.toString() || "",
    })
    setIsProductDialogOpen(true)
  }

  const handleEditDiscount = (discount) => {
    setEditingDiscount(discount)
    setNewDiscount({
      name: discount.name,
      description: discount.description || "",
      type: discount.type,
      value: discount.value.toString(),
      reason: discount.reason,
      startDate: discount.startDate || "",
      endDate: discount.endDate || "",
      isActive: discount.isActive,
      isGeneric: discount.isGeneric,
      productIds: discount.productIds || [],
    })
    setIsDiscountDialogOpen(true)
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setNewCategory({
      name: category.name,
      description: category.description || "",
      isActive: category.isActive,
    })
    setIsCategoryDialogOpen(true)
  }

  const handleEditTag = (tag) => {
    setEditingTag(tag)
    setNewTag({
      name: tag.name,
      color: tag.color,
      isActive: tag.isActive,
    })
    setIsTagDialogOpen(true)
  }

  const handleDeleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id))
    toast({
      title: "Producto eliminado",
      description: "El producto se eliminó correctamente",
    })
  }

  const handleDeleteDiscount = (id) => {
    setDiscounts(discounts.filter((d) => d.id !== id))
    toast({
      title: "Descuento eliminado",
      description: "El descuento se eliminó correctamente",
    })
  }

  const handleDeleteCategory = (id) => {
    setCategories(categories.filter((c) => c.id !== id))
    toast({
      title: "Categoría eliminada",
      description: "La categoría se eliminó correctamente",
    })
  }

  const handleDeleteTag = (id) => {
    setTags(tags.filter((t) => t.id !== id))
    toast({
      title: "Tag eliminado",
      description: "El tag se eliminó correctamente",
    })
  }

  const resetProductForm = () => {
    setNewProduct({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      images: [],
      availabilityType: "stock_only",
      estimatedDeliveryDays: "7",
      hasWarranty: false,
      warrantyDuration: "",
      warrantyUnit: "months",
      discountId: "",
      hasReturns: false,
      returnDays: "",
    })
    setEditingProduct(null)
    setIsProductDialogOpen(false)
  }

  const resetDiscountForm = () => {
    setNewDiscount({
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
  }

  const resetCategoryForm = () => {
    setNewCategory({
      name: "",
      description: "",
      isActive: true,
    })
    setEditingCategory(null)
    setIsCategoryDialogOpen(false)
  }

  const resetTagForm = () => {
    setNewTag({
      name: "",
      color: "#8B5CF6",
      isActive: true,
    })
    setEditingTag(null)
    setIsTagDialogOpen(false)
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
        return "bg-orange-100 text-orange-800"
      case "entregado":
        return "bg-green-100 text-green-800"
      case "cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
    toast({
      title: "Estado actualizado",
      description: `El pedido ${orderId} ha sido actualizado a ${newStatus}`,
    })
  }

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      toast({
        title: "Error",
        description: "Por favor completa los campos requeridos",
        variant: "destructive",
      })
      return
    }

    const product = {
      id: editingProduct ? editingProduct.id : products.length + 1,
      name: newProduct.name,
      price: Number.parseFloat(newProduct.price),
      stock: Number.parseInt(newProduct.stock) || 0,
      category: newProduct.category,
      status: "active",
      image: newProduct.images[0] || "/placeholder.svg?height=100&width=100",
      availabilityType: newProduct.availabilityType,
      estimatedDeliveryDays: Number.parseInt(newProduct.estimatedDeliveryDays),
      hasWarranty: newProduct.hasWarranty,
      warrantyDuration: newProduct.hasWarranty ? Number.parseInt(newProduct.warrantyDuration) : undefined,
      warrantyUnit: newProduct.hasWarranty ? newProduct.warrantyUnit : undefined,
      discountId: newProduct.discountId || null,
      hasReturns: newProduct.hasReturns,
      returnDays: newProduct.hasReturns ? Number.parseInt(newProduct.returnDays) : undefined,
    }

    if (editingProduct) {
      setProducts(products.map((p) => (p.id === editingProduct.id ? product : p)))
      toast({
        title: "Producto actualizado",
        description: "El producto se actualizó correctamente",
      })
    } else {
      setProducts([...products, product])
      toast({
        title: "Producto agregado",
        description: "El producto ha sido agregado exitosamente",
      })
    }

    resetProductForm()
  }

  const handleAddDiscount = () => {
    if (!newDiscount.name || !newDiscount.value) {
      toast({
        title: "Error",
        description: "Por favor completa los campos requeridos",
        variant: "destructive",
      })
      return
    }

    const discount = {
      id: editingDiscount ? editingDiscount.id : `desc_${Date.now()}`,
      name: newDiscount.name,
      description: newDiscount.description,
      type: newDiscount.type,
      value: Number.parseFloat(newDiscount.value),
      reason: newDiscount.reason,
      startDate: newDiscount.isGeneric ? undefined : newDiscount.startDate,
      endDate: newDiscount.isGeneric ? undefined : newDiscount.endDate,
      isActive: newDiscount.isActive,
      isGeneric: newDiscount.isGeneric,
      productIds: newDiscount.productIds,
      createdAt: editingDiscount ? editingDiscount.createdAt : new Date().toISOString(),
    }

    if (editingDiscount) {
      setDiscounts(discounts.map((d) => (d.id === editingDiscount.id ? discount : d)))
      toast({
        title: "Descuento actualizado",
        description: "El descuento se actualizó correctamente",
      })
    } else {
      setDiscounts([...discounts, discount])
      toast({
        title: "Descuento creado",
        description: "El descuento ha sido creado exitosamente",
      })
    }

    resetDiscountForm()
  }

  const handleAddCategory = () => {
    if (!newCategory.name) {
      toast({
        title: "Error",
        description: "Por favor completa el nombre de la categoría",
        variant: "destructive",
      })
      return
    }

    const category = {
      id: editingCategory ? editingCategory.id : `cat_${Date.now()}`,
      name: newCategory.name,
      description: newCategory.description,
      isActive: newCategory.isActive,
      createdAt: editingCategory ? editingCategory.createdAt : new Date().toISOString(),
    }

    if (editingCategory) {
      setCategories(categories.map((c) => (c.id === editingCategory.id ? category : c)))
      toast({
        title: "Categoría actualizada",
        description: "La categoría se actualizó correctamente",
      })
    } else {
      setCategories([...categories, category])
      toast({
        title: "Categoría creada",
        description: "La categoría ha sido creada exitosamente",
      })
    }

    resetCategoryForm()
  }

  const handleAddTag = () => {
    if (!newTag.name) {
      toast({
        title: "Error",
        description: "Por favor completa el nombre del tag",
        variant: "destructive",
      })
      return
    }

    const tag = {
      id: editingTag ? editingTag.id : `tag_${Date.now()}`,
      name: newTag.name,
      color: newTag.color,
      isActive: newTag.isActive,
      createdAt: editingTag ? editingTag.createdAt : new Date().toISOString(),
    }

    if (editingTag) {
      setTags(tags.map((t) => (t.id === editingTag.id ? tag : t)))
      toast({
        title: "Tag actualizado",
        description: "El tag se actualizó correctamente",
      })
    } else {
      setTags([...tags, tag])
      toast({
        title: "Tag creado",
        description: "El tag ha sido creado exitosamente",
      })
    }

    resetTagForm()
  }

  const handleProductToggleForDiscount = (productId: number) => {
    setNewDiscount((prev) => {
      const productIds = [...prev.productIds]
      const index = productIds.indexOf(productId)
      if (index > -1) {
        productIds.splice(index, 1)
      } else {
        productIds.push(productId)
      }
      return { ...prev, productIds }
    })
  }

  // Mobile navigation component
  const MobileNavigation = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">Panel de Admin</h2>
            <div className="space-y-1">
              {[
                { id: "overview", label: "Resumen", icon: DollarSign },
                { id: "orders", label: "Pedidos", icon: ShoppingCart },
                { id: "products", label: "Productos", icon: Package },
                { id: "categories", label: "Categorías", icon: Folder },
                { id: "discounts", label: "Descuentos", icon: Percent },
                { id: "settings", label: "Configuración", icon: Save },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveTab(tab.id)
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <tab.icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Gestiona tu tienda de bisutería</p>
            </div>
            <MobileNavigation />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="hidden md:grid w-full grid-cols-6">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="discounts">Descuentos</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Productos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{mockStats.totalProducts}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Pedidos</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{mockStats.totalOrders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Clientes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{mockStats.totalCustomers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Ingresos Totales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">${mockStats.totalRevenue.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Pedidos Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg space-y-2 sm:space-y-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm sm:text-base">{order.customer}</p>
                        <p className="text-xs sm:text-sm text-gray-600">{order.email}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{order.date}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-bold text-sm sm:text-base">${order.total.toFixed(2)}</p>
                        <Badge className={`${getStatusColor(order.status)} text-xs`}>{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Gestión de Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm sm:text-base">{order.id}</h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {order.customer} - {order.email}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {order.date} - {order.items} items
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-base sm:text-lg">${order.total.toFixed(2)}</p>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value)}>
                          <SelectTrigger className="w-full sm:w-48">
                            <SelectValue />
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

                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4 sm:space-y-6">
            {/* Stats Cards for Products */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Productos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{mockStats.totalProducts}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {mockProducts.filter((p) => p.status === "active").length} activos •{" "}
                    {mockProducts.filter((p) => p.status === "inactive").length} inactivos
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Valor Inventario</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    ${mockProducts.reduce((sum, p) => sum + p.price * p.stock, 0).toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Stock Bajo</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-red-600">
                    {mockProducts.filter((p) => p.stock < 10 && p.availabilityType !== "order_only").length}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Productos con menos de 10 unidades</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Sin Stock</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-red-600">
                    {mockProducts.filter((p) => p.stock === 0 && p.availabilityType !== "order_only").length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters Section */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <Filter className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Filtros de Productos
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategoryFilter("")
                      setSelectedStatusFilter("")
                      setSelectedAvailabilityFilter("")
                      setPriceRange({ min: "", max: "" })
                      setStockRange({ min: "", max: "" })
                    }}
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
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
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedStatusFilter || "all"}
                    onValueChange={(value) => setSelectedStatusFilter(value === "all" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="inactive">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedAvailabilityFilter || "all"}
                    onValueChange={(value) => setSelectedAvailabilityFilter(value === "all" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Disponibilidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="stock_only">Solo Stock</SelectItem>
                      <SelectItem value="stock_and_order">Stock + Pedido</SelectItem>
                      <SelectItem value="order_only">Solo Pedido</SelectItem>
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
                <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
                  Mostrando {filteredProducts.length} de {products.length} productos
                </div>
              </CardContent>
            </Card>

            {/* Products Management */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Gestión de Productos</CardTitle>
                    <CardDescription className="text-sm">
                      Administra tu inventario de bisutería artesanal
                    </CardDescription>
                  </div>
                  <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Producto
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden">
                      <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl">
                          {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                        </DialogTitle>
                        <DialogDescription className="text-sm">
                          {editingProduct
                            ? "Modifica los datos del producto"
                            : "Agrega un nuevo producto a tu inventario"}
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
                        <form onSubmit={handleSubmitProduct} className="space-y-4 sm:space-y-6">
                          {/* Información Básica */}
                          <div className="space-y-3 sm:space-y-4">
                            <h3 className="text-base sm:text-lg font-medium">Información Básica</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <Label htmlFor="name" className="text-sm">
                                  Nombre del Producto *
                                </Label>
                                <Input
                                  id="name"
                                  value={newProduct.name}
                                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                  required
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <Label htmlFor="price" className="text-sm">
                                  Precio *
                                </Label>
                                <Input
                                  id="price"
                                  type="number"
                                  step="0.01"
                                  value={newProduct.price}
                                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                  required
                                  className="text-sm"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <Label htmlFor="category" className="text-sm">
                                  Categoría *
                                </Label>
                                <Select
                                  value={newProduct.category}
                                  onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                                >
                                  <SelectTrigger className="text-sm">
                                    <SelectValue placeholder="Seleccionar categoría" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map((category) => (
                                      <SelectItem key={category.id} value={category.name}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="availabilityType" className="text-sm">
                                  Tipo de Disponibilidad *
                                </Label>
                                <Select
                                  value={newProduct.availabilityType}
                                  onValueChange={(value) => setNewProduct({ ...newProduct, availabilityType: value })}
                                >
                                  <SelectTrigger className="text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="stock_only">
                                      <div className="flex items-center space-x-2">
                                        <Package className="w-4 h-4 text-blue-600" />
                                        <span>Solo Stock</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="stock_and_order">
                                      <div className="flex items-center space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>Stock + Pedido</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="order_only">
                                      <div className="flex items-center space-x-2">
                                        <Clock className="w-4 h-4 text-orange-600" />
                                        <span>Solo Pedido</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <Label htmlFor="stock" className="text-sm">
                                  Stock {newProduct.availabilityType === "order_only" ? "(Opcional)" : "*"}
                                </Label>
                                <Input
                                  id="stock"
                                  type="number"
                                  value={newProduct.stock}
                                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                  required={newProduct.availabilityType !== "order_only"}
                                  disabled={newProduct.availabilityType === "order_only"}
                                  placeholder={newProduct.availabilityType === "order_only" ? "0 (Sin stock)" : ""}
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <Label htmlFor="estimatedDeliveryDays" className="text-sm">
                                  Días de Entrega Estimados{" "}
                                  {newProduct.availabilityType !== "stock_only" ? "*" : "(Opcional)"}
                                </Label>
                                <Input
                                  id="estimatedDeliveryDays"
                                  type="number"
                                  value={newProduct.estimatedDeliveryDays}
                                  onChange={(e) =>
                                    setNewProduct({ ...newProduct, estimatedDeliveryDays: e.target.value })
                                  }
                                  required={newProduct.availabilityType !== "stock_only"}
                                  placeholder="7"
                                  className="text-sm"
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="discountId" className="text-sm">
                                Descuento Asociado
                              </Label>
                              <Select
                                value={newProduct.discountId || "none"}
                                onValueChange={(value) =>
                                  setNewProduct({ ...newProduct, discountId: value === "none" ? "" : value })
                                }
                              >
                                <SelectTrigger className="text-sm">
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
                              <Label htmlFor="description" className="text-sm">
                                Descripción *
                              </Label>
                              <Textarea
                                id="description"
                                value={newProduct.description}
                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                required
                                rows={3}
                                className="text-sm"
                              />
                            </div>
                          </div>

                          {/* Garantía */}
                          <div className="space-y-3 sm:space-y-4">
                            <h3 className="text-base sm:text-lg font-medium">Garantía</h3>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="hasWarranty"
                                checked={newProduct.hasWarranty}
                                onCheckedChange={(checked) => setNewProduct({ ...newProduct, hasWarranty: checked })}
                              />
                              <Label htmlFor="hasWarranty" className="text-sm">
                                Este producto tiene garantía
                              </Label>
                            </div>

                            {newProduct.hasWarranty && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                  <Label htmlFor="warrantyDuration" className="text-sm">
                                    Duración de la Garantía *
                                  </Label>
                                  <Input
                                    id="warrantyDuration"
                                    type="number"
                                    value={newProduct.warrantyDuration}
                                    onChange={(e) => setNewProduct({ ...newProduct, warrantyDuration: e.target.value })}
                                    required={newProduct.hasWarranty}
                                    className="text-sm"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="warrantyUnit" className="text-sm">
                                    Unidad *
                                  </Label>
                                  <Select
                                    value={newProduct.warrantyUnit}
                                    onValueChange={(value) => setNewProduct({ ...newProduct, warrantyUnit: value })}
                                  >
                                    <SelectTrigger className="text-sm">
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

                          {/* Política de Devoluciones */}
                          <div className="space-y-3 sm:space-y-4">
                            <h3 className="text-base sm:text-lg font-medium">Política de Devoluciones</h3>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="hasReturns"
                                checked={newProduct.hasReturns}
                                onCheckedChange={(checked) => setNewProduct({ ...newProduct, hasReturns: checked })}
                              />
                              <Label htmlFor="hasReturns" className="text-sm">
                                Este producto acepta devoluciones
                              </Label>
                            </div>

                            {newProduct.hasReturns && (
                              <div>
                                <Label htmlFor="returnDays" className="text-sm">
                                  Días para devolución *
                                </Label>
                                <Input
                                  id="returnDays"
                                  type="number"
                                  value={newProduct.returnDays}
                                  onChange={(e) => setNewProduct({ ...newProduct, returnDays: e.target.value })}
                                  required={newProduct.hasReturns}
                                  placeholder="30"
                                  className="text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Número de días después de la compra en que se acepta la devolución
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Imágenes y Videos del Producto */}
                          <div className="space-y-3 sm:space-y-4">
                            <h3 className="text-base sm:text-lg font-medium">Imágenes y Videos del Producto</h3>
                            <ImageUpload
                              images={newProduct.images}
                              onImagesChange={(images) => setNewProduct({ ...newProduct, images })}
                              maxImages={8}
                              folder="products"
                              allowVideos={true}
                              maxVideoSize={50}
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={resetProductForm}
                              className="w-full sm:w-auto"
                            >
                              Cancelar
                            </Button>
                            <Button type="submit" className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto">
                              {editingProduct ? "Actualizar" : "Crear"} Producto
                            </Button>
                          </div>
                        </form>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Mobile Product Cards */}
                <div className="block sm:hidden space-y-4">
                  {paginatedProducts.map((product) => {
                    const discount = discounts.find((d) => d.id === product.discountId)
                    return (
                      <Card key={product.id} className="p-4">
                        <div className="flex space-x-3">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-sm truncate">{product.name}</h3>
                                <p className="text-xs text-gray-600">{product.category}</p>
                                <div className="flex items-center space-x-1 mt-1">
                                  {getAvailabilityIcon(product.availabilityType)}
                                  <span className="text-xs text-gray-500">
                                    {getAvailabilityText(product.availabilityType)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right ml-2">
                                <p className="font-medium text-sm">${product.price.toFixed(2)}</p>
                                <Badge
                                  variant={product.status === "active" ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {product.status === "active" ? "Activo" : "Inactivo"}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => setViewingProduct(product)}>
                                <Eye className="w-3 h-3 mr-1" />
                                Ver
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Imagen</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Disponibilidad</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProducts.map((product) => {
                        const discount = discounts.find((d) => d.id === product.discountId)
                        return (
                          <TableRow key={product.id} className="cursor-pointer hover:bg-gray-50">
                            <TableCell onClick={() => setViewingProduct(product)}>
                              <img
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            </TableCell>
                            <TableCell onClick={() => setViewingProduct(product)}>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-gray-600 line-clamp-1">{product.category}</p>
                                {discount && (
                                  <Badge variant="outline" className="text-xs text-green-600 border-green-600 mt-1">
                                    {discount.name}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell onClick={() => setViewingProduct(product)}>
                              <Badge variant="secondary" className="capitalize">
                                {product.category}
                              </Badge>
                            </TableCell>
                            <TableCell onClick={() => setViewingProduct(product)}>
                              <div className="flex items-center space-x-2">
                                {getAvailabilityIcon(product.availabilityType)}
                                <div>
                                  <p className="text-sm font-medium">{getAvailabilityText(product.availabilityType)}</p>
                                  {product.availabilityType !== "stock_only" && (
                                    <p className="text-xs text-gray-500">{product.estimatedDeliveryDays} días</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell onClick={() => setViewingProduct(product)}>
                              <div className="font-medium">
                                {discount ? (
                                  <div>
                                    <span className="text-red-600">
                                      $
                                      {(
                                        product.price *
                                        (1 -
                                          (discount.type === "percentage"
                                            ? discount.value / 100
                                            : discount.value / product.price))
                                      ).toFixed(2)}
                                    </span>
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
                              {product.availabilityType === "order_only" ? (
                                <Badge variant="outline" className="text-orange-600 border-orange-600">
                                  Por Encargo
                                </Badge>
                              ) : (
                                <span className={product.stock < 10 ? "text-red-600 font-medium" : ""}>
                                  {product.stock}
                                </span>
                              )}
                            </TableCell>
                            <TableCell onClick={() => setViewingProduct(product)}>
                              <Badge variant={product.status === "active" ? "default" : "secondary"}>
                                {product.status === "active" ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteProduct(product.id)}
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
                </div>

                {/* Paginación */}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-3 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="text-xs sm:text-sm text-gray-600">
                      Mostrando {startIndex + 1} a {Math.min(endIndex, filteredProducts.length)} de{" "}
                      {filteredProducts.length} productos
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="itemsPerPage" className="text-xs sm:text-sm">
                        Mostrar:
                      </Label>
                      <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                        <SelectTrigger className="w-16 sm:w-20">
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
                  <div className="flex items-center space-x-1 sm:space-x-2">
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
              <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <DialogTitle className="text-lg sm:text-xl">{viewingProduct?.name}</DialogTitle>
                    <Button
                      onClick={() => {
                        if (viewingProduct) {
                          handleEditProduct(viewingProduct)
                          setViewingProduct(null)
                        }
                      }}
                      className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Producto
                    </Button>
                  </div>
                </DialogHeader>
                {viewingProduct && (
                  <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
                    <div className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                            <img
                              src={viewingProduct.image || "/placeholder.svg"}
                              alt={viewingProduct.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold mb-2">Información General</h3>
                            <div className="space-y-2 text-sm">
                              <p>
                                <strong>Precio:</strong> ${viewingProduct.price.toFixed(2)}
                              </p>
                              <div className="flex items-center space-x-2">
                                <strong>Disponibilidad:</strong>
                                {getAvailabilityIcon(viewingProduct.availabilityType)}
                                <span>{getAvailabilityText(viewingProduct.availabilityType)}</span>
                              </div>
                              {viewingProduct.availabilityType !== "order_only" && (
                                <p>
                                  <strong>Stock:</strong> {viewingProduct.stock} unidades
                                </p>
                              )}
                              {viewingProduct.estimatedDeliveryDays && (
                                <p>
                                  <strong>Tiempo de entrega:</strong> {viewingProduct.estimatedDeliveryDays} días
                                </p>
                              )}
                              <p>
                                <strong>Categoría:</strong> {viewingProduct.category}
                              </p>
                              {viewingProduct.hasWarranty && (
                                <p>
                                  <strong>Garantía:</strong> {viewingProduct.warrantyDuration}{" "}
                                  {viewingProduct.warrantyUnit}
                                </p>
                              )}
                              {viewingProduct.discountId && (
                                <div>
                                  <strong>Descuento:</strong>
                                  <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                                    {discounts.find((d) => d.id === viewingProduct.discountId)?.name}
                                  </Badge>
                                </div>
                              )}
                              <p>
                                <strong>Estado:</strong>
                                <Badge
                                  variant={viewingProduct.status === "active" ? "default" : "secondary"}
                                  className="ml-2"
                                >
                                  {viewingProduct.status === "active" ? "Activo" : "Inactivo"}
                                </Badge>
                              </p>
                              {viewingProduct.hasReturns && (
                                <p>
                                  <strong>Devoluciones:</strong> Acepta devoluciones hasta {viewingProduct.returnDays}{" "}
                                  días después de la compra
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4 sm:space-y-6">
            {/* Stats Cards for Categories */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Categorías</CardTitle>
                  <Folder className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{categories.length}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {categories.filter((c) => c.isActive).length} activas •{" "}
                    {categories.filter((c) => !c.isActive).length} inactivas
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Tags</CardTitle>
                  <Hash className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{tags.length}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {tags.filter((t) => t.isActive).length} activos • {tags.filter((t) => !t.isActive).length} inactivos
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Productos por Categoría</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {Math.round(products.length / categories.length) || 0}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Promedio por categoría</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Más Popular</CardTitle>
                  <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-base sm:text-lg font-bold">Collares</div>
                  <div className="text-xs text-muted-foreground mt-1">Categoría con más productos</div>
                </CardContent>
              </Card>
            </div>

            {/* Categories Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Categories Section */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Categorías</CardTitle>
                      <CardDescription className="text-sm">Organiza tus productos por categorías</CardDescription>
                    </div>
                    <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto">
                          <Plus className="w-4 h-4 mr-2" />
                          Nueva Categoría
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-lg">
                            {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
                          </DialogTitle>
                          <DialogDescription className="text-sm">
                            {editingCategory ? "Modifica los datos de la categoría" : "Crea una nueva categoría"}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmitCategory} className="space-y-4">
                          <div>
                            <Label htmlFor="category-name" className="text-sm">
                              Nombre de la Categoría *
                            </Label>
                            <Input
                              id="category-name"
                              value={newCategory.name}
                              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                              required
                              placeholder="Ej: Collares"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="category-description" className="text-sm">
                              Descripción
                            </Label>
                            <Textarea
                              id="category-description"
                              value={newCategory.description}
                              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                              rows={3}
                              placeholder="Descripción de la categoría..."
                              className="text-sm"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="category-active"
                              checked={newCategory.isActive}
                              onCheckedChange={(checked) => setNewCategory({ ...newCategory, isActive: checked })}
                            />
                            <Label htmlFor="category-active" className="text-sm">
                              Categoría activa
                            </Label>
                          </div>
                          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={resetCategoryForm}
                              className="w-full sm:w-auto"
                            >
                              Cancelar
                            </Button>
                            <Button type="submit" className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto">
                              {editingCategory ? "Actualizar" : "Crear"} Categoría
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category.id} className="border rounded-lg p-3 sm:p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-sm sm:text-base">{category.name}</h3>
                              <Badge variant={category.isActive ? "default" : "secondary"} className="text-xs">
                                {category.isActive ? "Activa" : "Inactiva"}
                              </Badge>
                            </div>
                            {category.description && (
                              <p className="text-xs sm:text-sm text-gray-600 mb-2">{category.description}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              {products.filter((p) => p.category === category.name).length} producto(s)
                            </p>
                          </div>
                          <div className="flex space-x-1 ml-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {categories.length === 0 && (
                      <div className="text-center py-6 sm:py-8">
                        <Folder className="w-8 sm:w-12 h-8 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                        <p className="text-gray-500 text-sm sm:text-base font-medium">No hay categorías creadas</p>
                        <p className="text-gray-400 mt-1 sm:mt-2 text-xs sm:text-sm">
                          Crea tu primera categoría para organizar tus productos
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tags Section */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Tags</CardTitle>
                      <CardDescription className="text-sm">Etiquetas para clasificar productos</CardDescription>
                    </div>
                    <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto">
                          <Plus className="w-4 h-4 mr-2" />
                          Nuevo Tag
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-lg">{editingTag ? "Editar Tag" : "Nuevo Tag"}</DialogTitle>
                          <DialogDescription className="text-sm">
                            {editingTag ? "Modifica los datos del tag" : "Crea un nuevo tag"}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmitTag} className="space-y-4">
                          <div>
                            <Label htmlFor="tag-name" className="text-sm">
                              Nombre del Tag *
                            </Label>
                            <Input
                              id="tag-name"
                              value={newTag.name}
                              onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                              required
                              placeholder="Ej: elegante"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="tag-color" className="text-sm">
                              Color del Tag
                            </Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Input
                                id="tag-color"
                                type="color"
                                value={newTag.color}
                                onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                                className="w-12 h-10 p-1 border rounded"
                              />
                              <Input
                                value={newTag.color}
                                onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                                placeholder="#8B5CF6"
                                className="text-sm"
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="tag-active"
                              checked={newTag.isActive}
                              onCheckedChange={(checked) => setNewTag({ ...newTag, isActive: checked })}
                            />
                            <Label htmlFor="tag-active" className="text-sm">
                              Tag activo
                            </Label>
                          </div>
                          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={resetTagForm} className="w-full sm:w-auto">
                              Cancelar
                            </Button>
                            <Button type="submit" className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto">
                              {editingTag ? "Actualizar" : "Crear"} Tag
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tags.map((tag) => (
                      <div key={tag.id} className="border rounded-lg p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: tag.color }}
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-sm sm:text-base">#{tag.name}</h3>
                                <Badge variant={tag.isActive ? "default" : "secondary"} className="text-xs">
                                  {tag.isActive ? "Activo" : "Inactivo"}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500">{tag.color}</p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm" onClick={() => handleEditTag(tag)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTag(tag.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {tags.length === 0 && (
                      <div className="text-center py-6 sm:py-8">
                        <Hash className="w-8 sm:w-12 h-8 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                        <p className="text-gray-500 text-sm sm:text-base font-medium">No hay tags creados</p>
                        <p className="text-gray-400 mt-1 sm:mt-2 text-xs sm:text-sm">
                          Crea tu primer tag para etiquetar productos
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="discounts" className="space-y-4 sm:space-y-6">
            {/* Stats Cards for Discounts */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Descuentos</CardTitle>
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{discounts.length}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {discounts.filter((d) => d.isActive).length} activos • {discounts.filter((d) => !d.isActive).length}{" "}
                    inactivos
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Descuentos Genéricos</CardTitle>
                  <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{discounts.filter((d) => d.isGeneric).length}</div>
                  <div className="text-xs text-muted-foreground mt-1">Aplicables a cualquier producto</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Descuentos Específicos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{discounts.filter((d) => !d.isGeneric).length}</div>
                  <div className="text-xs text-muted-foreground mt-1">Para productos específicos</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Productos con Descuento</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{products.filter((p) => p.discountId).length}</div>
                  <div className="text-xs text-muted-foreground mt-1">Productos con descuento aplicado</div>
                </CardContent>
              </Card>
            </div>

            {/* Discounts Management */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Gestión de Descuentos</CardTitle>
                    <CardDescription className="text-sm">
                      Administra los descuentos y promociones de tu tienda
                    </CardDescription>
                  </div>
                  <Dialog open={isDiscountDialogOpen} onOpenChange={setIsDiscountDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Descuento
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden">
                      <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl">
                          {editingDiscount ? "Editar Descuento" : "Nuevo Descuento"}
                        </DialogTitle>
                        <DialogDescription className="text-sm">
                          {editingDiscount
                            ? "Modifica los datos del descuento"
                            : "Crea un nuevo descuento para tu tienda"}
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
                        <form onSubmit={handleSubmitDiscount} className="space-y-4 sm:space-y-6">
                          {/* Información Básica */}
                          <div className="space-y-3 sm:space-y-4">
                            <h3 className="text-base sm:text-lg font-medium">Información Básica</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <Label htmlFor="discount-name" className="text-sm">
                                  Nombre del Descuento *
                                </Label>
                                <Input
                                  id="discount-name"
                                  value={newDiscount.name}
                                  onChange={(e) => setNewDiscount({ ...newDiscount, name: e.target.value })}
                                  required
                                  placeholder="Ej: Descuento Primavera"
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <Label htmlFor="discount-reason" className="text-sm">
                                  Razón del Descuento *
                                </Label>
                                <Input
                                  id="discount-reason"
                                  value={newDiscount.reason}
                                  onChange={(e) => setNewDiscount({ ...newDiscount, reason: e.target.value })}
                                  required
                                  placeholder="Ej: Promoción de temporada"
                                  className="text-sm"
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="discount-description" className="text-sm">
                                Descripción
                              </Label>
                              <Textarea
                                id="discount-description"
                                value={newDiscount.description}
                                onChange={(e) => setNewDiscount({ ...newDiscount, description: e.target.value })}
                                rows={3}
                                placeholder="Descripción detallada del descuento..."
                                className="text-sm"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <Label htmlFor="discount-type" className="text-sm">
                                  Tipo de Descuento *
                                </Label>
                                <Select
                                  value={newDiscount.type}
                                  onValueChange={(value) => setNewDiscount({ ...newDiscount, type: value })}
                                >
                                  <SelectTrigger className="text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                                    <SelectItem value="fixed">Cantidad Fija ($)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="discount-value" className="text-sm">
                                  Valor del Descuento * {newDiscount.type === "percentage" ? "(%)" : "($)"}
                                </Label>
                                <Input
                                  id="discount-value"
                                  type="number"
                                  step={newDiscount.type === "percentage" ? "1" : "0.01"}
                                  value={newDiscount.value}
                                  onChange={(e) => setNewDiscount({ ...newDiscount, value: e.target.value })}
                                  required
                                  placeholder={newDiscount.type === "percentage" ? "15" : "10.00"}
                                  className="text-sm"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="isGeneric"
                                  checked={newDiscount.isGeneric}
                                  onCheckedChange={(checked) => setNewDiscount({ ...newDiscount, isGeneric: checked })}
                                />
                                <Label htmlFor="isGeneric" className="text-sm">
                                  Descuento genérico (aplicable a cualquier producto)
                                </Label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="isActive"
                                  checked={newDiscount.isActive}
                                  onCheckedChange={(checked) => setNewDiscount({ ...newDiscount, isActive: checked })}
                                />
                                <Label htmlFor="isActive" className="text-sm">
                                  Descuento activo
                                </Label>
                              </div>
                            </div>
                          </div>

                          {/* Fechas de Vigencia */}
                          {!newDiscount.isGeneric && (
                            <div className="space-y-3 sm:space-y-4">
                              <h3 className="text-base sm:text-lg font-medium">Fechas de Vigencia</h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                  <Label htmlFor="startDate" className="text-sm">
                                    Fecha de Inicio
                                  </Label>
                                  <Input
                                    id="startDate"
                                    type="date"
                                    value={newDiscount.startDate}
                                    onChange={(e) => setNewDiscount({ ...newDiscount, startDate: e.target.value })}
                                    className="text-sm"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="endDate" className="text-sm">
                                    Fecha de Fin
                                  </Label>
                                  <Input
                                    id="endDate"
                                    type="date"
                                    value={newDiscount.endDate}
                                    onChange={(e) => setNewDiscount({ ...newDiscount, endDate: e.target.value })}
                                    className="text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Productos Aplicables */}
                          {!newDiscount.isGeneric && (
                            <div className="space-y-3 sm:space-y-4">
                              <h3 className="text-base sm:text-lg font-medium">Productos Aplicables</h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-60 overflow-y-auto border rounded-lg p-3 sm:p-4">
                                {products.map((product) => (
                                  <div key={product.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`product-${product.id}`}
                                      checked={newDiscount.productIds.includes(product.id)}
                                      onCheckedChange={() => handleProductToggleForDiscount(product.id)}
                                    />
                                    <Label htmlFor={`product-${product.id}`} className="text-xs sm:text-sm">
                                      {product.name} - ${product.price.toFixed(2)}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600">
                                Seleccionados: {newDiscount.productIds.length} producto(s)
                              </p>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={resetDiscountForm}
                              className="w-full sm:w-auto"
                            >
                              Cancelar
                            </Button>
                            <Button type="submit" className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto">
                              {editingDiscount ? "Actualizar" : "Crear"} Descuento
                            </Button>
                          </div>
                        </form>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {discounts.map((discount) => (
                    <div key={discount.id} className="border rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-semibold text-sm sm:text-base">{discount.name}</h3>
                            <Badge variant={discount.isActive ? "default" : "secondary"} className="text-xs">
                              {discount.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                            {discount.isGeneric && (
                              <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                                Genérico
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">{discount.description}</p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            <strong>Razón:</strong> {discount.reason}
                          </p>
                          {!discount.isGeneric && discount.startDate && discount.endDate && (
                            <p className="text-xs sm:text-sm text-gray-500">
                              <strong>Vigencia:</strong> {discount.startDate} - {discount.endDate}
                            </p>
                          )}
                          {!discount.isGeneric && (
                            <p className="text-xs sm:text-sm text-gray-500">
                              <strong>Productos:</strong> {discount.productIds.length} producto(s)
                            </p>
                          )}
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-xl sm:text-2xl font-bold text-green-600">
                            {discount.type === "percentage" ? `${discount.value}%` : `$${discount.value.toFixed(2)}`}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {discount.type === "percentage" ? "Descuento" : "Descuento fijo"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDiscount(discount)}
                          className="w-full sm:w-auto"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDiscount(discount.id)}
                          className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}

                  {discounts.length === 0 && (
                    <div className="text-center py-6 sm:py-8">
                      <Percent className="w-8 sm:w-12 h-8 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                      <p className="text-gray-500 text-sm sm:text-base font-medium">No hay descuentos creados</p>
                      <p className="text-gray-400 mt-1 sm:mt-2 text-xs sm:text-sm">
                        Crea tu primer descuento para empezar a ofrecer promociones
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Configuración de la Tienda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Configuración de Envíos */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-medium">Envíos</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div>
                      <Label htmlFor="shipping" className="text-sm">
                        Envíos Habilitados
                      </Label>
                      <p className="text-xs sm:text-sm text-gray-600">Permitir envíos a domicilio</p>
                    </div>
                    <Switch id="shipping" />
                  </div>
                  <div>
                    <Label htmlFor="shipping-message" className="text-sm">
                      Mensaje cuando los envíos están deshabilitados
                    </Label>
                    <Textarea
                      id="shipping-message"
                      placeholder="Los envíos están temporalmente suspendidos..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </div>

                <Separator />

                {/* Configuración de Pagos */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-medium">Pagos</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div>
                      <Label htmlFor="payment" className="text-sm">
                        Pagos en Línea Habilitados
                      </Label>
                      <p className="text-xs sm:text-sm text-gray-600">Permitir pagos con tarjeta en línea</p>
                    </div>
                    <Switch id="payment" />
                  </div>
                  <div>
                    <Label htmlFor="payment-message" className="text-sm">
                      Mensaje cuando los pagos están deshabilitados
                    </Label>
                    <Textarea
                      id="payment-message"
                      placeholder="Los pagos en línea están temporalmente deshabilitados..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </div>

                <Separator />

                {/* Configuración de Impuestos */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-medium">Impuestos</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div>
                      <Label htmlFor="tax" className="text-sm">
                        Impuestos Habilitados
                      </Label>
                      <p className="text-xs sm:text-sm text-gray-600">Aplicar impuestos a las compras</p>
                    </div>
                    <Switch id="tax" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="tax-name" className="text-sm">
                        Nombre del Impuesto
                      </Label>
                      <Input id="tax-name" placeholder="IVA" className="text-sm" />
                    </div>
                    <div>
                      <Label htmlFor="tax-rate" className="text-sm">
                        Tasa de Impuesto (%)
                      </Label>
                      <Input id="tax-rate" type="number" step="0.01" placeholder="16" className="text-sm" />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Configuración General */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-medium">General</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div>
                      <Label htmlFor="notifications" className="text-sm">
                        Notificaciones por Email
                      </Label>
                      <p className="text-xs sm:text-sm text-gray-600">Recibir notificaciones de nuevos pedidos</p>
                    </div>
                    <Switch id="notifications" />
                  </div>
                </div>

                <Button className="w-full sm:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Configuración
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
