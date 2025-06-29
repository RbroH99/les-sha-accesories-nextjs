import { db } from "@/lib/db";
import { products, categories, productTags } from "@/lib/schema";
import { eq, and, inArray, like, gte, lte, desc, asc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export interface ProductWithRelations {
  id: string;
  name: string;
  description: string;
  story?: string;
  price: number;
  categoryId: string;
  categoryName?: string;
  images: string[];
  materials?: string[];
  dimensions?: string;
  care?: string;
  stock: number;
  availabilityType: "stock_only" | "stock_and_order" | "order_only"; // Nuevo campo
  estimatedDeliveryDays?: number; // Nuevo campo
  isNew: boolean;
  isActive: boolean;
  hasWarranty: boolean;
  warrantyDuration?: number;
  warrantyUnit?: "days" | "months" | "years";
  discountId?: string;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  categoryIds?: string[];
  tagIds?: string[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
  isNew?: boolean;
  hasDiscount?: boolean;
  availabilityType?: "stock_only" | "stock_and_order" | "order_only"; // Nuevo filtro
  sortBy?: "name" | "price" | "stock" | "created_at";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export class ProductsRepository {
  async getAllProducts(
    filters?: ProductFilters
  ): Promise<ProductWithRelations[]> {
    try {
      // Construir query base
      const conditions = [eq(products.isActive, true)];

      // Aplicar filtros
      if (filters) {
        if (filters.categoryIds?.length) {
          conditions.push(inArray(products.categoryId, filters.categoryIds));
        }

        if (filters.search) {
          conditions.push(like(products.name, `%${filters.search}%`));
        }

        if (filters.minPrice !== undefined) {
          conditions.push(gte(products.price, filters.minPrice.toString()));
        }

        if (filters.maxPrice !== undefined) {
          conditions.push(lte(products.price, filters.maxPrice.toString()));
        }

        if (filters.minStock !== undefined) {
          conditions.push(gte(products.stock, filters.minStock));
        }

        if (filters.maxStock !== undefined) {
          conditions.push(lte(products.stock, filters.maxStock));
        }

        if (filters.isNew !== undefined) {
          conditions.push(eq(products.isNew, filters.isNew));
        }

        if (filters.availabilityType) {
          conditions.push(
            eq(products.availabilityType, filters.availabilityType)
          );
        }
      }

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
        .where(and(...conditions));

      const result = await query;

      // Obtener tags para cada producto
      const productsWithTags = await Promise.all(
        result.map(async (product) => {
          const productTagsResult = await db
            .select({
              tagId: productTags.tagId,
            })
            .from(productTags)
            .where(eq(productTags.productId, product.id));

          return {
            ...product,
            discountId: product.discountId ?? undefined,
            warrantyUnit: product.warrantyUnit ?? undefined,
            warrantyDuration: product.warrantyDuration ?? undefined,
            estimatedDeliveryDays: product.estimatedDeliveryDays ?? undefined,
            care: product.care ?? undefined,
            dimensions: product.dimensions ?? undefined,
            materials: product.materials ?? undefined,
            categoryName: product.categoryName ?? undefined,
            story: product.story ?? undefined,
            price: Number.parseFloat(product.price),
            images: product.images || [], // Asegurar que siempre sea un array
            tagIds: productTagsResult.map((pt) => pt.tagId),
            createdAt: product.createdAt.toISOString(),
            updatedAt: product.updatedAt.toISOString(),
          };
        })
      );

      return productsWithTags;
    } catch (error) {
      console.error("Error fetching products:", error);
      // Fallback a datos en memoria para propósito demostrativo
      return this.getMemoryProducts();
    }
  }

  async getProductById(id: string): Promise<ProductWithRelations | null> {
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
        .limit(1);

      if (result.length === 0) return null;

      const product = result[0];

      // Obtener tags del producto
      const productTagsResult = await db
        .select({
          tagId: productTags.tagId,
        })
        .from(productTags)
        .where(eq(productTags.productId, product.id));

      return {
        ...product,
        discountId: product.discountId ?? undefined,
        warrantyUnit: product.warrantyUnit ?? undefined,
        warrantyDuration: product.warrantyDuration ?? undefined,
        estimatedDeliveryDays: product.estimatedDeliveryDays ?? undefined,
        care: product.care ?? undefined,
        dimensions: product.dimensions ?? undefined,
        materials: product.materials ?? undefined,
        categoryName: product.categoryName ?? undefined,
        story: product.story ?? undefined,
        price: Number.parseFloat(product.price),
        images: product.images || [], // Asegurar que siempre sea un array
        tagIds: productTagsResult.map((pt) => pt.tagId),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error("Error fetching product by id:", error);
      // Fallback a datos en memoria
      const memoryProducts = this.getMemoryProducts();
      return memoryProducts.find((p) => p.id === id) || null;
    }
  }

  async createProduct(
    data: Omit<
      ProductWithRelations,
      "id" | "createdAt" | "updatedAt" | "categoryName"
    >
  ): Promise<number> {
    try {
      const productId = uuidv4();
      const result = await db.insert(products).values({
        id: productId,
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
      });

      // Insertar tags del producto
      if (data.tagIds.length > 0) {
        await db.insert(productTags).values(
          data.tagIds.map((tagId) => ({
            productId: productId,
            tagId,
          }))
        );
      }

      return Number(productId);
    } catch (error) {
      console.error("Error creating product:", error);
      throw new Error("Failed to create product");
    }
  }

  async updateProduct(
    id: string,
    data: Partial<ProductWithRelations>
  ): Promise<boolean> {
    try {
      await db
        .update(products)
        .set({
          name: data.name,
          description: data.description,
          story: data.story,
          price: data.price?.toString(),
          categoryId: data.categoryId,
          images:
            data.images !== undefined
              ? data.images.length > 0
                ? data.images
                : []
              : undefined, // Permitir array vacío
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
        .where(eq(products.id, id));

      // Actualizar tags si se proporcionan
      if (data.tagIds !== undefined) {
        // Eliminar tags existentes
        await db.delete(productTags).where(eq(productTags.productId, id));

        // Insertar nuevos tags
        if (data.tagIds.length > 0) {
          await db.insert(productTags).values(
            data.tagIds.map((tagId) => ({
              productId: id,
              tagId,
            }))
          );
        }
      }

      return true;
    } catch (error) {
      console.error("Error updating product:", error);
      return false;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      // Eliminar tags del producto
      await db.delete(productTags).where(eq(productTags.productId, id));

      // Eliminar producto (soft delete)
      await db
        .update(products)
        .set({ isActive: false })
        .where(eq(products.id, id));

      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      return false;
    }
  }

  // Método de fallback con datos en memoria
  private getMemoryProducts(): ProductWithRelations[] {
    return [
      {
        id: "2c334-23424-34vvf-2v2v3",
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
        id: "w9e99-qwe00ew-qe0w-qqw",
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
    ];
  }
}

export const productsRepository = new ProductsRepository();

// export async function getAllProducts(): Promise<ProductDetail[]> {
//   const result = await db
//     .select({
//       id: products.id,
//       name: products.name,
//       description: products.description,
//       story: products.story,
//       price: products.price,
//       images: products.images,
//       categoryId: products.categoryId,
//       categoryName: categories.name,
//       materials: products.materials,
//       dimensions: products.dimensions,
//       care: products.care,
//       stock: products.stock,
//       availabilityType: products.availabilityType,
//       estimatedDeliveryDays: products.estimatedDeliveryDays,
//       hasReturns: products.hasReturns,
//       returnPeriodDays: products.returnPeriodDays,
//       isNew: products.isNew,
//       isActive: products.isActive,
//       hasWarranty: products.hasWarranty,
//       warrantyDuration: products.warrantyDuration,
//       warrantyUnit: products.warrantyUnit,
//       discountId: products.discountId,
//     })
//     .from(products)
//     .leftJoin(categories, eq(products.categoryId, categories.id))
//     .where(eq(products.isActive, true));

//   return result.map((p) => ({
//     ...p,
//     price: parseFloat(p.price as any), // Ensure price is a number
//     images: p.images || [], // Ensure images is an array
//     materials: p.materials || [], // Ensure materials is an array
//     categoryName: p.categoryName ?? undefined,
//   }));
// }

// export async function getProductById(
//   id: number
// ): Promise<ProductDetail | undefined> {
//   const result = await db
//     .select({
//       id: products.id,
//       name: products.name,
//       description: products.description,
//       story: products.story,
//       price: products.price,
//       images: products.images,
//       categoryId: products.categoryId,
//       categoryName: categories.name,
//       materials: products.materials,
//       dimensions: products.dimensions,
//       care: products.care,
//       stock: products.stock,
//       availabilityType: products.availabilityType,
//       estimatedDeliveryDays: products.estimatedDeliveryDays,
//       hasReturns: products.hasReturns,
//       returnPeriodDays: products.returnPeriodDays,
//       isNew: products.isNew,
//       isActive: products.isActive,
//       hasWarranty: products.hasWarranty,
//       warrantyDuration: products.warrantyDuration,
//       warrantyUnit: products.warrantyUnit,
//       discountId: products.discountId,
//     })
//     .from(products)
//     .leftJoin(categories, eq(products.categoryId, categories.id))
//     .where(and(eq(products.id, id), eq(products.isActive, true)))
//     .limit(1);

//   if (result.length === 0) {
//     return undefined;
//   }

//   const p = result[0];
//   return {
//     ...p,
//     price: parseFloat(p.price as any),
//     images: p.images || [],
//     materials: p.materials || [],
//     categoryName: p.categoryName ?? undefined,
//   };
// }

// export async function getRelatedProducts(
//   categoryId: string,
//   excludeId: number
// ): Promise<ProductDetail[]> {
//   const result = await db
//     .select({
//       id: products.id,
//       name: products.name,
//       description: products.description,
//       story: products.story,
//       price: products.price,
//       images: products.images,
//       categoryId: products.categoryId,
//       categoryName: categories.name,
//       materials: products.materials,
//       dimensions: products.dimensions,
//       care: products.care,
//       stock: products.stock,
//       availabilityType: products.availabilityType,
//       estimatedDeliveryDays: products.estimatedDeliveryDays,
//       hasReturns: products.hasReturns,
//       returnPeriodDays: products.returnPeriodDays,
//       isNew: products.isNew,
//       isActive: products.isActive,
//       hasWarranty: products.hasWarranty,
//       warrantyDuration: products.warrantyDuration,
//       warrantyUnit: products.warrantyUnit,
//       discountId: products.discountId,
//     })
//     .from(products)
//     .leftJoin(categories, eq(products.categoryId, categories.id))
//     .where(
//       and(
//         eq(products.categoryId, categoryId),
//         not(eq(products.id, excludeId)),
//         eq(products.isActive, true)
//       )
//     )
//     .limit(4);

//   return result.map((p) => ({
//     ...p,
//     price: parseFloat(p.price as any),
//     images: p.images || [],
//     materials: p.materials || [],
//     categoryName: p.categoryName ?? undefined,
//   }));
// }
