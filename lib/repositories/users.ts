import { db } from "@/lib/db"
import { users } from "@/lib/schema"
import { eq } from "drizzle-orm"

export interface UserData {
  id: string
  username: string
  firstName?: string
  lastName?: string
  email: string
  phone?: string
  role: "user" | "admin"
  defaultAddress?: {
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  createdAt: string
  updatedAt: string
}

export class UsersRepository {
  async getUserById(id: string): Promise<UserData | null> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1)

      if (result.length === 0) return null

      const user = result[0]
      return {
        id: user.id,
        username: user.username,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        email: user.email,
        phone: user.phone || undefined,
        role: user.role,
        defaultAddress: user.defaultAddress || undefined,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }
    } catch (error) {
      console.error("Error fetching user by id:", error)
      return this.getMemoryUserById(id)
    }
  }

  async getUserByEmail(email: string): Promise<UserData | null> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1)

      if (result.length === 0) return null

      const user = result[0]
      return {
        id: user.id,
        username: user.username,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        email: user.email,
        phone: user.phone || undefined,
        role: user.role,
        defaultAddress: user.defaultAddress || undefined,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }
    } catch (error) {
      console.error("Error fetching user by email:", error)
      return this.getMemoryUserByEmail(email)
    }
  }

  async createUser(data: Omit<UserData, "createdAt" | "updatedAt">): Promise<string> {
    try {
      await db.insert(users).values({
        id: data.id,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        defaultAddress: data.defaultAddress,
      })
      return data.id
    } catch (error) {
      console.error("Error creating user:", error)
      throw new Error("Failed to create user")
    }
  }

  async updateUser(id: string, data: Partial<UserData>): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          defaultAddress: data.defaultAddress,
        })
        .where(eq(users.id, id))
      return true
    } catch (error) {
      console.error("Error updating user:", error)
      return false
    }
  }

  // Métodos de fallback con datos en memoria
  private getMemoryUserById(id: string): UserData | null {
    const memoryUsers = this.getMemoryUsers()
    return memoryUsers.find((u) => u.id === id) || null
  }

  private getMemoryUserByEmail(email: string): UserData | null {
    const memoryUsers = this.getMemoryUsers()
    return memoryUsers.find((u) => u.email === email) || null
  }

  private getMemoryUsers(): UserData[] {
    return [
      {
        id: "admin-1",
        username: "admin",
        firstName: "Administrador",
        lastName: "Principal",
        email: "admin@bisuteria.com",
        phone: "+52 123 456 7890",
        role: "admin",
        defaultAddress: {
          address: "Calle Principal 123",
          city: "Ciudad de México",
          state: "CDMX",
          zipCode: "01000",
          country: "México",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
  }
}

export const usersRepository = new UsersRepository()
