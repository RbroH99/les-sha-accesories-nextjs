import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "your-access-token-secret";

interface DecodedToken {
  userId: string;
}

export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as DecodedToken;
    return decoded.userId;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}
