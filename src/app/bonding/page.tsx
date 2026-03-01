import { db } from "@/db";
import { bondingActivities } from "@/db/schema";
import { redirect } from "next/navigation";
import { sql } from "drizzle-orm";
import BondingPageClient, { Activity } from "./bonding-page";
import { bondingSeedData } from "@/lib/bonding-seed";
import { bondingFamilySeedData } from "@/lib/bonding-family-seed";
import { getCurrentUser, canViewBounding } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export default async function BondingPageLoader() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  if (!canViewBounding(user)) {
    redirect("/dashboard");
  }

  // Fetch activities
  let activities = await db.query.bondingActivities.findMany();

  // Seed if empty or needing update (we reset it to ensure the new columns like target/mood are populated)
  const firstActivity = activities[0] as Activity | undefined;
  const needsMigration = activities.length > 0 && (!firstActivity || !('target' in firstActivity) || !('mood' in firstActivity));
  if (activities.length === 0 || needsMigration) {
      try {
           console.warn("Bonding activities table seeding/updating...");
           
           // Ensure table exists with the correct columns (target)
           await db.run(sql`DROP TABLE IF EXISTS \`bonding_activities\``);
           await db.run(sql`CREATE TABLE \`bonding_activities\` (\`id\` text PRIMARY KEY NOT NULL, \`title\` text NOT NULL, \`description\` text, \`category\` text NOT NULL, \`target\` text NOT NULL DEFAULT 'COUPLE', \`is_completed\` integer DEFAULT false, \`completed_at\` text, \`insight\` text, \`photo_url\` text, \`mood\` text)`);

            // Seed COUPLE activities
            for (let i = 0; i < bondingSeedData.length; i += 50) {
                const chunk = bondingSeedData.slice(i, i + 50).map(item => ({
                    ...item,
                    id: crypto.randomUUID(),
                    category: item.category as "SPIRITUAL" | "FUN" | "SERVICE" | "DEEP_TALK",
                    target: "COUPLE" as const,
                    isCompleted: false,
                }));
                await db.insert(bondingActivities).values(chunk);
            }

            // Seed FAMILY activities
            for (let i = 0; i < bondingFamilySeedData.length; i += 50) {
                const chunk = bondingFamilySeedData.slice(i, i + 50).map(item => ({
                    ...item,
                    id: crypto.randomUUID(),
                    category: item.category as "SPIRITUAL" | "FUN" | "SERVICE" | "DEEP_TALK",
                    target: "FAMILY" as const,
                    isCompleted: false,
                }));
                await db.insert(bondingActivities).values(chunk);
            }
            
            activities = await db.query.bondingActivities.findMany();
      } catch (e) {
          console.error("Failed to seed bonding activities.", e);
      }
  }

  const lang = user?.role === "parent" ? "id" : "id"; // Default to 'id' for now as per app patterns, or fetch from user settings if available
  
  return <BondingPageClient activities={activities} lang={lang} />;
}
