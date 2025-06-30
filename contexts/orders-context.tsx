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
import { useAuth } from "./auth-context";

export type OrderStatus =
  | "pendiente"
  | "aceptado"
  | "en_proceso"
  | "enviado"
  | "entregado"
  | "cancelado";

export interface OrderItem {
  id: number;
  orderId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrdersContextType {
  orders: Order[];
  userOrders: Order[];
  loadingOrders: boolean;
  fetchOrders: () => Promise<void>;
  createOrder: (
    orderData: Omit<Order, "id" | "userId" | "createdAt" | "updatedAt" | "status">
  ) => Promise<string | undefined>;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus
  ) => Promise<boolean>;
  deleteOrder: (id: string) => Promise<boolean>;
  getOrderById: (orderId: string) => Order | undefined;
}

const OrdersContext = createContext<OrdersContextType | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const response = await fetch("/api/orders");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data: Order[] = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes.",
        variant: "destructive",
      });
    } finally {
      setLoadingOrders(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const userOrders = orders.filter((order) => order.userId === user?.id);

  const createOrder = async (
    orderData: Omit<Order, "id" | "userId" | "createdAt" | "updatedAt" | "status">
  ): Promise<string | undefined> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Usuario no autenticado.",
        variant: "destructive",
      });
      return undefined;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...orderData, userId: user.id }),
      });
      const result = await response.json();
      if (response.ok) {
        setOrders((prev) => [...prev, result.order]);
        toast({
          title: "Orden creada",
          description: `Orden creada exitosamente.`,
        });
        return result.order.id;
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al crear la orden.",
          variant: "destructive",
        });
        return undefined;
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Error de red al crear la orden.",
        variant: "destructive",
      });
      return undefined;
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (response.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...result.order } : o))
        );
        toast({
          title: "Orden actualizada",
          description: `El estado de la orden ha sido actualizado.`,
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al actualizar la orden.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Error",
        description: "Error de red al actualizar la orden.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteOrder = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (response.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
        toast({
          title: "Orden eliminada",
          description: "Orden eliminada exitosamente.",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al eliminar la orden.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast({
        title: "Error",
        description: "Error de red al eliminar la orden.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find((order) => order.id === orderId);
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        userOrders,
        loadingOrders,
        fetchOrders,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        getOrderById,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
}