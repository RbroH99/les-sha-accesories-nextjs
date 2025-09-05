import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, refreshTokens } from "@/lib/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "your-access-token-secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "your-refresh-token-secret";

export async function POST(req: Request) {
  const { refreshToken } = await req.json();

  if (!refreshToken) {
    return NextResponse.json({ error: "Refresh token is required" }, { status: 400 });
  }

  try {
    const storedToken = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, refreshToken))
      .limit(1)
      .then((res) => res[0]);

    if (!storedToken) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    if (new Date() > new Date(storedToken.expiresAt)) {
      await db.delete(refreshTokens).where(eq(refreshTokens.id, storedToken.id));
      return NextResponse.json({ error: "Expired refresh token" }, { status: 401 });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, storedToken.userId))
      .limit(1)
      .then((res) => res[0]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    return NextResponse.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}