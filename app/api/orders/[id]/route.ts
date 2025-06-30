import { NextResponse } from "next/server";
import { ordersRepository } from "@/lib/repositories/orders";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum([
    "pendiente",
    "aceptado",
    "en_proceso",
    "enviado",
    "entregado",
    "cancelado",
  ]),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await ordersRepository.getOrderById(params.id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error(`Error fetching order ${params.id}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const parsedData = statusSchema.safeParse(data);

    if (!parsedData.success) {
      return NextResponse.json({ error: "Invalid data", details: parsedData.error.errors }, { status: 400 });
    }

    const success = await ordersRepository.updateOrderStatus(
      params.id,
      parsedData.data.status
    );

    if (!success) {
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
    
    const updatedOrder = await ordersRepository.getOrderById(params.id);

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error(`Error updating order ${params.id}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = await ordersRepository.deleteOrder(params.id);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
    }
    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error(`Error deleting order ${params.id}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
