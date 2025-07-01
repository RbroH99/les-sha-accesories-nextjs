import { NextResponse } from "next/server";
import { CartsRepository } from "@/lib/repositories/carts";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cartsRepo = new CartsRepository();
    const cart = await cartsRepo.getCartByUserId(userId);
    return NextResponse.json(cart);
  } catch (error) {
    console.error("GET /api/cart error:", error);
    return NextResponse.json({ error: "Error fetching cart" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const userId = await getUserIdFromRequest(req);
  const cartsRepo = new CartsRepository();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const success = await cartsRepo.clearCart(userId);
    if (success) {
      const cart = await cartsRepo.getCartByUserId(userId);
      return NextResponse.json(cart);
    } else {
      return NextResponse.json(
        { error: "Error clearing cart" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("DELETE /api/cart error:", error);
    return NextResponse.json({ error: "Error clearing cart" }, { status: 500 });
  }
}
