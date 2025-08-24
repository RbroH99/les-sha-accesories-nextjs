import {
  pgTable,
  varchar,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  json,
  pgEnum,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Tabla de categorías
export const categories = pgTable("categories", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Tabla de tags
export const tags = pgTable("tags", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Tabla de descuentos
export const discountTypeEnum = pgEnum("discount_type", [
  "percentage",
  "fixed",
]);

export const discounts = pgTable("discounts", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: discountTypeEnum("type").notNull(),
  value: numeric("value", { precision: 10, scale: 2 }).notNull(),
  reason: varchar("reason", { length: 100 }).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true).notNull(),
  isGeneric: boolean("is_generic").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Tabla de productos
export const availabilityTypeEnum = pgEnum("availability_type", [
  "stock_only",
  "stock_and_order",
  "order_only",
]);
export const warrantyUnitEnum = pgEnum("warranty_unit", [
  "days",
  "months",
  "years",
]);

export const products = pgTable("products", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  story: text("story"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: varchar("category_id", { length: 50 }).notNull(),
  images: json("images").$type<string[]>().default([]).notNull(),
  materials: json("materials").$type<string[]>(),
  dimensions: varchar("dimensions", { length: 255 }),
  care: text("care"),
  stock: integer("stock").default(0).notNull(),
  availabilityType: availabilityTypeEnum("availability_type")
    .default("stock_only")
    .notNull(),
  estimatedDeliveryDays: integer("estimated_delivery_days").default(7),
  hasReturns: boolean("has_returns").default(false).notNull(),
  returnPeriodDays: integer("return_period_days").default(30).notNull(),
  isNew: boolean("is_new").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  hasWarranty: boolean("has_warranty").default(false).notNull(),
  warrantyDuration: integer("warranty_duration"),
  warrantyUnit: warrantyUnitEnum("warranty_unit"),
  discountId: varchar("discount_id", { length: 50 }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Tabla de relación productos-tags (muchos a muchos)
export const productTags = pgTable("product_tags", {
  productId: varchar("product_id").notNull(),
  tagId: varchar("tag_id", { length: 50 }).notNull(),
});

// Tabla de relación descuentos-productos (muchos a muchos)
export const discountProducts = pgTable("discount_products", {
  discountId: varchar("discount_id", { length: 50 }).notNull(),
  productId: varchar("product_id").notNull(),
});

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

// Tabla de usuarios
export const users = pgTable("users", {
  id: varchar("id", { length: 50 }).primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: text("password").notNull(), // Added password field
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  role: userRoleEnum("role").default("user").notNull(),
  defaultAddress: json("default_address").$type<{
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Tabla de pedidos
export const orderStatusEnum = pgEnum("order_status", [
  "pendiente",
  "aceptado",
  "en_proceso",
  "enviado",
  "entregado",
  "cancelado",
]);

export const orders = pgTable("orders", {
  id: varchar("id", { length: 50 }).primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }),
  shippingAddress: json("shipping_address").$type<{
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").default("pendiente").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Tabla de items del pedido
export const orderItems = pgTable("order_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: varchar("order_id", { length: 50 }).notNull(),
  productId: varchar("product_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  image: varchar("image", { length: 500 }),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }).notNull(),
  finalPrice: numeric("final_price", { precision: 10, scale: 2 }).notNull(),
  discountType: discountTypeEnum("discount_type"),
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }),
});

// Tabla de mensajes de contacto
export const contactMessageStatusEnum = pgEnum("contact_message_status", [
  "new",
  "read",
  "replied",
]);

export const contactMessages = pgTable("contact_messages", {
  id: integer("id").primaryKey().notNull(), // Removed autoincrement for PostgreSQL
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: contactMessageStatusEnum("status").default("new").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Relaciones
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  productTags: many(productTags),
}));

export const discountsRelations = relations(discounts, ({ many }) => ({
  products: many(products),
  discountProducts: many(discountProducts),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  discount: one(discounts, {
    fields: [products.discountId],
    references: [discounts.id],
  }),
  productTags: many(productTags),
  orderItems: many(orderItems),
  favorite: one(favorites),
  cartItem: one(cartItems),
}));

export const productTagsRelations = relations(productTags, ({ one }) => ({
  product: one(products, {
    fields: [productTags.productId],
    references: [products.id],
  }),
  tag: one(tags, {
    fields: [productTags.tagId],
    references: [tags.id],
  }),
}));

export const discountProductsRelations = relations(
  discountProducts,
  ({ one }) => ({
    discount: one(discounts, {
      fields: [discountProducts.discountId],
      references: [discounts.id],
    }),
    product: one(products, {
      fields: [discountProducts.productId],
      references: [products.id],
    }),
  })
);

export const usersRelations = relations(users, ({ one, many }) => ({
  orders: many(orders),
  favorites: many(favorites),
  cart: one(carts, {
    fields: [users.id],
    references: [carts.userId],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// Tabla de favoritos
export const favorites = pgTable("favorites", {
  id: varchar("id", { length: 50 }).primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  productId: varchar("product_id", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [favorites.productId],
    references: [products.id],
  }),
}));

// Tabla de carritos
export const carts = pgTable("carts", {
  id: varchar("id", { length: 50 }).primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

// Tabla de items del carrito
export const cartItems = pgTable("cart_items", {
  id: varchar("id", { length: 50 }).primaryKey(),
  cartId: varchar("cart_id", { length: 50 }).notNull(),
  productId: varchar("product_id", { length: 50 }).notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

// Tabla de refresh tokens
export const refreshTokens = pgTable("refresh_tokens", {
  id: varchar("id", { length: 50 }).primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull().unique(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
});

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

// Tabla de configuraciones
export const settings = pgTable("settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: json("value"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});
