"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

export interface Discount {
  id: string
  name: string
  description?: string
  type: "percentage" | "fixed"
  value: number
  reason: string
  startDate?: string // Hacer opcional
  endDate?: string // Hacer opcional
  isActive: boolean
  productIds: number[]
  isGeneric: boolean // Nuevo campo para descuentos genéricos
  createdAt: string
}

interface DiscountsContextType {
  discounts: Discount[]
  createDiscount: (data: Omit<Discount, "id" | "createdAt">) => Promise<string>
  updateDiscount: (id: string, data: Partial<Discount>) => Promise<boolean>
  deleteDiscount: (id: string) => Promise<boolean>
  getDiscountById: (id: string) => Discount | undefined
  getActiveDiscountsForProduct: (productId: number) => Discount[]
  calculateDiscountedPrice: (originalPrice: number, productId: number) => { price: number; discount?: Discount }
}

const DiscountsContext = createContext<DiscountsContextType | null>(null)

const DISCOUNTS_STORAGE_KEY = "bisuteria_discounts"

export function DiscountsProvider({ children }: { children: ReactNode }) {
  const [discounts, setDiscounts] = useState<Discount[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(DISCOUNTS_STORAGE_KEY)
    if (stored) {
      setDiscounts(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(DISCOUNTS_STORAGE_KEY, JSON.stringify(discounts))
  }, [discounts])

  const createDiscount = async (data: Omit<Discount, "id" | "createdAt">): Promise<string> => {
    const newDiscount: Discount = {
      ...data,
      id: `discount_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    setDiscounts((prev) => [...prev, newDiscount])
    return newDiscount.id
  }

  const updateDiscount = async (id: string, data: Partial<Discount>): Promise<boolean> => {
    try {
      setDiscounts((prev) => prev.map((discount) => (discount.id === id ? { ...discount, ...data } : discount)))
      return true
    } catch (error) {
      return false
    }
  }

  const deleteDiscount = async (id: string): Promise<boolean> => {
    try {
      setDiscounts((prev) => prev.filter((discount) => discount.id !== id))
      return true
    } catch (error) {
      return false
    }
  }

  const getDiscountById = (id: string): Discount | undefined => {
    return discounts.find((discount) => discount.id === id)
  }

  const getActiveDiscountsForProduct = useCallback(
    (productId: number): Discount[] => {
      const now = new Date()
      return discounts.filter(
        (discount) =>
          discount.isActive &&
          discount.productIds.includes(productId) &&
          (discount.isGeneric ||
            ((!discount.startDate || new Date(discount.startDate) <= now) &&
              (!discount.endDate || new Date(discount.endDate) >= now))),
      )
    },
    [discounts],
  )

  const calculateDiscountedPrice = useCallback(
    (originalPrice: number, productId: number): { price: number; discount?: Discount } => {
      const activeDiscounts = getActiveDiscountsForProduct(productId)

      if (activeDiscounts.length === 0) {
        return { price: originalPrice }
      }

      // Aplicar el mejor descuento (el que da mayor reducción)
      let bestDiscount = activeDiscounts[0]
      let bestPrice = originalPrice

      for (const discount of activeDiscounts) {
        let discountedPrice = originalPrice

        if (discount.type === "percentage") {
          discountedPrice = originalPrice * (1 - discount.value / 100)
        } else {
          discountedPrice = originalPrice - discount.value
        }

        if (discountedPrice < bestPrice) {
          bestPrice = discountedPrice
          bestDiscount = discount
        }
      }

      return {
        price: Math.max(0, bestPrice), // No permitir precios negativos
        discount: bestDiscount,
      }
    },
    [discounts],
  )

  return (
    <DiscountsContext.Provider
      value={{
        discounts,
        createDiscount,
        updateDiscount,
        deleteDiscount,
        getDiscountById,
        getActiveDiscountsForProduct,
        calculateDiscountedPrice,
      }}
    >
      {children}
    </DiscountsContext.Provider>
  )
}

export function useDiscounts() {
  const context = useContext(DiscountsContext)
  if (!context) {
    throw new Error("useDiscounts must be used within a DiscountsProvider")
  }
  return context
}
