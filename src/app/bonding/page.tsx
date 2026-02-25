import { db } from "@/db";
import { bondingActivities } from "@/db/schema";
import { redirect } from "next/navigation";
import { sql } from "drizzle-orm";
import BondingPageClient from "./bonding-page";
import { bondingSeedData } from "@/lib/bonding-seed";
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

  // Seed if empty
  if (activities.length === 0) {
      try {
           console.warn("Bonding activities table empty, auto-seeding 100 challenges...");
           // SQLite might complain if we insert 100 rows in one go without creating a proper table structure 
           // if drizzle kit wasn't pushed manually by user.
           
           // A safe check if table exists: doing a raw query fallback
           await db.run(sql`CREATE TABLE IF NOT EXISTS \`bonding_activities\` (\`id\` text PRIMARY KEY NOT NULL, \`title\` text NOT NULL, \`description\` text, \`category\` text NOT NULL, \`is_completed\` integer DEFAULT false, \`completed_at\` text)`);

            for (let i = 0; i < bondingSeedData.length; i += 50) {
                const chunk = bondingSeedData.slice(i, i + 50).map(item => ({
                    ...item,
                    id: crypto.randomUUID(),
                    category: item.category as "SPIRITUAL" | "DEEP_TALK" | "FUN" | "SERVICE" | undefined,
                    isCompleted: false,
                }));
                await db.insert(bondingActivities).values(chunk as any);
            }
            activities = await db.query.bondingActivities.findMany();
      } catch (e) {
          console.error("Failed to seed bonding activities. Make sure to run `pnpm drizzle-kit push`.", e);
      }
  }

  return <BondingPageClient activities={activities} />;
}
