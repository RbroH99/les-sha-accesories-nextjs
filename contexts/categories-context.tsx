"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Category {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
}

export interface Tag {
  id: string
  name: string
  color: string
  isActive: boolean
  createdAt: string
}

interface CategoriesContextType {
  categories: Category[]
  tags: Tag[]
  createCategory: (data: Omit<Category, "id" | "createdAt">) => Promise<string>
  updateCategory: (id: string, data: Partial<Category>) => Promise<boolean>
  deleteCategory: (id: string) => Promise<boolean>
  createTag: (data: Omit<Tag, "id" | "createdAt">) => Promise<string>
  updateTag: (id: string, data: Partial<Tag>) => Promise<boolean>
  deleteTag: (id: string) => Promise<boolean>
  getCategoryById: (id: string) => Category | undefined
  getTagById: (id: string) => Tag | undefined
}

const CategoriesContext = createContext<CategoriesContextType | null>(null)

const CATEGORIES_STORAGE_KEY = "bisuteria_categories"
const TAGS_STORAGE_KEY = "bisuteria_tags"

const defaultCategories: Category[] = [
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

const defaultTags: Tag[] = [
  { id: "tag_1", name: "elegante", color: "#8B5CF6", isActive: true, createdAt: new Date().toISOString() },
  { id: "tag_2", name: "casual", color: "#10B981", isActive: true, createdAt: new Date().toISOString() },
  { id: "tag_3", name: "vintage", color: "#F59E0B", isActive: true, createdAt: new Date().toISOString() },
  { id: "tag_4", name: "moderno", color: "#EF4444", isActive: true, createdAt: new Date().toISOString() },
]

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])

  // carga inicial
  useEffect(() => {
    const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY)
    const storedTags = localStorage.getItem(TAGS_STORAGE_KEY)

    if (storedCategories) {
      setCategories(JSON.parse(storedCategories))
    } else {
      setCategories(defaultCategories)
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(defaultCategories))
    }

    if (storedTags) {
      setTags(JSON.parse(storedTags))
    } else {
      setTags(defaultTags)
      localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(defaultTags))
    }
  }, [])

  // persistencia
  useEffect(() => {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags))
  }, [tags])

  // CRUD categorías
  const createCategory = async (data: Omit<Category, "id" | "createdAt">): Promise<string> => {
    const newCategory: Category = { ...data, id: `cat_${Date.now()}`, createdAt: new Date().toISOString() }
    setCategories((prev) => [...prev, newCategory])
    return newCategory.id
  }

  const updateCategory = async (id: string, data: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
    return true
  }

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
    return true
  }

  // CRUD tags
  const createTag = async (data: Omit<Tag, "id" | "createdAt">): Promise<string> => {
    const newTag: Tag = { ...data, id: `tag_${Date.now()}`, createdAt: new Date().toISOString() }
    setTags((prev) => [...prev, newTag])
    return newTag.id
  }

  const updateTag = async (id: string, data: Partial<Tag>) => {
    setTags((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)))
    return true
  }

  const deleteTag = async (id: string) => {
    setTags((prev) => prev.filter((t) => t.id !== id))
    return true
  }

  const getCategoryById = (id: string) => categories.find((c) => c.id === id)
  const getTagById = (id: string) => tags.find((t) => t.id === id)

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        tags,
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
  )
}

export function useCategories() {
  const ctx = useContext(CategoriesContext)
  if (!ctx) throw new Error("useCategories must be used within a CategoriesProvider")
  return ctx
}
