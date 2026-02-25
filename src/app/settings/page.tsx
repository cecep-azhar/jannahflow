import { db } from "@/db";
import { users, worships, systemStats } from "@/db/schema";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import SettingsPage from "./settings-page";
import { getCurrentUser, canAccessSettings } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export default async function SettingsPageLoader() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  if (!canAccessSettings(user)) {
    redirect("/dashboard");
  }

  try {
    // Check if user is parent
    const hasUsers = await db.select().from(users).limit(1);
    const allUsers = await db.select().from(users);
    const allWorships = await db.select().from(worships);
    
    const tokenStat = await db.query.systemStats.findFirst({
      where: eq(systemStats.key, "pro_token")
    });

    const nameStat = await db.query.systemStats.findFirst({
      where: eq(systemStats.key, "family_name")
    });

    const targetStat = await db.query.systemStats.findFirst({
      where: eq(systemStats.key, "family_target")
    });

    const visiStat = await db.query.systemStats.findFirst({
      where: eq(systemStats.key, "family_vision")
    });

    const misiStat = await db.query.systemStats.findFirst({
      where: eq(systemStats.key, "family_mission")
    });

    const inspirasiStat = await db.query.systemStats.findFirst({
        where: eq(systemStats.key, "show_inspirasi")
    });
    // Default to true if not set
    const showInspirasi = inspirasiStat ? inspirasiStat.value === "1" : true;

    const timezoneStat = await db.query.systemStats.findFirst({
      where: eq(systemStats.key, "timezone")
    });
    
    return <SettingsPage 
      users={allUsers} 
      worships={allWorships} 
      initialProToken={tokenStat?.value || ""} 
      initialFamilyName={nameStat?.value || ""}
      initialTarget={targetStat?.value || ""}
      initialVisi={visiStat?.value || ""}
      initialMisi={misiStat?.value || ""}
      initialTimezone={timezoneStat?.value || ""}
      showInspirasi={inspirasiStat ? inspirasiStat.value === "1" : true}
    />;
  } catch (e) {
    console.error("Settings page DB error:", e);
    redirect("/setup");
  }
}
