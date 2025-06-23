import { db } from "@/lib/db"
import { categories, tags } from "@/lib/schema"
import { eq } from "drizzle-orm"
import type { Category, Tag } from "@/contexts/categories-context"

export class CategoriesRepository {
  // Categorías
  async getAllCategories(): Promise<Category[]> {
    try {
      const result = await db.select().from(categories)
      return result.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || undefined,
        isActive: cat.isActive,
        createdAt: cat.createdAt.toISOString(),
      }))
    } catch (error) {
      console.error("Error fetching categories:", error)
      // Fallback a datos en memoria para propósito demostrativo
      return this.getMemoryCategories()
    }
  }

  async createCategory(data: Omit<Category, "id" | "createdAt">): Promise<string> {
    try {
      const id = `cat_${Date.now()}`
      await db.insert(categories).values({
        id,
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      })
      return id
    } catch (error) {
      console.error("Error creating category:", error)
      throw new Error("Failed to create category")
    }
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<boolean> {
    try {
      await db
        .update(categories)
        .set({
          name: data.name,
          description: data.description,
          isActive: data.isActive,
        })
        .where(eq(categories.id, id))
      return true
    } catch (error) {
      console.error("Error updating category:", error)
      return false
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      await db.delete(categories).where(eq(categories.id, id))
      return true
    } catch (error) {
      console.error("Error deleting category:", error)
      return false
    }
  }

  // Tags
  async getAllTags(): Promise<Tag[]> {
    try {
      const result = await db.select().from(tags)
      return result.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        isActive: tag.isActive,
        createdAt: tag.createdAt.toISOString(),
      }))
    } catch (error) {
      console.error("Error fetching tags:", error)
      // Fallback a datos en memoria para propósito demostrativo
      return this.getMemoryTags()
    }
  }

  async createTag(data: Omit<Tag, "id" | "createdAt">): Promise<string> {
    try {
      const id = `tag_${Date.now()}`
      await db.insert(tags).values({
        id,
        name: data.name,
        color: data.color,
        isActive: data.isActive,
      })
      return id
    } catch (error) {
      console.error("Error creating tag:", error)
      throw new Error("Failed to create tag")
    }
  }

  async updateTag(id: string, data: Partial<Tag>): Promise<boolean> {
    try {
      await db
        .update(tags)
        .set({
          name: data.name,
          color: data.color,
          isActive: data.isActive,
        })
        .where(eq(tags.id, id))
      return true
    } catch (error) {
      console.error("Error updating tag:", error)
      return false
    }
  }

  async deleteTag(id: string): Promise<boolean> {
    try {
      await db.delete(tags).where(eq(tags.id, id))
      return true
    } catch (error) {
      console.error("Error deleting tag:", error)
      return false
    }
  }

  // Métodos de fallback con datos en memoria
  private getMemoryCategories(): Category[] {
    return [
      {
        id: "cat_1",
        name: "collares",
        description: "Collares artesanales únicos y elegantes",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "cat_2",
        name: "aretes",
        description: "Aretes delicados y llamativos para toda ocasión",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "cat_3",
        name: "pulseras",
        description: "Pulseras cómodas y hermosas hechas a mano",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "cat_4",
        name: "accesorios",
        description: "Anillos, broches y otros accesorios especiales",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ]
  }

  private getMemoryTags(): Tag[] {
    return [
      { id: "tag_1", name: "elegante", color: "#8B5CF6", isActive: true, createdAt: new Date().toISOString() },
      { id: "tag_2", name: "casual", color: "#10B981", isActive: true, createdAt: new Date().toISOString() },
      { id: "tag_3", name: "vintage", color: "#F59E0B", isActive: true, createdAt: new Date().toISOString() },
      { id: "tag_4", name: "moderno", color: "#EF4444", isActive: true, createdAt: new Date().toISOString() },
    ]
  }
}

export const categoriesRepository = new CategoriesRepository()
