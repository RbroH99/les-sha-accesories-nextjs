import { NextResponse, NextRequest } from "next/server";
import { favoritesRepository } from "@/lib/repositories/favorites";
import { getUserIdFromRequest } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await favoritesRepository.removeFavorite(userId, params.productId);
    return NextResponse.json({ message: "Favorite removed" });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
