import { drizzle } from "drizzle-orm/planetscale-serverless"
import { connect } from "@planetscale/database"

// Crear la conexión a PlanetScale
const connection = connect({
  url: process.env.DATABASE_URL,
})

// Crear la instancia de Drizzle
export const db = drizzle(connection)

// Función para verificar la conexión
export async function testConnection() {
  try {
    const result = await connection.execute("SELECT 1 as test")
    console.log("Database connection successful:", result)
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}
