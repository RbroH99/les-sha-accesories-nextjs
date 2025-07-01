import { NextResponse } from "next/server";
import { productsRepository } from "@/lib/repositories/products";

// GET /api/products
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;

  const sortBy =
    (searchParams.get("sortBy") as "name" | "price" | "stock" | "created_at") ??
    "created_at";
  const rawSortOrder = searchParams.get("sortOrder");
  const sortOrder: "asc" | "desc" =
    rawSortOrder === "asc" || rawSortOrder === "desc" ? rawSortOrder : "desc";

  const categoryIds = searchParams.getAll("categoryId").filter(Boolean);
  const tagIds = searchParams.getAll("tagId");

  const filters = {
    sortBy,
    sortOrder,
    categoryIds: categoryIds.length ? categoryIds : undefined,
    tagIds: tagIds.length ? tagIds : undefined,
    search: searchParams.get("search") ?? undefined,
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    minStock: searchParams.get("minStock")
      ? Number(searchParams.get("minStock"))
      : undefined,
    maxStock: searchParams.get("maxStock")
      ? Number(searchParams.get("maxStock"))
      : undefined,
    isNew: searchParams.get("isNew") === "true" ? true : undefined,
    hasDiscount: searchParams.get("hasDiscount") === "true" ? true : undefined,
    hasImages: searchParams.get("hasImages") === "true" ? true : undefined,
    availabilityType: searchParams.get("availabilityType") as
      | "stock_only"
      | "stock_and_order"
      | "order_only"
      | undefined,
    limit,
    offset,
  };

  const products = await productsRepository.getAllProducts(filters);
  const totalProducts = await productsRepository.countAllProducts(filters);

  return NextResponse.json({
    data: products,
    total: totalProducts,
    totalPages: Math.ceil(totalProducts / limit),
  });
}

// POST /api/products
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await productsRepository.createProduct(body);
    return NextResponse.json({ id: result }, { status: 201 });
  } catch (error) {
    console.error("POST /products error:", error);
    return NextResponse.json(
      { error: "Error creating product" },
      { status: 500 }
    );
  }
}

