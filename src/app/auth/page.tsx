import { db } from "@/db";
import { users, systemStats } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AuthUI } from "./auth-ui";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

export default async function AuthPage() {
  const allUsers = await db.select().from(users);

  const nameStat = await db.query.systemStats.findFirst({
    where: eq(systemStats.key, "family_name")
  });
  const familyName = nameStat?.value || "Keluarga";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-900 dark:text-slate-100">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <AuthUI users={allUsers as { id: number; name: string; role: "parent" | "child" | "admin" | "member"; avatarUrl: string | null; }[]} familyName={familyName} /> 
      </div>
      <Footer />
    </div>
  );
}
