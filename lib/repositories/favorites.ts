import { db } from "@/lib/db";
import { favorites, products } from "@/lib/schema";
import { and, eq } from "drizzle-orm";

export class FavoritesRepository {
  async getFavoritesByUserId(userId: string) {
    const userFavorites = await db
      .select({
        id: favorites.id,
        userId: favorites.userId,
        productId: favorites.productId,
        createdAt: favorites.createdAt,
        product: products,
      })
      .from(favorites)
      .leftJoin(products, eq(favorites.productId, products.id))
      .where(eq(favorites.userId, userId));

    return userFavorites;
  }

  async addFavorite(userId: string, productId: string) {
    const id = `fav_${Date.now()}`;
    await db.insert(favorites).values({ id, userId, productId });
    return { id, userId, productId };
  }

  async removeFavorite(userId: string, productId: string) {
    await db
      .delete(favorites)
      .where(
        and(eq(favorites.userId, userId), eq(favorites.productId, productId))
      );
  }
}

export const favoritesRepository = new FavoritesRepository();
