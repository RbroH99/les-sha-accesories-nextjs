import { db } from "@/lib/db"
import { orders, orderItems } from "@/lib/schema"
import { eq, desc } from "drizzle-orm"

export interface OrderData {
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

export class OrdersRepository {
  async getAllOrders(): Promise<OrderData[]> {
    try {
      const ordersResult = await db.select().from(orders).orderBy(desc(orders.createdAt))

      const ordersWithItems = await Promise.all(
        ordersResult.map(async (order) => {
          const items = await db
            .select({
              id: orderItems.productId,
              name: orderItems.name,
              price: orderItems.price,
              quantity: orderItems.quantity,
              image: orderItems.image,
            })
            .from(orderItems)
            .where(eq(orderItems.orderId, order.id))

          return {
            id: order.id,
            userId: order.userId,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone || undefined,
            shippingAddress: order.shippingAddress || undefined,
            items: items.map((item) => ({
              id: item.id,
              name: item.name,
              price: Number.parseFloat(item.price),
              quantity: item.quantity,
              image: item.image || "",
            })),
            totalAmount: Number.parseFloat(order.totalAmount),
            status: order.status,
            notes: order.notes || undefined,
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
          }
        }),
      )

      return ordersWithItems
    } catch (error) {
      console.error("Error fetching orders:", error)
      return this.getMemoryOrders()
    }
  }

  async getOrdersByUserId(userId: string): Promise<OrderData[]> {
    try {
      const ordersResult = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt))

      const ordersWithItems = await Promise.all(
        ordersResult.map(async (order) => {
          const items = await db
            .select({
              id: orderItems.productId,
              name: orderItems.name,
              price: orderItems.price,
              quantity: orderItems.quantity,
              image: orderItems.image,
            })
            .from(orderItems)
            .where(eq(orderItems.orderId, order.id))

          return {
            id: order.id,
            userId: order.userId,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone || undefined,
            shippingAddress: order.shippingAddress || undefined,
            items: items.map((item) => ({
              id: item.id,
              name: item.name,
              price: Number.parseFloat(item.price),
              quantity: item.quantity,
              image: item.image || "",
            })),
            totalAmount: Number.parseFloat(order.totalAmount),
            status: order.status,
            notes: order.notes || undefined,
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
          }
        }),
      )

      return ordersWithItems
    } catch (error) {
      console.error("Error fetching user orders:", error)
      return this.getMemoryOrders().filter((order) => order.userId === userId)
    }
  }

  async createOrder(data: Omit<OrderData, "createdAt" | "updatedAt">): Promise<string> {
    try {
      // Insertar orden
      await db.insert(orders).values({
        id: data.id,
        userId: data.userId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shippingAddress: data.shippingAddress,
        totalAmount: data.totalAmount.toString(),
        status: data.status,
        notes: data.notes,
      })

      // Insertar items de la orden
      if (data.items.length > 0) {
        await db.insert(orderItems).values(
          data.items.map((item) => ({
            orderId: data.id,
            productId: item.id,
            name: item.name,
            price: item.price.toString(),
            quantity: item.quantity,
            image: item.image,
          })),
        )
      }

      return data.id
    } catch (error) {
      console.error("Error creating order:", error)
      throw new Error("Failed to create order")
    }
  }

  async updateOrderStatus(orderId: string, status: OrderData["status"]): Promise<boolean> {
    try {
      await db.update(orders).set({ status }).where(eq(orders.id, orderId))
      return true
    } catch (error) {
      console.error("Error updating order status:", error)
      return false
    }
  }

  async getOrderById(orderId: string): Promise<OrderData | null> {
    try {
      const orderResult = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)

      if (orderResult.length === 0) return null

      const order = orderResult[0]
      const items = await db
        .select({
          id: orderItems.productId,
          name: orderItems.name,
          price: orderItems.price,
          quantity: orderItems.quantity,
          image: orderItems.image,
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id))

      return {
        id: order.id,
        userId: order.userId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone || undefined,
        shippingAddress: order.shippingAddress || undefined,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number.parseFloat(item.price),
          quantity: item.quantity,
          image: item.image || "",
        })),
        totalAmount: Number.parseFloat(order.totalAmount),
        status: order.status,
        notes: order.notes || undefined,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      }
    } catch (error) {
      console.error("Error fetching order by id:", error)
      return this.getMemoryOrders().find((order) => order.id === orderId) || null
    }
  }

  // Método de fallback con datos en memoria
  private getMemoryOrders(): OrderData[] {
    return [] // Por ahora vacío, se puede llenar con datos de ejemplo
  }
}

export const ordersRepository = new OrdersRepository()
