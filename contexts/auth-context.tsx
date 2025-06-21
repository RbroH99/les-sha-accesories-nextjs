"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Address {
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface User {
  id: string
  username: string
  firstName?: string
  lastName?: string
  email: string
  phone?: string
  role: "user" | "admin"
  defaultAddress?: Address
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (updates: {
    username?: string
    firstName?: string
    lastName?: string
    phone?: string
    defaultAddress?: Address
  }) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | null>(null)

const USERS_STORAGE_KEY = "bisuteria_users"
const CURRENT_USER_KEY = "bisuteria_current_user"

// Usuario administrador por defecto
const defaultAdmin: User = {
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
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Inicializar usuarios con admin por defecto
    const existingUsers = localStorage.getItem(USERS_STORAGE_KEY)
    if (!existingUsers) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([defaultAdmin]))
    }

    // Verificar si hay un usuario logueado
    const currentUserId = localStorage.getItem(CURRENT_USER_KEY)
    if (currentUserId) {
      const users: User[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "[]")
      const currentUser = users.find((u) => u.id === currentUserId)
      if (currentUser) {
        setUser(currentUser)
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const users: User[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "[]")
    const foundUser = users.find((u) => u.email === email)

    if (foundUser) {
      // En una app real, verificarías la contraseña hasheada
      // Por ahora, aceptamos cualquier contraseña para usuarios existentes
      setUser(foundUser)
      localStorage.setItem(CURRENT_USER_KEY, foundUser.id)
      return true
    }

    return false
  }

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const users: User[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "[]")

    // Verificar si ya existe un usuario con ese email o username
    const existingUser = users.find((u) => u.email === email || u.username === username)
    if (existingUser) {
      return false
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      email,
      role: "user",
    }

    users.push(newUser)
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    localStorage.setItem(CURRENT_USER_KEY, newUser.id)
    setUser(newUser)

    return true
  }

  const updateProfile = async (updates: {
    username?: string
    firstName?: string
    lastName?: string
    phone?: string
    defaultAddress?: Address
  }): Promise<boolean> => {
    if (!user) return false

    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 500))

    const users: User[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "[]")

    // Si se está actualizando el username, verificar que no exista
    if (updates.username && updates.username !== user.username) {
      const existingUser = users.find((u) => u.username === updates.username && u.id !== user.id)
      if (existingUser) {
        return false
      }
    }

    const updatedUser = { ...user, ...updates }
    const userIndex = users.findIndex((u) => u.id === user.id)

    if (userIndex !== -1) {
      users[userIndex] = updatedUser
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
      setUser(updatedUser)
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(CURRENT_USER_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
