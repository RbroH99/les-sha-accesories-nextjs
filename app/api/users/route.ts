import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

export async function GET() {
  try {
    const allUsers = await db.select().from(users);
    // Exclude sensitive information like password before sending to client
    const usersWithoutPasswords = allUsers.map(user => {
      const { password, ...rest } = user;
      return rest;
    });
    return NextResponse.json(usersWithoutPasswords);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
