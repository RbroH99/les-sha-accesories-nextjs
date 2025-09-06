import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

export async function PUT(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decodedToken: any;
    try {
      decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      );
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decodedToken.userId;
    const updates = await request.json();

    // Prevent updating sensitive fields like ID, role, email, username directly via this route
    const { id, role, email, username, password, ...updatableFields } = updates;

    if (Object.keys(updatableFields).length === 0) {
      return NextResponse.json(
        { message: "No updatable fields provided" },
        { status: 200 }
      );
    }

    const result = await db
      .update(users)
      .set(updatableFields)
      .where(eq(users.id, userId));

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return NextResponse.json(
        { error: "User not found or no changes applied" },
        { status: 404 }
      );
    }

    // Fetch the updated user to return the latest data
    const updatedUserArray = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    const updatedUser = updatedUserArray[0];

    // Exclude password from the returned user object
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      message: "Profile updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
