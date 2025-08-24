import { NextResponse } from "next/server";
import { discountsRepository } from "@/lib/repositories/discounts";
import { z } from "zod";

// Esquema actualizado para validar los datos de entrada
const discountSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive("El valor debe ser positivo"),
  reason: z.string().min(1, "La razón es requerida"),
  startDate: z.string().optional(), // Aceptar string para fechas
  endDate: z.string().optional(),   // Aceptar string para fechas
  isActive: z.boolean(),
  productIds: z.array(z.string()),
  isGeneric: z.boolean(),
});

export async function GET() {
  try {
    const discounts = await discountsRepository.getAllDiscounts();
    return NextResponse.json(discounts);
  } catch (error) {
    console.error("Error fetching discounts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsedData = discountSchema.safeParse(data);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsedData.error.errors },
        { status: 400 }
      );
    }

    // Llamar al repositorio con los datos validados
    const newDiscount = await discountsRepository.createDiscount(parsedData.data);

    // Devolver el objeto completo del descuento creado
    return NextResponse.json(newDiscount, { status: 201 });
  } catch (error) {
    console.error("Error creating discount:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
