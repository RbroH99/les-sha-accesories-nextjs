import { db } from "@/lib/db";
import { categories, tags } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { Category, ProductTag } from "@/contexts/categories-context";

export class CategoriesRepository {
  // Categorías
  async getAllCategories(): Promise<Category[]> {
    try {
      const result = await db.select().from(categories);
      return result.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || undefined,
        isActive: cat.isActive,
        createdAt: cat.createdAt.toISOString(),
        updatedAt: cat.updatedAt.toISOString(), // ✅ necesario
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }

  async createCategory(
    data: Omit<Category, "id" | "createdAt">
  ): Promise<string> {
    try {
      const id = `cat_${Date.now()}`;
      await db.insert(categories).values({
        id,
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      });
      return id;
    } catch (error) {
      console.error("Error creating category:", error);
      throw new Error("Failed to create category");
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
        .where(eq(categories.id, id));
      return true;
    } catch (error) {
      console.error("Error updating category:", error);
      return false;
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      await db.delete(categories).where(eq(categories.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      return false;
    }
  }

  // Tags
  async getAllTags(): Promise<ProductTag[]> {
    try {
      const result = await db.select().from(tags);
      return result.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        isActive: tag.isActive,
        createdAt: tag.createdAt.toISOString(),
        updatedAt: tag.updatedAt.toISOString(), // ✅ necesario
      }));
    } catch (error) {
      console.error("Error fetching tags:", error);
      return [];
    }
  }

  async createTag(data: Omit<ProductTag, "id" | "createdAt">): Promise<string> {
    try {
      const id = `tag_${Date.now()}`;
      await db.insert(tags).values({
        id,
        name: data.name,
        color: data.color,
        isActive: data.isActive,
      });
      return id;
    } catch (error) {
      console.error("Error creating tag:", error);
      throw new Error("Failed to create tag");
    }
  }

  async updateTag(id: string, data: Partial<ProductTag>): Promise<boolean> {
    try {
      await db
        .update(tags)
        .set({
          name: data.name,
          color: data.color,
          isActive: data.isActive,
        })
        .where(eq(tags.id, id));
      return true;
    } catch (error) {
      console.error("Error updating tag:", error);
      return false;
    }
  }

  async deleteTag(id: string): Promise<boolean> {
    try {
      await db.delete(tags).where(eq(tags.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting tag:", error);
      return false;
    }
  }
}

export const categoriesRepository = new CategoriesRepository();
