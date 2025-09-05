// Servicio para manejar la lógica de base de datos y fallbacks
import { categoriesRepository } from "@/lib/repositories/categories";
import { productsRepository } from "@/lib/repositories/products";
import { usersRepository } from "@/lib/repositories/users";
import { ordersRepository } from "@/lib/repositories/orders";
import { discountsRepository } from "@/lib/repositories/discounts";

export class DatabaseService {
  // Flag para determinar si usar base de datos real o datos en memoria
  private static USE_DATABASE =
    process.env.NODE_ENV === "production" && process.env.DATABASE_URL;

  static async testConnection(): Promise<boolean> {
    if (!this.USE_DATABASE) {
      console.log("Using in-memory data for development");
      return true;
    }

    try {
      const { testConnection } = await import("@/lib/db");
      return await testConnection();
    } catch (error) {
      console.error(
        "Database connection failed, falling back to memory:",
        error
      );
      return false;
    }
  }

  // Métodos para categorías
  static async getCategories() {
    return await categoriesRepository.getAllCategories();
  }

  static async createCategory(data: any) {
    return await categoriesRepository.createCategory(data);
  }

  static async updateCategory(id: string, data: any) {
    return await categoriesRepository.updateCategory(id, data);
  }

  static async deleteCategory(id: string) {
    return await categoriesRepository.deleteCategory(id);
  }

  // Métodos para tags
  static async getTags() {
    return await categoriesRepository.getAllTags();
  }

  static async createTag(data: any) {
    return await categoriesRepository.createTag(data);
  }

  static async updateTag(id: string, data: any) {
    return await categoriesRepository.updateTag(id, data);
  }

  static async deleteTag(id: string) {
    return await categoriesRepository.deleteTag(id);
  }

  // Métodos para productos
  static async getProducts(filters?: any) {
    return await productsRepository.getAllProducts(filters);
  }

  static async getProductById(id: string) {
    return await productsRepository.getProductById(id);
  }

  static async createProduct(data: any) {
    return await productsRepository.createProduct(data);
  }

  static async updateProduct(id: string, data: any) {
    return await productsRepository.updateProduct(id, data);
  }

  static async deleteProduct(id: string) {
    return await productsRepository.deleteProduct(id);
  }

  // Métodos para usuarios
  static async getUserById(id: string) {
    return await usersRepository.getUserById(id);
  }

  static async getUserByEmail(email: string) {
    return await usersRepository.getUserByEmail(email);
  }

  static async createUser(data: any) {
    return await usersRepository.createUser(data);
  }

  static async updateUser(id: string, data: any) {
    return await usersRepository.updateUser(id, data);
  }

  // Métodos para pedidos
  static async getAllOrders() {
    return await ordersRepository.getAllOrders();
  }

  static async getOrdersByUserId(userId: string) {
    return await ordersRepository.getOrdersByUserId(userId);
  }

  static async createOrder(data: any) {
    return await ordersRepository.createOrder(data);
  }

  static async updateOrderStatus(orderId: string, status: any) {
    return await ordersRepository.updateOrderStatus(orderId, status);
  }

  static async getOrderById(orderId: string) {
    return await ordersRepository.getOrderById(orderId);
  }

  // Métodos para descuentos
  static async getDiscounts() {
    return await discountsRepository.getAllDiscounts();
  }

  static async createDiscount(data: any) {
    return await discountsRepository.createDiscount(data);
  }

  static async updateDiscount(id: string, data: any) {
    return await discountsRepository.updateDiscount(id, data);
  }

  static async deleteDiscount(id: string) {
    return await discountsRepository.deleteDiscount(id);
  }

  static async getActiveDiscountsForProduct(productId: number) {
    return await discountsRepository.getActiveDiscountsForProduct(productId);
  }
}
