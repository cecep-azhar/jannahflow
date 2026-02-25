"use server";

import { db } from "@/db";
import { bondingActivities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleBondingActivity(id: string, currentStatus: boolean, insight?: string | null, photoUrl?: string | null) {
    try {
        await db.update(bondingActivities)
            .set({
                isCompleted: !currentStatus,
                completedAt: !currentStatus ? new Date().toISOString() : null,
                insight: insight || null,
                photoUrl: photoUrl || null
            })
            .where(eq(bondingActivities.id, id));
            
        revalidatePath("/bonding");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to update activity" };
    }
}
