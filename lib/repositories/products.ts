import { db } from "@/lib/db"
import { products, categories, productTags } from "@/lib/schema"
import { eq, and, inArray, like, gte, lte, desc, asc } from "drizzle-orm"

export interface ProductWithRelations {
  id: number
  name: string
  description: string
  story?: string
  price: number
  categoryId: string
  categoryName?: string
  images: string[]
  materials?: string[]
  dimensions?: string
  care?: string
  stock: number
  availabilityType: "stock_only" | "stock_and_order" | "order_only" // Nuevo campo
  estimatedDeliveryDays?: number // Nuevo campo
  isNew: boolean
  isActive: boolean
  hasWarranty: boolean
  warrantyDuration?: number
  warrantyUnit?: "days" | "months" | "years"
  discountId?: string
  tagIds: string[]
  createdAt: string
  updatedAt: string
}

export interface ProductFilters {
  categoryIds?: string[]
  tagIds?: string[]
  search?: string
  minPrice?: number
  maxPrice?: number
  minStock?: number
  maxStock?: number
  isNew?: boolean
  hasDiscount?: boolean
  availabilityType?: "stock_only" | "stock_and_order" | "order_only" // Nuevo filtro
  sortBy?: "name" | "price" | "stock" | "created_at"
  sortOrder?: "asc" | "desc"
  limit?: number
  offset?: number
}

