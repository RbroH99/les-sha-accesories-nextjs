import { NextResponse, NextRequest } from "next/server";
import { cartsRepository } from "@/lib/repositories/carts";
import jwt from "jsonwebtoken";
import { z } from "zod";

const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = (decoded as any).userId;
    const data = await request.json();
    const parsedData = cartItemSchema.safeParse(data);

    if (!parsedData.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const cart = await cartsRepository.getOrCreateCart(userId);
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    await cartsRepository.addCartItem(
      cart.id,
      parsedData.data.productId,
      parsedData.data.quantity
    );

    const updatedCart = await cartsRepository.getCartByUserId(userId);

    return NextResponse.json(updatedCart, { status: 201 });
  } catch (error) {
    console.error("Error adding cart item:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
