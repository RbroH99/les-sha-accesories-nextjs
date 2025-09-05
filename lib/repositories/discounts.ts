import { db } from "@/lib/db";
import { discounts, discountProducts } from "@/lib/schema";
import { eq, and, or, isNull, lte, gte } from "drizzle-orm";
import type { Discount } from "@/contexts/discounts-context";
import { v4 as uuidv4 } from "uuid";

export class DiscountsRepository {
  async getAllDiscounts(): Promise<Discount[]> {
    try {
      const result = await db.select().from(discounts);

      const discountsWithProducts = await Promise.all(
        result.map(async (discount) => {
          const productIds = await db
            .select({
              productId: discountProducts.productId,
            })
            .from(discountProducts)
            .where(eq(discountProducts.discountId, discount.id));

          return {
            id: discount.id,
            name: discount.name,
            description: discount.description || undefined,
            type: discount.type as "percentage" | "fixed",
            value: Number.parseFloat(discount.value),
            reason: discount.reason,
            startDate: discount.startDate?.toISOString(),
            endDate: discount.endDate?.toISOString(),
            isActive: discount.isActive,
            isGeneric: discount.isGeneric,
            productIds: productIds.map((p) => p.productId),
            createdAt: discount.createdAt.toISOString(),
            updatedAt: discount.updatedAt.toISOString(),
          };
        })
      );

      return discountsWithProducts;
    } catch (error) {
      console.error("Error fetching discounts:", error);
      return [];
    }
  }

  async createDiscount(
    data: Omit<Discount, "id" | "createdAt" | "updatedAt">
  ): Promise<Discount> {
    const newDiscount = {
      id: uuidv4(),
      ...data,
      value: data.value.toString(),
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(discounts).values({
      id: newDiscount.id,
      name: newDiscount.name,
      description: newDiscount.description,
      type: newDiscount.type,
      value: newDiscount.value,
      reason: newDiscount.reason,
      startDate: newDiscount.startDate,
      endDate: newDiscount.endDate,
      isActive: newDiscount.isActive,
      isGeneric: newDiscount.isGeneric,
      createdAt: newDiscount.createdAt,
      updatedAt: newDiscount.updatedAt,
    });

    if (data.productIds && data.productIds.length > 0) {
      await db.insert(discountProducts).values(
        data.productIds.map((productId) => ({
          discountId: newDiscount.id,
          productId,
        }))
      );
    }

    return {
      ...data,
      id: newDiscount.id,
      value: Number(data.value),
      createdAt: newDiscount.createdAt.toISOString(),
      updatedAt: newDiscount.updatedAt.toISOString(),
    };
  }

  async updateDiscount(
    id: string,
    data: Partial<Omit<Discount, "id" | "createdAt" | "updatedAt">>
  ): Promise<boolean> {
    await db
      .update(discounts)
      .set({
        ...data,
        value: data.value?.toString(),
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(discounts.id, id));

    if (data.productIds !== undefined) {
      await db
        .delete(discountProducts)
        .where(eq(discountProducts.discountId, id));

      if (data.productIds.length > 0) {
        await db.insert(discountProducts).values(
          data.productIds.map((productId) => ({
            discountId: id,
            productId,
          }))
        );
      }
    }
    return true;
  }

  async deleteDiscount(id: string): Promise<boolean> {
    try {
      await db
        .delete(discountProducts)
        .where(eq(discountProducts.discountId, id));
      await db.delete(discounts).where(eq(discounts.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting discount:", error);
      return false;
    }
  }
}

export const discountsRepository = new DiscountsRepository();
