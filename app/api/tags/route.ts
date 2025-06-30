import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tags } from "@/lib/schema";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const allTags = await db.select().from(tags);
    return NextResponse.json(allTags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, color, isActive } = await request.json();

    if (!name || !color) {
      return NextResponse.json(
        { error: "Tag name and color are required" },
        { status: 400 }
      );
    }

    const newTag = {
      id: uuidv4(),
      name,
      color,
      isActive: isActive ?? true,
    };

    await db.insert(tags).values(newTag);

    return NextResponse.json(
      { message: "Tag created successfully", tag: newTag },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
