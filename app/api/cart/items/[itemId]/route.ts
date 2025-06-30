import { NextResponse, NextRequest } from "next/server";
import { cartsRepository } from "@/lib/repositories/carts";
import jwt from "jsonwebtoken";
import { z } from "zod";

const cartItemUpdateSchema = z.object({
  quantity: z.number().min(1),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = (decoded as any).userId;
    const data = await request.json();
    const parsedData = cartItemUpdateSchema.safeParse(data);

    if (!parsedData.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await cartsRepository.updateCartItemQuantity(
      params.itemId,
      parsedData.data.quantity
    );

    const updatedCart = await cartsRepository.getCartByUserId(userId);

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = (decoded as any).userId;
    await cartsRepository.removeCartItem(params.itemId);
    const updatedCart = await cartsRepository.getCartByUserId(userId);
    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("Error removing cart item:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
