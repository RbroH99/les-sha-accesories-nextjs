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

export interface Discount {
  id: string;
  name: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number;
  reason: string;
  startDate?: Date | string;
  endDate?: Date | string;
  isActive: boolean;
  productIds: string[];
  isGeneric: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface DiscountsContextType {
  discounts: Discount[];
  loadingDiscounts: boolean;
  fetchDiscounts: () => Promise<void>;
  createDiscount: (
    data: Omit<Discount, "id" | "createdAt" | "updatedAt">
  ) => Promise<string | undefined>;
  updateDiscount: (
    id: string,
    data: Partial<Omit<Discount, "id" | "createdAt">>
  ) => Promise<boolean>;
  deleteDiscount: (id: string) => Promise<boolean>;
  getDiscountById: (id: string) => Discount | undefined;
  getActiveDiscountsForProduct: (productId: string) => Discount[];
  calculateDiscountedPrice: (
    originalPrice: number,
    productId: string
  ) => { price: number; discount?: Discount };
}

const DiscountsContext = createContext<DiscountsContextType | null>(null);

export function DiscountsProvider({ children }: { children: ReactNode }) {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(true);
  const { toast } = useToast();

  const fetchDiscounts = useCallback(async () => {
    setLoadingDiscounts(true);
    try {
      const response = await fetch("/api/discounts");
      if (!response.ok) {
        throw new Error("Failed to fetch discounts");
      }
      const data: Discount[] = await response.json();
      setDiscounts(data);
    } catch (error) {
      console.error("Error fetching discounts:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los descuentos.",
        variant: "destructive",
      });
    } finally {
      setLoadingDiscounts(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const createDiscount = async (
    data: Omit<Discount, "id" | "createdAt" | "updatedAt">
  ): Promise<string | undefined> => {
    try {
      const response = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        await fetchDiscounts(); // Re-fetch to get the new discount with ID
        toast({
          title: "Descuento creado",
          description: `Descuento '${data.name}' creado exitosamente.`,
        });
        return result.id;
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al crear descuento.",
          variant: "destructive",
        });
        return undefined;
      }
    } catch (error) {
      console.error("Error creating discount:", error);
      toast({
        title: "Error",
        description: "Error de red al crear descuento.",
        variant: "destructive",
      });
      return undefined;
    }
  };

  const updateDiscount = async (
    id: string,
    data: Partial<Omit<Discount, "id" | "createdAt">>
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/discounts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        await fetchDiscounts(); // Re-fetch to update the state
        toast({
          title: "Descuento actualizado",
          description: `Descuento actualizado exitosamente.`,
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al actualizar descuento.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error updating discount:", error);
      toast({
        title: "Error",
        description: "Error de red al actualizar descuento.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteDiscount = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/discounts/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (response.ok) {
        setDiscounts((prev) => prev.filter((d) => d.id !== id));
        toast({
          title: "Descuento eliminado",
          description: "Descuento eliminado exitosamente.",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al eliminar descuento.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error deleting discount:", error);
      toast({
        title: "Error",
        description: "Error de red al eliminar descuento.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getDiscountById = (id: string): Discount | undefined => {
    return discounts.find((discount) => discount.id === id);
  };

  const getActiveDiscountsForProduct = useCallback(
    (productId: string): Discount[] => {
      const now = new Date();
      return discounts.filter(
        (discount) =>
          discount.isActive &&
          (discount.isGeneric || discount.productIds.includes(productId)) &&
          (!discount.startDate || new Date(discount.startDate) <= now) &&
          (!discount.endDate || new Date(discount.endDate) >= now)
      );
    },
    [discounts]
  );

  const calculateDiscountedPrice = useCallback(
    (
      originalPrice: number,
      productId: string
    ): { price: number; discount?: Discount } => {
      const activeDiscounts = getActiveDiscountsForProduct(productId);

      if (activeDiscounts.length === 0) {
        return { price: originalPrice };
      }

      let bestDiscount = activeDiscounts[0];
      let bestPrice = originalPrice;

      for (const discount of activeDiscounts) {
        let discountedPrice = originalPrice;

        if (discount.type === "percentage") {
          discountedPrice = originalPrice * (1 - discount.value / 100);
        } else {
          discountedPrice = originalPrice - discount.value;
        }

        if (discountedPrice < bestPrice) {
          bestPrice = discountedPrice;
          bestDiscount = discount;
        }
      }

      return {
        price: Math.max(0, bestPrice),
        discount: bestDiscount,
      };
    },
    [getActiveDiscountsForProduct]
  );

  return (
    <DiscountsContext.Provider
      value={{
        discounts,
        loadingDiscounts,
        fetchDiscounts,
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
  );
}

export function useDiscounts() {
  const context = useContext(DiscountsContext);
  if (!context) {
    throw new Error("useDiscounts must be used within a DiscountsProvider");
  }
  return context;
}
