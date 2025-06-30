import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { eq } from "drizzle-orm";

export type Setting = {
  key: string;
  value: any;
};

export class SettingsRepository {
  async getAllSettings(): Promise<Setting[]> {
    try {
      const result = await db.select().from(settings);
      return result;
    } catch (error) {
      console.error("Error fetching all settings:", error);
      throw new Error("Could not fetch settings");
    }
  }

  async getSetting(key: string): Promise<Setting | null> {
    try {
      const result = await db
        .select()
        .from(settings)
        .where(eq(settings.key, key))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error(`Error fetching setting ${key}:`, error);
      throw new Error(`Could not fetch setting ${key}`);
    }
  }

  async updateSetting(key: string, value: any): Promise<boolean> {
    try {
      const now = new Date();
      await db
        .insert(settings)
        .values({ key, value, updatedAt: now })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value, updatedAt: now },
        });
      return true;
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      return false;
    }
  }
  
  async updateMultipleSettings(settingsToUpdate: Setting[]): Promise<boolean> {
    try {
      const now = new Date();
      // Drizzle doesn't have a bulk update with different values per row,
      // so we have to do it in a transaction.
      await db.transaction(async (tx) => {
        for (const setting of settingsToUpdate) {
          await tx
            .insert(settings)
            .values({ key: setting.key, value: setting.value, updatedAt: now })
            .onConflictDoUpdate({
              target: settings.key,
              set: { value: setting.value, updatedAt: now },
            });
        }
      });
      return true;
    } catch (error) {
      console.error("Error updating multiple settings:", error);
      return false;
    }
  }
}

export const settingsRepository = new SettingsRepository();