export class ProductsRepository {
  async getAllProducts(filters?: ProductFilters): Promise<ProductWithRelations[]> {
    try {
      // Construir query base
      let query = db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          story: products.story,
          price: products.price,
          categoryId: products.categoryId,
          categoryName: categories.name,
          images: products.images,
          materials: products.materials,
          dimensions: products.dimensions,
          care: products.care,
          stock: products.stock,
          availabilityType: products.availabilityType, // Nuevo campo
          estimatedDeliveryDays: products.estimatedDeliveryDays, // Nuevo campo
          isNew: products.isNew,
          isActive: products.isActive,
          hasWarranty: products.hasWarranty,
          warrantyDuration: products.warrantyDuration,
          warrantyUnit: products.warrantyUnit,
          discountId: products.discountId,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(products.isActive, true))

      // Aplicar filtros
      if (filters) {
        if (filters.categoryIds?.length) {
          query = query.where(and(eq(products.isActive, true), inArray(products.categoryId, filters.categoryIds)))
        }

        if (filters.search) {
          query = query.where(and(eq(products.isActive, true), like(products.name, `%${filters.search}%`)))
        }

        if (filters.minPrice !== undefined) {
          query = query.where(and(eq(products.isActive, true), gte(products.price, filters.minPrice.toString())))
        }

        if (filters.maxPrice !== undefined) {
          query = query.where(and(eq(products.isActive, true), lte(products.price, filters.maxPrice.toString())))
        }

        if (filters.minStock !== undefined) {
          query = query.where(and(eq(products.isActive, true), gte(products.stock, filters.minStock)))
        }

        if (filters.maxStock !== undefined) {
          query = query.where(and(eq(products.isActive, true), lte(products.stock, filters.maxStock)))
        }

        if (filters.isNew !== undefined) {
          query = query.where(and(eq(products.isActive, true), eq(products.isNew, filters.isNew)))
        }

        // Nuevo filtro por tipo de disponibilidad
        if (filters.availabilityType) {
          query = query.where(and(eq(products.isActive, true), eq(products.availabilityType, filters.availabilityType)))
        }

        // Ordenamiento
        if (filters.sortBy) {
          const column = products[filters.sortBy]
          if (column) {
            query = query.orderBy(filters.sortOrder === "desc" ? desc(column) : asc(column))
          }
        }

        // Paginación
        if (filters.limit) {
          query = query.limit(filters.limit)
        }
        if (filters.offset) {
          query = query.offset(filters.offset)
        }
      }

      const result = await query

      // Obtener tags para cada producto
      const productsWithTags = await Promise.all(
        result.map(async (product) => {
          const productTagsResult = await db
            .select({
              tagId: productTags.tagId,
            })
            .from(productTags)
            .where(eq(productTags.productId, product.id))

          return {
            ...product,
            price: Number.parseFloat(product.price),
            images: product.images || [], // Asegurar que siempre sea un array
            tagIds: productTagsResult.map((pt) => pt.tagId),
            createdAt: product.createdAt.toISOString(),
            updatedAt: product.updatedAt.toISOString(),
          }
        }),
      )

      return productsWithTags
    } catch (error) {
      console.error("Error fetching products:", error)
      // Fallback a datos en memoria para propósito demostrativo
      return this.getMemoryProducts()
    }
  }

  async getProductById(id: number): Promise<ProductWithRelations | null> {
    try {
      const result = await db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          story: products.story,
          price: products.price,
          categoryId: products.categoryId,
          categoryName: categories.name,
          images: products.images,
          materials: products.materials,
          dimensions: products.dimensions,
          care: products.care,
          stock: products.stock,
          availabilityType: products.availabilityType, // Nuevo campo
          estimatedDeliveryDays: products.estimatedDeliveryDays, // Nuevo campo
          isNew: products.isNew,
          isActive: products.isActive,
          hasWarranty: products.hasWarranty,
          warrantyDuration: products.warrantyDuration,
          warrantyUnit: products.warrantyUnit,
          discountId: products.discountId,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(products.id, id))
        .limit(1)

      if (result.length === 0) return null

      const product = result[0]

      // Obtener tags del producto
      const productTagsResult = await db
        .select({
          tagId: productTags.tagId,
        })
        .from(productTags)
        .where(eq(productTags.productId, product.id))

      return {
        ...product,
        price: Number.parseFloat(product.price),
        images: product.images || [], // Asegurar que siempre sea un array
        tagIds: productTagsResult.map((pt) => pt.tagId),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      }
    } catch (error) {
      console.error("Error fetching product by id:", error)
      // Fallback a datos en memoria
      const memoryProducts = this.getMemoryProducts()
      return memoryProducts.find((p) => p.id === id) || null
    }
  }

  async createProduct(
    data: Omit<ProductWithRelations, "id" | "createdAt" | "updatedAt" | "categoryName">,
  ): Promise<number> {
    try {
      const result = await db.insert(products).values({
        name: data.name,
        description: data.description,
        story: data.story,
        price: data.price.toString(),
        categoryId: data.categoryId,
        images: data.images.length > 0 ? data.images : [], // Permitir array vacío
        materials: data.materials,
        dimensions: data.dimensions,
        care: data.care,
        stock: data.stock,
        availabilityType: data.availabilityType, // Nuevo campo
        estimatedDeliveryDays: data.estimatedDeliveryDays, // Nuevo campo
        isNew: data.isNew,
        isActive: data.isActive,
        hasWarranty: data.hasWarranty,
        warrantyDuration: data.warrantyDuration,
        warrantyUnit: data.warrantyUnit,
        discountId: data.discountId,
      })

      const productId = result.insertId

      // Insertar tags del producto
      if (data.tagIds.length > 0) {
        await db.insert(productTags).values(
          data.tagIds.map((tagId) => ({
            productId: Number(productId),
            tagId,
          })),
        )
      }

      return Number(productId)
    } catch (error) {
      console.error("Error creating product:", error)
      throw new Error("Failed to create product")
    }
  }

  async updateProduct(id: number, data: Partial<ProductWithRelations>): Promise<boolean> {
    try {
      await db
        .update(products)
        .set({
          name: data.name,
          description: data.description,
          story: data.story,
          price: data.price?.toString(),
          categoryId: data.categoryId,
          images: data.images !== undefined ? (data.images.length > 0 ? data.images : []) : undefined, // Permitir array vacío
          materials: data.materials,
          dimensions: data.dimensions,
          care: data.care,
          stock: data.stock,
          availabilityType: data.availabilityType, // Nuevo campo
          estimatedDeliveryDays: data.estimatedDeliveryDays, // Nuevo campo
          isNew: data.isNew,
          isActive: data.isActive,
          hasWarranty: data.hasWarranty,
          warrantyDuration: data.warrantyDuration,
          warrantyUnit: data.warrantyUnit,
          discountId: data.discountId,
        })
        .where(eq(products.id, id))

      // Actualizar tags si se proporcionan
      if (data.tagIds !== undefined) {
        // Eliminar tags existentes
        await db.delete(productTags).where(eq(productTags.productId, id))

        // Insertar nuevos tags
        if (data.tagIds.length > 0) {
          await db.insert(productTags).values(
            data.tagIds.map((tagId) => ({
              productId: id,
              tagId,
            })),
          )
        }
      }

      return true
    } catch (error) {
      console.error("Error updating product:", error)
      return false
    }
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      // Eliminar tags del producto
      await db.delete(productTags).where(eq(productTags.productId, id))

      // Eliminar producto (soft delete)
      await db.update(products).set({ isActive: false }).where(eq(products.id, id))

      return true
    } catch (error) {
      console.error("Error deleting product:", error)
      return false
    }
  }

  // Método de fallback con datos en memoria
  private getMemoryProducts(): ProductWithRelations[] {
    return [
      {
        id: 1,
        name: "Collar Luna Dorada",
        description: "Elegante collar con dije de luna en baño de oro",
        story: "Inspirado en las noches de luna llena...",
        price: 45.0,
        categoryId: "cat_1",
        categoryName: "collares",
        images: ["/placeholder.svg?height=300&width=300"],
        materials: ["Baño de oro 18k", "Aleación hipoalergénica"],
        dimensions: "Dije: 2.5cm x 2cm, Cadena: 45cm",
        care: "Evitar contacto con perfumes y agua",
        stock: 15,
        availabilityType: "stock_only", // Nuevo campo
        estimatedDeliveryDays: 7, // Nuevo campo
        isNew: true,
        isActive: true,
        hasWarranty: true,
        warrantyDuration: 6,
        warrantyUnit: "months",
        discountId: undefined,
        tagIds: ["tag_1", "tag_4"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Anillo Personalizado",
        description: "Anillo único hecho a medida",
        price: 85.0,
        categoryId: "cat_4",
        categoryName: "anillos",
        images: [], // Producto sin imagen
        stock: 0,
        availabilityType: "order_only", // Solo a pedido
        estimatedDeliveryDays: 14,
        isNew: false,
        isActive: true,
        hasWarranty: true,
        warrantyDuration: 1,
        warrantyUnit: "years",
        tagIds: ["tag_2"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // ... más productos de ejemplo
    ]
  }
}

export const productsRepository = new ProductsRepository()
