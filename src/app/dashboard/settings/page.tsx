import { db } from "@/db";
import { users, worships } from "@/db/schema";
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
  
  // Check if user is parent
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || user.role !== "parent") {
    redirect("/dashboard");
  }

  const allUsers = await db.select().from(users);
  const allWorships = await db.select().from(worships);

  return <SettingsPage users={allUsers} worships={allWorships} />;
}
