import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
config({ path: ".env.local" });

export default defineConfig({
  schema: "./lib/schema.ts", // Ruta a tu esquema
  out: "./drizzle", // Carpeta de migraciones
  dialect: "postgresql", // Dialecto
  dbCredentials: {
    url: process.env.DATABASE_URL!, // URL de conexión a Neon en .env
  },
});
