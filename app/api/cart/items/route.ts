import { NextResponse } from "next/server";
import { CartsRepository } from "@/lib/repositories/carts";
import { getUserIdFromRequest } from "@/lib/auth";
import { z } from "zod";

const addItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
});

export async function POST(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cartsRepo = new CartsRepository();
    const body = await req.json();
    const parsedData = addItemSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsedData.error },
        { status: 400 }
      );
    }

    const { productId, quantity } = parsedData.data;
    const cart = await cartsRepo.getCartByUserId(userId);

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    await cartsRepo.addCartItem(cart.id, productId, quantity);
    const updatedCart = await cartsRepo.getCartByUserId(userId);

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("POST /api/cart/items error:", error);
    return NextResponse.json(
      { error: "Error adding item to cart" },
      { status: 500 }
    );
  }
}
