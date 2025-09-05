import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { z } from "zod";
import { CartsRepository } from "@/lib/repositories/carts";

const updateItemSchema = z.object({
  quantity: z.number().min(1),
});

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cartsRepo = new CartsRepository();
    const body = await req.json();
    const parsedData = updateItemSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsedData.error },
        { status: 400 }
      );
    }

    const { quantity } = parsedData.data;
    const cart = await cartsRepo.getCartByUserId(userId);

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    await cartsRepo.updateCartItemQuantity(params.id, quantity);
    const updatedCart = await cartsRepo.getCartByUserId(userId);

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error(`PUT /api/cart/items/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Error updating item quantity" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cartsRepo = new CartsRepository();
    const cart = await cartsRepo.getCartByUserId(userId);
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    await cartsRepo.removeCartItem(params.id);
    const updatedCart = await cartsRepo.getCartByUserId(userId);

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error(`DELETE /api/cart/items/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Error removing item from cart" },
      { status: 500 }
    );
  }
}
