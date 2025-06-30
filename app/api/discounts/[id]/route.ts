import { NextResponse } from "next/server";
import { discountsRepository } from "@/lib/repositories/discounts";
import { z } from "zod";

const discountUpdateSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(["percentage", "fixed"]).optional(),
    value: z.number().optional(),
    reason: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isActive: z.boolean().optional(),
    productIds: z.array(z.string()).optional(),
    isGeneric: z.boolean().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const parsedData = discountUpdateSchema.safeParse(data);

    if (!parsedData.success) {
      return NextResponse.json({ error: "Invalid data", details: parsedData.error.errors }, { status: 400 });
    }

    const success = await discountsRepository.updateDiscount(
      params.id,
      parsedData.data
    );

    if (!success) {
      return NextResponse.json({ error: "Failed to update discount" }, { status: 500 });
    }

    return NextResponse.json({ message: "Discount updated successfully" });
  } catch (error) {
    console.error(`Error updating discount ${params.id}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = await discountsRepository.deleteDiscount(params.id);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete discount" }, { status: 500 });
    }
    return NextResponse.json({ message: "Discount deleted successfully" });
  } catch (error) {
    console.error(`Error deleting discount ${params.id}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
