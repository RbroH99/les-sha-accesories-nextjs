import { db } from "@/lib/db";
import { carts, cartItems } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export class CartsRepository {
  async getCartByUserId(userId: string) {
    let cart = await db.query.carts.findFirst({
      where: eq(carts.userId, userId),
      with: {
        items: {
          with: {
            product: {
              columns: {
                name: true,
                price: true,
                images: true,
                categoryId: true,
                id: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      const newCartId = uuidv4();
      await db.insert(carts).values({ id: newCartId, userId });
      cart = {
        id: newCartId,
        userId,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return cart;
  }

  async addCartItem(cartId: string, productId: string, quantity: number) {
    const existingItem = await db.query.cartItems.findFirst({
      where: and(
        eq(cartItems.cartId, cartId),
        eq(cartItems.productId, productId)
      ),
    });

    if (existingItem) {
      await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + quantity })
        .where(eq(cartItems.id, existingItem.id));
    } else {
      const id = uuidv4();
      await db.insert(cartItems).values({ id, cartId, productId, quantity });
    }
  }

  async updateCartItemQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      await this.removeCartItem(itemId);
    } else {
      await db
        .update(cartItems)
        .set({ quantity })
        .where(eq(cartItems.id, itemId));
    }
  }

  async removeCartItem(itemId: string) {
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
  }

  async clearCart(userId: string): Promise<boolean> {
    try {
      const cart = await this.getCartByUserId(userId);
      if (!cart) return true; // Nothing to clear

      await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

      return true;
    } catch (error) {
      console.error("Error clearing cart:", error);
      return false;
    }
  }
}

export const cartsRepository = new CartsRepository();
