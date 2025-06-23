// API route para probar la conexión a la base de datos
import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/services/database"

export async function GET() {
  try {
    const isConnected = await DatabaseService.testConnection()

    if (isConnected) {
      // Probar algunas operaciones básicas
      const categories = await DatabaseService.getCategories()
      const products = await DatabaseService.getProducts({ limit: 5 })

      return NextResponse.json({
        status: "success",
        message: "Database connection successful",
        data: {
          categoriesCount: categories.length,
          productsCount: products.length,
          usingDatabase: process.env.DATABASE_URL ? true : false,
        },
      })
    } else {
      return NextResponse.json({
        status: "warning",
        message: "Using in-memory data (fallback)",
        data: {
          usingDatabase: false,
          reason: "No DATABASE_URL configured or connection failed",
        },
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Database test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
