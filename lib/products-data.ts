export interface ProductDetail {
  id: number;
  name: string;
  description: string;
  story: string | null;
  price: number;
  images: string[];
  categoryId: string;
  categoryName?: string;
  materials: string[] | null;
  dimensions: string | null;
  care: string | null;
  stock: number;
  availabilityType: "stock_only" | "stock_and_order" | "order_only";
  estimatedDeliveryDays: number | null;
  hasReturns: boolean;
  returnPeriodDays: number;
  isNew: boolean;
  isActive: boolean;
  hasWarranty: boolean;
  warrantyDuration: number | null;
  warrantyUnit: "days" | "months" | "years" | null;
  discountId: string | null;
}
