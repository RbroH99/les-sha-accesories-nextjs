"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"

export interface Order {
  id: string
  userId: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  shippingAddress?: {
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  items: {
    id: number
    name: string
    price: number
    quantity: number
    image: string
  }[]
  totalAmount: number
  status: "pendiente" | "aceptado" | "en_proceso" | "enviado" | "entregado" | "cancelado"
  notes?: string
  createdAt: string
  updatedAt: string
}

interface OrdersContextType {
  orders: Order[]
  userOrders: Order[]
  createOrder: (orderData: Omit<Order, "id" | "userId" | "createdAt" | "updatedAt" | "status">) => Promise<string>
  updateOrderStatus: (orderId: string, status: Order["status"]) => Promise<boolean>
  getOrderById: (orderId: string) => Order | undefined
}

const OrdersContext = createContext<OrdersContextType | null>(null)

const ORDERS_STORAGE_KEY = "bisuteria_orders"

const getStoredOrders = (): Order[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(ORDERS_STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

const saveOrders = (orders: Order[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const { user } = useAuth()

  useEffect(() => {
    setOrders(getStoredOrders())
  }, [])

  useEffect(() => {
    saveOrders(orders)
  }, [orders])

  const userOrders = orders.filter((order) => order.userId === user?.id)

  const createOrder = async (
    orderData: Omit<Order, "id" | "userId" | "createdAt" | "updatedAt" | "status">,
  ): Promise<string> => {
    if (!user) throw new Error("Usuario no autenticado")

    const newOrder: Order = {
      ...orderData,
      id: `order_${Date.now()}`,
      userId: user.id,
      status: "pendiente",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setOrders((prev) => [...prev, newOrder])
    return newOrder.id
  }

  const updateOrderStatus = async (orderId: string, status: Order["status"]): Promise<boolean> => {
    try {
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order)),
      )
      return true
    } catch (error) {
      return false
    }
  }

  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find((order) => order.id === orderId)
  }

  return (
    <OrdersContext.Provider
      value={{
        orders,
        userOrders,
        createOrder,
        updateOrderStatus,
        getOrderById,
      }}
    >
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrdersContext)
  if (!context) {
    throw new Error("useOrders must be used within an OrdersProvider")
  }
  return context
}
