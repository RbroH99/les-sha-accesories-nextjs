import { db } from "@/lib/db";
import {
  orders,
  orderItems,
  products,
  discounts,
  discountProducts,
} from "@/lib/schema";
import { eq, desc, and, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Interfaces para los datos que se enviarán al frontend
export interface OrderItemData {
  id: string;
  name: string;
  quantity: number;
  image: string;
  originalPrice: number;
  finalPrice: number;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
}

export interface OrderData {
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
  items: OrderItemData[];
  totalAmount: number;
  status:
    | "pendiente"
    | "aceptado"
    | "en_proceso"
    | "enviado"
    | "entregado"
    | "cancelado";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Interfaz para los datos que vienen del carrito para crear un pedido
export interface CreateOrderDto {
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
  items: {
    productId: string;
    quantity: number;
  }[];
  notes?: string;
}

export class OrdersRepository {
  // Procesa los pedidos de la BD para convertirlos al formato que espera el frontend
  private async processOrders(
    orderRecords: (typeof orders.$inferSelect)[]
  ): Promise<OrderData[]> {
    if (orderRecords.length === 0) {
      return [];
    }

    const orderIds = orderRecords.map((o) => o.id);
    const itemsResult = await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    const ordersMap = new Map<string, OrderData>();
    for (const order of orderRecords) {
      ordersMap.set(order.id, {
        id: order.id,
        userId: order.userId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone || undefined,
        shippingAddress: order.shippingAddress || undefined,
        totalAmount: Number(order.totalAmount),
        status: order.status,
        notes: order.notes || undefined,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        items: [],
      });
    }

    for (const item of itemsResult) {
      const order = ordersMap.get(item.orderId);
      if (order) {
        order.items.push({
          id: item.productId,
          name: item.name,
          quantity: item.quantity,
          image: item.image || "/placeholder.jpg",
          originalPrice: Number(item.originalPrice),
          finalPrice: Number(item.finalPrice),
          discountType: item.discountType || undefined,
          discountValue: item.discountValue
            ? Number(item.discountValue)
            : undefined,
        });
      }
    }

    return Array.from(ordersMap.values());
  }

  async getAllOrders(): Promise<OrderData[]> {
    try {
      const ordersResult = await db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt));
      return this.processOrders(ordersResult);
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  }

  async getOrderById(orderId: string): Promise<OrderData | null> {
    try {
      const orderResult = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (orderResult.length === 0) return null;

      const processedOrders = await this.processOrders(orderResult);
      return processedOrders[0] || null;
    } catch (error) {
      console.error("Error fetching order by id:", error);
      return null;
    }
  }

  async getOrdersByUserId(userId: string): Promise<OrderData[]> {
    try {
      const ordersResult = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));
      return this.processOrders(ordersResult);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      return [];
    }
  }

  async createOrder(data: CreateOrderDto): Promise<string> {
    const orderId = uuidv4();
    let totalAmount = 0;

    const productIds = data.items.map((item) => item.productId);
    if (productIds.length === 0) {
      throw new Error("Cannot create an order with no items.");
    }

    console.log("--- Iniciando createOrder ---");
    console.log("Product IDs recibidos:", productIds);

    const productsFromDb = await db
      .select()
      .from(products)
      .where(inArray(products.id, productIds));
    
    console.log("Productos encontrados en la BD:", productsFromDb.map(p => p.id));

    const discountsFromDb = await db
      .select({
        productId: discountProducts.productId,
        discount: discounts,
      })
      .from(discountProducts)
      .innerJoin(discounts, eq(discountProducts.discountId, discounts.id))
      .where(
        and(
          inArray(discountProducts.productId, productIds),
          eq(discounts.isActive, true)
        )
      );
      
    console.log("Descuentos encontrados en la BD:", discountsFromDb);

    const productsMap = new Map(productsFromDb.map((p) => [p.id, p]));
    const discountsMap = new Map(
      discountsFromDb.map((d) => [d.productId, d.discount])
    );

    const orderItemsToInsert = data.items.map((item) => {
      const product = productsMap.get(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found.`);
      }

      const originalPrice = Number(product.price);
      let finalPrice = originalPrice;
      const discount = discountsMap.get(item.productId);
      
      console.log(`Procesando item: ${product.name} (ID: ${item.productId})`);
      console.log("Descuento encontrado para este item:", discount);


      let discountType: 'percentage' | 'fixed' | null = null;
      let discountValue: number | null = null;

      if (discount) {
        discountType = discount.type;
        discountValue = Number(discount.value);
        if (discount.type === "percentage") {
          finalPrice = originalPrice - originalPrice * (discountValue / 100);
        } else if (discount.type === "fixed") {
          finalPrice = originalPrice - discountValue;
        }
        if (finalPrice < 0) {
          finalPrice = 0;
        }
      }
      
      console.log(`Precio Original: ${originalPrice}, Precio Final: ${finalPrice}`);

      totalAmount += finalPrice * item.quantity;

      return {
        orderId,
        productId: item.productId,
        name: product.name,
        quantity: item.quantity,
        image: product.images?.[0] || "/placeholder.jpg",
        originalPrice: originalPrice.toString(),
        finalPrice: finalPrice.toString(),
        discountType: discountType,
        discountValue: discountValue?.toString() ?? null,
      };
    });
    
    console.log("Total Amount calculado:", totalAmount);
    console.log("--- Finalizando createOrder ---");

    // Insertar el pedido y los artículos sin transacción
    await db.insert(orders).values({
      id: orderId,
      userId: data.userId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      shippingAddress: data.shippingAddress,
      totalAmount: totalAmount.toString(),
      status: "pendiente",
      notes: data.notes,
    });

    await db.insert(orderItems).values(orderItemsToInsert as any);

    return orderId;
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderData["status"]
  ): Promise<boolean> {
    try {
      await db.update(orders).set({ status }).where(eq(orders.id, orderId));
      return true;
    } catch (error) {
      console.error("Error updating order status:", error);
      return false;
    }
  }

  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      // Eliminar sin transacción
      await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
      await db.delete(orders).where(eq(orders.id, orderId));
      return true;
    } catch (error) {
      console.error("Error deleting order:", error);
      return false;
    }
  }
}

export const ordersRepository = new OrdersRepository();
