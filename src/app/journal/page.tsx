import { db } from "@/db";
import { users } from "@/db/schema";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getJournals } from "./actions";
import JournalPageClient from "./journal-page";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const cookieStore = await cookies();
  const userIdStr = cookieStore.get("mutabaah-user-id")?.value;

  if (!userIdStr) {
    redirect("/auth");
  }

  const userId = parseInt(userIdStr);
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    redirect("/auth");
  }

  const journals = await getJournals();

  return <JournalPageClient initialJournals={journals as any} currentUserId={userId} />;
}
