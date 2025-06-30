import { NextResponse } from "next/server";
import { settingsRepository } from "@/lib/repositories/settings";
import { z } from "zod";

const settingsSchema = z.array(
  z.object({
    key: z.string(),
    value: z.any(),
  })
);

export async function GET() {
  try {
    const settings = await settingsRepository.getAllSettings();
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>);
    return NextResponse.json(settingsObject);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedSettings = settingsSchema.safeParse(body);

    if (!parsedSettings.success) {
      return NextResponse.json(
        { error: "Invalid settings format", details: parsedSettings.error },
        { status: 400 }
      );
    }

    const success = await settingsRepository.updateMultipleSettings(
      parsedSettings.data
    );

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
