import { db } from "@/lib/db";
import { ratings, products } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const productId = params.id;

  try {
    const productRatings = await db
      .select()
      .from(ratings)
      .where(eq(ratings.productId, productId));

    return NextResponse.json(productRatings);
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      { error: "Error fetching ratings" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productId = params.id;

  try {
    const { rating, comment } = await request.json();

    // Check if the user has already rated the product
    const existingRating = await db
      .select()
      .from(ratings)
      .where(and(eq(ratings.productId, productId), eq(ratings.userId, userId)));

    if (existingRating.length > 0) {
      return NextResponse.json(
        { error: "You have already rated this product" },
        { status: 400 }
      );
    }

    // Create the new rating
    const newRating = await db
      .insert(ratings)
      .values({
        id: crypto.randomUUID(),
        productId,
        userId,
        rating,
        comment,
      })
      .returning();

    // Recalculate the average rating and rating count for the product
    const productRatings = await db
      .select()
      .from(ratings)
      .where(eq(ratings.productId, productId));

    const ratingCount = productRatings.length;
    const averageRating =
      productRatings.reduce((acc, r) => acc + r.rating, 0) / ratingCount;

    // Update the product with the new average rating and rating count
    await db
      .update(products)
      .set({
        averageRating: averageRating.toFixed(2),
        ratingCount,
      })
      .where(eq(products.id, productId));

    return NextResponse.json(newRating[0]);
  } catch (error) {
    console.error("Error submitting rating:", error);
    return NextResponse.json(
      { error: "Error submitting rating" },
      { status: 500 }
    );
  }
}
