import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Crear la conexión a Neon
const sql = neon(process.env.DATABASE_URL!);

// Crear la instancia de Drizzle
export const db = drizzle(sql, { schema });

// Función para verificar la conexión
export async function testConnection() {
  try {
    await sql`SELECT 1`;
    console.log("Database connection successful.");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}
