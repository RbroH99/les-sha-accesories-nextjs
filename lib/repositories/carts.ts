import { db } from "@/lib/db";
import { carts, cartItems } from "@/lib/schema";
import { and, eq } from "drizzle-orm";

export class CartsRepository {
  async getCartByUserId(userId: string) {
    return await db.query.carts.findFirst({
      where: eq(carts.userId, userId),
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });
  }

  async getOrCreateCart(userId: string) {
    let cart = await this.getCartByUserId(userId);
    if (!cart) {
      const id = `cart_${Date.now()}`;
      await db.insert(carts).values({ id, userId });
      cart = await this.getCartByUserId(userId);
    }
    return cart;
  }

  async addCartItem(cartId: string, productId: string, quantity: number) {
    const existingItem = await db.query.cartItems.findFirst({
        where: and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)),
    });

    if (existingItem) {
        await db.update(cartItems).set({ quantity: existingItem.quantity + quantity }).where(eq(cartItems.id, existingItem.id));
    } else {
        const id = `item_${Date.now()}`;
        await db.insert(cartItems).values({ id, cartId, productId, quantity });
    }
  }

  async updateCartItemQuantity(cartItemId: string, quantity: number) {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, cartItemId));
  }

  async removeCartItem(cartItemId: string) {
    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
  }

  async clearCart(cartId: string) {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  }
}

export const cartsRepository = new CartsRepository();
