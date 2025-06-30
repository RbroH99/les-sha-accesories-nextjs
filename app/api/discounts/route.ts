import { NextResponse } from "next/server";
import { discountsRepository } from "@/lib/repositories/discounts";
import { z } from "zod";

const discountSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(["percentage", "fixed"]),
  value: z.number(),
  reason: z.string(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
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

    const discountId = await discountsRepository.createDiscount({
      ...parsedData.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // The repository doesn't return the created object, so we can't return it here.
    // We'll just return the ID.
    return NextResponse.json({ id: discountId }, { status: 201 });
  } catch (error) {
    console.error("Error creating discount:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
