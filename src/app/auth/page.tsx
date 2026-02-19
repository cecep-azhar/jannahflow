import { db } from "@/db";
import { users } from "@/db/schema";
import { AuthUI } from "./auth-ui";

export const dynamic = "force-dynamic";

export default async function AuthPage() {
  const allUsers = await db.select().from(users);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-900">
      <AuthUI users={allUsers as any[]} /> 
    </div>
  );
}
