import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkDatabaseEmpty } from "./setup/actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const isEmpty = await checkDatabaseEmpty();
  if (isEmpty) {
    redirect("/setup");
  }

  const cookieStore = await cookies();
  const userId = cookieStore.get("mutabaah-user-id");

  if (userId) {
    redirect("/dashboard");
  } else {
    redirect("/auth");
  }
}
