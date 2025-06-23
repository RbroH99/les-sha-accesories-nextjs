import { db } from "@/lib/db"
import { discounts, discountProducts } from "@/lib/schema"
import { eq, and } from "drizzle-orm"
import type { Discount } from "@/contexts/discounts-context"

export class DiscountsRepository {
  async getAllDiscounts(): Promise<Discount[]> {
    try {
      const result = await db.select().from(discounts)

      const discountsWithProducts = await Promise.all(
        result.map(async (discount) => {
          const productIds = await db
            .select({
              productId: discountProducts.productId,
            })
            .from(discountProducts)
            .where(eq(discountProducts.discountId, discount.id))

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
          }
        }),
      )

      return discountsWithProducts
    } catch (error) {
      console.error("Error fetching discounts:", error)
      return this.getMemoryDiscounts()
    }
  }

  async createDiscount(data: Omit<Discount, "id" | "createdAt">): Promise<string> {
    try {
      const id = `discount_${Date.now()}`

      await db.insert(discounts).values({
        id,
        name: data.name,
        description: data.description,
        type: data.type,
        value: data.value.toString(),
        reason: data.reason,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive,
        isGeneric: data.isGeneric,
      })

      // Insertar productos asociados
      if (data.productIds.length > 0) {
        await db.insert(discountProducts).values(
          data.productIds.map((productId) => ({
            discountId: id,
            productId,
          })),
        )
      }

      return id
    } catch (error) {
      console.error("Error creating discount:", error)
      throw new Error("Failed to create discount")
    }
  }

  async updateDiscount(id: string, data: Partial<Discount>): Promise<boolean> {
    try {
      await db
        .update(discounts)
        .set({
          name: data.name,
          description: data.description,
          type: data.type,
          value: data.value?.toString(),
          reason: data.reason,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          isActive: data.isActive,
          isGeneric: data.isGeneric,
        })
        .where(eq(discounts.id, id))

      // Actualizar productos asociados si se proporcionan
      if (data.productIds !== undefined) {
        // Eliminar asociaciones existentes
        await db.delete(discountProducts).where(eq(discountProducts.discountId, id))

        // Insertar nuevas asociaciones
        if (data.productIds.length > 0) {
          await db.insert(discountProducts).values(
            data.productIds.map((productId) => ({
              discountId: id,
              productId,
            })),
          )
        }
      }

      return true
    } catch (error) {
      console.error("Error updating discount:", error)
      return false
    }
  }

  async deleteDiscount(id: string): Promise<boolean> {
    try {
      // Eliminar asociaciones con productos
      await db.delete(discountProducts).where(eq(discountProducts.discountId, id))

      // Eliminar descuento
      await db.delete(discounts).where(eq(discounts.id, id))

      return true
    } catch (error) {
      console.error("Error deleting discount:", error)
      return false
    }
  }

  async getActiveDiscountsForProduct(productId: number): Promise<Discount[]> {
    try {
      const now = new Date()

      const result = await db
        .select({
          id: discounts.id,
          name: discounts.name,
          description: discounts.description,
          type: discounts.type,
          value: discounts.value,
          reason: discounts.reason,
          startDate: discounts.startDate,
          endDate: discounts.endDate,
          isActive: discounts.isActive,
          isGeneric: discounts.isGeneric,
          createdAt: discounts.createdAt,
        })
        .from(discounts)
        .innerJoin(discountProducts, eq(discounts.id, discountProducts.discountId))
        .where(and(eq(discountProducts.productId, productId), eq(discounts.isActive, true)))

      return result
        .filter((discount) => {
          if (discount.isGeneric) return true

          const startDate = discount.startDate
          const endDate = discount.endDate

          return (!startDate || startDate <= now) && (!endDate || endDate >= now)
        })
        .map((discount) => ({
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
          productIds: [productId], // Solo incluimos el producto actual
          createdAt: discount.createdAt.toISOString(),
        }))
    } catch (error) {
      console.error("Error fetching active discounts for product:", error)
      return []
    }
  }

  // Método de fallback con datos en memoria
  private getMemoryDiscounts(): Discount[] {
    return [] // Por ahora vacío, se puede llenar con datos de ejemplo
  }
}

export const discountsRepository = new DiscountsRepository()
