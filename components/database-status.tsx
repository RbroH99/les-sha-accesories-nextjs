"use client"

import { useDatabase } from "@/lib/hooks/use-database"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, Wifi, WifiOff } from "lucide-react"

export function DatabaseStatus() {
  const { isConnected, isLoading, isUsingMemory } = useDatabase()

  if (isLoading) {
    return (
      <Alert className="mb-4">
        <Database className="h-4 w-4" />
        <AlertDescription>Verificando conexión a la base de datos...</AlertDescription>
      </Alert>
    )
  }

  if (isUsingMemory) {
    return (
      <Alert className="mb-4 border-amber-200 bg-amber-50">
        <WifiOff className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Modo Demostración:</strong> Usando datos en memoria. Para conectar con PlanetScale, configura la
          variable de entorno DATABASE_URL.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-4 border-green-200 bg-green-50">
      <Wifi className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        <strong>Conectado a PlanetScale:</strong> Usando base de datos real.
      </AlertDescription>
    </Alert>
  )
}
