import { NextResponse } from "next/server";
import { productsRepository } from "@/lib/repositories/products";

// GET /api/products/:id
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const product = await productsRepository.getProductById(params.id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

// PUT /api/products/:id
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    const success = await productsRepository.updateProduct(params.id, data);
    if (!success) {
      return NextResponse.json(
        { error: "Error updating product" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /products/:id error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/:id
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = await productsRepository.deleteProduct(params.id);
    if (!success) {
      return NextResponse.json(
        { error: "Error deleting product" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /products/:id error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
