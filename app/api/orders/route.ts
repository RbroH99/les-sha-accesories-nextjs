import React from "react";
import { NextResponse } from "next/server";
import {
  ordersRepository,
  type CreateOrderDto,
} from "@/lib/repositories/orders";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { getOrderConfirmationEmailHtml } from "@/lib/email-template";
import { format } from "date-fns";

const createOrderSchema = z.object({
  userId: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  shippingAddress: z
    .object({
      address: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      country: z.string(),
    })
    .optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().min(1),
      })
    )
    .min(1),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const orders = await ordersRepository.getAllOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsedData = createOrderSchema.safeParse(data);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsedData.error.errors },
        { status: 400 }
      );
    }

    const orderId = await ordersRepository.createOrder(parsedData.data);
    const createdOrder = await ordersRepository.getOrderById(orderId);

    if (!createdOrder) {
      return NextResponse.json(
        { error: "Failed to retrieve created order" },
        { status: 500 }
      );
    }

    // ✅ Enviar correo con componente React (seguro)
    try {
      const html = await getOrderConfirmationEmailHtml({
        customerName: createdOrder.customerName,
        orderId: createdOrder.id,
        orderDate: format(new Date(createdOrder.createdAt), "dd/MM/yyyy"),
        totalAmount: `$${createdOrder.totalAmount}`,
        shippingAddress: createdOrder.shippingAddress || {},
        items: createdOrder.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          finalPrice: (item.finalPrice || item.originalPrice || 0).toFixed(2),
          image: item.image || "https://tu-dominio.com/placeholder.svg",
        })),
      });

      await sendEmail({
        to: createdOrder.customerEmail,
        subject: `Confirmación de tu pedido #${createdOrder.id}`,
        html,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    return NextResponse.json({ order: createdOrder }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
