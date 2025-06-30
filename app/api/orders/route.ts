import { NextResponse } from "next/server";
import { ordersRepository } from "@/lib/repositories/orders";
import { z } from "zod";

const orderSchema = z.object({
  userId: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  shippingAddress: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }).optional(),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    image: z.string(),
  })),
  totalAmount: z.number(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const orders = await ordersRepository.getAllOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsedData = orderSchema.safeParse(data);

    if (!parsedData.success) {
      return NextResponse.json({ error: "Invalid data", details: parsedData.error.errors }, { status: 400 });
    }

    const newOrder = {
      ...parsedData.data,
      id: `order_${Date.now()}`,
      status: "pendiente" as const,
    };

    const orderId = await ordersRepository.createOrder({
        ...newOrder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    const createdOrder = await ordersRepository.getOrderById(orderId);

    return NextResponse.json({ order: createdOrder }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
