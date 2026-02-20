import { db } from "@/db";
import { users, systemStats } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AuthUI } from "./auth-ui";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

export default async function AuthPage() {
  let allUsers: { id: number; name: string; role: "parent" | "child"; avatarUrl: string | null }[] = [];
  let familyName = "Keluarga";

  try {
    const rawUsers = await db.select().from(users);
    allUsers = rawUsers as typeof allUsers;

    const nameStat = await db.query.systemStats.findFirst({
      where: eq(systemStats.key, "family_name")
    });
    familyName = nameStat?.value || "Keluarga";
  } catch {
    // DB not ready → go to setup
    redirect("/setup");
  }

  // If no users yet → go to setup
  if (allUsers.length === 0) {
    redirect("/setup");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-900 dark:text-slate-100">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <AuthUI users={allUsers} familyName={familyName} /> 
      </div>
      <Footer />
    </div>
  );
}
