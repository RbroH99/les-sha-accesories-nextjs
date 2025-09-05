"use client"

// Hook personalizado para manejar el estado de la conexión a la base de datos
import { useState, useEffect } from "react"
import { DatabaseService } from "@/lib/services/database"

export function useDatabase() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await DatabaseService.testConnection()
        setIsConnected(connected)
      } catch (error) {
        console.error("Database connection check failed:", error)
        setIsConnected(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
  }, [])

  return {
    isConnected,
    isLoading,
    isUsingMemory: !isConnected,
  }
}
