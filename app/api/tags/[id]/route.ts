import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tags } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { name, color, isActive } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Tag ID is required" }, { status: 400 });
    }

    const updatedTagData: { name?: string; color?: string; isActive?: boolean; updatedAt?: string } = {
      updatedAt: new Date().toISOString(),
    };
    if (name !== undefined) updatedTagData.name = name;
    if (color !== undefined) updatedTagData.color = color;
    if (isActive !== undefined) updatedTagData.isActive = isActive;

    const result = await db.update(tags)
      .set(updatedTagData)
      .where(eq(tags.id, id));

    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: "Tag not found or no changes applied" }, { status: 404 });
    }

    const updatedTag = await db.select().from(tags).where(eq(tags.id, id)).limit(1);

    return NextResponse.json({ message: "Tag updated successfully", tag: updatedTag[0] });
  } catch (error) {
    console.error("Error updating tag:", error);
    return NextResponse.json({ error: "Failed to update tag" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Tag ID is required" }, { status: 400 });
    }

    const result = await db.delete(tags).where(eq(tags.id, id));

    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 });
  }
}
