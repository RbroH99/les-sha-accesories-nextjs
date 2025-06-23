import { NextResponse } from "next/server"
import { getAuthenticationParameters } from "@/lib/imagekit"

export async function GET() {
  try {
    const authParams = getAuthenticationParameters()
    return NextResponse.json(authParams)
  } catch (error) {
    console.error("Error generating ImageKit auth params:", error)
    return NextResponse.json({ error: "Failed to generate authentication parameters" }, { status: 500 })
  }
}
