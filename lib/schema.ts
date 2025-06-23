import { mysqlTable, varchar, text, decimal, int, boolean, timestamp, json, mysqlEnum } from "drizzle-orm/mysql-core"
import { relations } from "drizzle-orm"

// Tabla de categorías
export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
})

// Tabla de tags
export const tags = mysqlTable("tags", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
})

// Tabla de descuentos
export const discounts = mysqlTable("discounts", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["percentage", "fixed"]).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  reason: varchar("reason", { length: 100 }).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true).notNull(),
  isGeneric: boolean("is_generic").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
})

// Tabla de productos
export const products = mysqlTable("products", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  story: text("story"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: varchar("category_id", { length: 50 }).notNull(),
  images: json("images").$type<string[]>().default([]).notNull(),
  materials: json("materials").$type<string[]>(),
  dimensions: varchar("dimensions", { length: 255 }),
  care: text("care"),
  stock: int("stock").default(0).notNull(),
  availabilityType: mysqlEnum("availability_type", ["stock_only", "stock_and_order", "order_only"])
    .default("stock_only")
    .notNull(),
  estimatedDeliveryDays: int("estimated_delivery_days").default(7),
  returnPeriodDays: int("return_period_days").default(30).notNull(), // Nuevo campo para devoluciones
  isNew: boolean("is_new").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  hasWarranty: boolean("has_warranty").default(false).notNull(),
  warrantyDuration: int("warranty_duration"),
  warrantyUnit: mysqlEnum("warranty_unit", ["days", "months", "years"]),
  discountId: varchar("discount_id", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
})

// Tabla de relación productos-tags (muchos a muchos)
export const productTags = mysqlTable("product_tags", {
  productId: int("product_id").notNull(),
  tagId: varchar("tag_id", { length: 50 }).notNull(),
})

// Tabla de relación descuentos-productos (muchos a muchos)
export const discountProducts = mysqlTable("discount_products", {
  discountId: varchar("discount_id", { length: 50 }).notNull(),
  productId: int("product_id").notNull(),
})

// Tabla de usuarios
export const users = mysqlTable("users", {
  id: varchar("id", { length: 50 }).primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  defaultAddress: json("default_address").$type<{
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
})

// Tabla de pedidos
export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 50 }).primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }),
  shippingAddress: json("shipping_address").$type<{
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }>(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pendiente", "aceptado", "en_proceso", "enviado", "entregado", "cancelado"])
    .default("pendiente")
    .notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
})

// Tabla de items del pedido
export const orderItems = mysqlTable("order_items", {
  id: int("id").primaryKey().autoincrement(),
  orderId: varchar("order_id", { length: 50 }).notNull(),
  productId: int("product_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: int("quantity").notNull(),
  image: varchar("image", { length: 500 }),
})

// Tabla de mensajes de contacto
export const contactMessages = mysqlTable("contact_messages", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "read", "replied"]).default("new").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Relaciones
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  productTags: many(productTags),
}))

export const discountsRelations = relations(discounts, ({ many }) => ({
  products: many(products),
  discountProducts: many(discountProducts),
}))

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
}))

export const productTagsRelations = relations(productTags, ({ one }) => ({
  product: one(products, {
    fields: [productTags.productId],
    references: [products.id],
  }),
  tag: one(tags, {
    fields: [productTags.tagId],
    references: [tags.id],
  }),
}))

export const discountProductsRelations = relations(discountProducts, ({ one }) => ({
  discount: one(discounts, {
    fields: [discountProducts.discountId],
    references: [discounts.id],
  }),
  product: one(products, {
    fields: [discountProducts.productId],
    references: [products.id],
  }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}))
