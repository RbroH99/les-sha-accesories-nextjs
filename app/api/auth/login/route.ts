import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json(); // identifier can be username or email

    if (!identifier || !password) {
      return NextResponse.json({ error: "Identifier (username or email) and password are required" }, { status: 400 });
    }

    // Find user by username or email
    const userArray = await db.select().from(users).where(eq(users.username, identifier) || eq(users.email, identifier));
    const user = userArray[0];

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role, username: user.username, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return NextResponse.json({ message: "Login successful", token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
