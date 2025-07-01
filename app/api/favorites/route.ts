import { NextResponse, NextRequest } from "next/server";
import { favoritesRepository } from "@/lib/repositories/favorites";
import { z } from "zod";
import { getUserIdFromRequest } from "@/lib/auth";

const favoriteSchema = z.object({
  productId: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await favoritesRepository.getFavoritesByUserId(userId);
    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await request.json();
    const parsedData = favoriteSchema.safeParse(data);

    if (!parsedData.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const newFavorite = await favoritesRepository.addFavorite(
      userId,
      parsedData.data.productId
    );

    return NextResponse.json(newFavorite, { status: 201 });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
