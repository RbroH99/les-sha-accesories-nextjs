"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

import { useToast } from "@/hooks/use-toast";

export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductTag {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesContextType {
  categories: Category[];
  tags: ProductTag[];
  loadingCategories: boolean;
  loadingTags: boolean;
  fetchCategories: () => Promise<void>;
  fetchTags: () => Promise<void>;
  createCategory: (
    data: Omit<Category, "id" | "createdAt" | "updatedAt">
  ) => Promise<string | undefined>;
  updateCategory: (
    id: string,
    data: Partial<Omit<Category, "createdAt" | "updatedAt">>
  ) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  createTag: (
    data: Omit<ProductTag, "id" | "createdAt" | "updatedAt">
  ) => Promise<string | undefined>;
  updateTag: (
    id: string,
    data: Partial<Omit<ProductTag, "createdAt" | "updatedAt">>
  ) => Promise<boolean>;
  deleteTag: (id: string) => Promise<boolean>;
  getCategoryById: (id: string) => Category | undefined;
  getTagById: (id: string) => ProductTag | undefined;
}

const CategoriesContext = createContext<CategoriesContextType | null>(null);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTags, setLoadingTags] = useState(true);
  const { toast } = useToast();

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data: Category[] = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías.",
        variant: "destructive",
      });
    } finally {
      setLoadingCategories(false);
    }
  }, [toast]);

  const fetchTags = useCallback(async () => {
    setLoadingTags(true);
    try {
      const response = await fetch("/api/tags");
      if (!response.ok) {
        throw new Error("Failed to fetch tags");
      }
      const data: ProductTag[] = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las etiquetas.",
        variant: "destructive",
      });
    } finally {
      setLoadingTags(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, [fetchCategories, fetchTags]);

  const createCategory = async (
    data: Omit<Category, "id" | "createdAt" | "updatedAt">
  ): Promise<string | undefined> => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        setCategories((prev) => [...prev, result.category]);
        toast({
          title: "Categoría creada",
          description: `Categoría '${result.category.name}' creada exitosamente.`,
        });
        return result.category.id;
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al crear categoría.",
          variant: "destructive",
        });
        return undefined;
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Error",
        description: "Error de red al crear categoría.",
        variant: "destructive",
      });
      return undefined;
    }
  };

  const updateCategory = async (
    id: string,
    data: Partial<Omit<Category, "createdAt" | "updatedAt">>
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...result.category } : c))
        );
        toast({
          title: "Categoría actualizada",
          description: `Categoría '${result.category.name}' actualizada exitosamente.`,
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al actualizar categoría.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Error",
        description: "Error de red al actualizar categoría.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (response.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        toast({
          title: "Categoría eliminada",
          description: "Categoría eliminada exitosamente.",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al eliminar categoría.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Error de red al eliminar categoría.",
        variant: "destructive",
      });
      return false;
    }
  };

  const createTag = async (
    data: Omit<ProductTag, "id" | "createdAt" | "updatedAt">
  ): Promise<string | undefined> => {
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        setTags((prev) => [...prev, result.tag]);
        toast({
          title: "Etiqueta creada",
          description: `Etiqueta '${result.tag.name}' creada exitosamente.`,
        });
        return result.tag.id;
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al crear etiqueta.",
          variant: "destructive",
        });
        return undefined;
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      toast({
        title: "Error",
        description: "Error de red al crear etiqueta.",
        variant: "destructive",
      });
      return undefined;
    }
  };

  const updateTag = async (
    id: string,
    data: Partial<Omit<ProductTag, "createdAt" | "updatedAt">>
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        setTags((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...result.tag } : t))
        );
        toast({
          title: "Etiqueta actualizada",
          description: `Etiqueta '${result.tag.name}' actualizada exitosamente.`,
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al actualizar etiqueta.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error updating tag:", error);
      toast({
        title: "Error",
        description: "Error de red al actualizar etiqueta.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteTag = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (response.ok) {
        setTags((prev) => prev.filter((t) => t.id !== id));
        toast({
          title: "Etiqueta eliminada",
          description: "Etiqueta eliminada exitosamente.",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al eliminar etiqueta.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast({
        title: "Error",
        description: "Error de red al eliminar etiqueta.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);
  const getTagById = (id: string) => tags.find((t) => t.id === id);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        tags,
        loadingCategories,
        loadingTags,
        fetchCategories,
        fetchTags,
        createCategory,
        updateCategory,
        deleteCategory,
        createTag,
        updateTag,
        deleteTag,
        getCategoryById,
        getTagById,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx)
    throw new Error("useCategories must be used within a CategoriesProvider");
  return ctx;
}
