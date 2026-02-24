import { db } from "@/db";
import { users, worships, systemStats } from "@/db/schema";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import SettingsPage from "./settings-page";

export const dynamic = "force-dynamic";

export default async function Page() {
  const cookieStore = await cookies();
  const userIdStr = cookieStore.get("mutabaah-user-id")?.value;

  if (!userIdStr) redirect("/auth");

  const userId = parseInt(userIdStr);

  try {
    // Check if user is parent
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || user.role !== "parent") {
      redirect("/dashboard");
    }

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

    return <SettingsPage 
      users={allUsers} 
      worships={allWorships} 
      initialProToken={tokenStat?.value || ""} 
      initialFamilyName={nameStat?.value || "Keluarga"} 
      showInspirasi={showInspirasi}
      initialTarget={targetStat?.value || ""}
      initialVisi={visiStat?.value || ""}
      initialMisi={misiStat?.value || ""}
    />;
  } catch (e) {
    console.error("Settings page DB error:", e);
    redirect("/setup");
  }
}
