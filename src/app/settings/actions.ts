"use server";

import { db } from "@/db";
import { users, worships, systemStats } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and, ne } from "drizzle-orm";

import { headers } from "next/headers";
import { verifyProToken } from "@/lib/pro-utils";

import { getCurrentUser, canDeleteRecord, canEditRecord } from "@/lib/auth-utils";

// --- Family Management ---

export async function addFamilyMember(formData: FormData) {
  const authUser = await getCurrentUser();
  if (!canEditRecord(authUser)) return { error: "Unauthorized" };
  const name = formData.get("name") as string;
  const role = formData.get("role") as "parent" | "child";
  const pin = formData.get("pin") as string;
  const avatarUrl = formData.get("avatarUrl") as string;
  const gender = formData.get("gender") as "M" | "F" | "";
  const birthDate = formData.get("birthDate") as string;

  const todayStr = new Date().toISOString().split('T')[0];

  if (role === 'parent') {
      const existingParents = await db.select().from(users).where(eq(users.role, 'parent'));
      
      if (gender === 'M') {
          const maleCount = existingParents.filter(p => p.gender === 'M').length;
          if (maleCount >= 1) return { error: "Maksimal 1 Ayah (Laki-laki) sebagai Orang Tua." };
      }
      
      if (gender === 'F') {
          const femaleCount = existingParents.filter(p => p.gender === 'F').length;
          if (femaleCount >= 4) return { error: "Maksimal 4 Ibu (Perempuan) sebagai Orang Tua." };
      }
  }

  await db.insert(users).values({
    name,
    role,
    pin: role === "parent" ? pin : undefined,
    avatarUrl,
    gender,
    birthDate: birthDate || todayStr,
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function deleteFamilyMember(id: number) {
  const authUser = await getCurrentUser();
  if (!canDeleteRecord(authUser)) throw new Error("Unauthorized to delete");

  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function updateFamilyMember(id: number, formData: FormData) {
    const authUser = await getCurrentUser();
    if (!canEditRecord(authUser)) return { error: "Unauthorized" };
    const name = formData.get("name") as string;
    const role = formData.get("role") as "parent" | "child";
    const pin = formData.get("pin") as string;
    const avatarUrl = formData.get("avatarUrl") as string;
    const gender = formData.get("gender") as "M" | "F" | "";
    const birthDate = formData.get("birthDate") as string;
    
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (role === 'parent') {
        const existingParents = await db.select().from(users).where(
            and(
                eq(users.role, 'parent'),
                ne(users.id, id)
            )
        );
      
        if (gender === 'M') {
            const maleCount = existingParents.filter(p => p.gender === 'M').length;
            if (maleCount >= 1) return { error: "Maksimal 1 Ayah (Laki-laki) sebagai Orang Tua." };
        }
        
        if (gender === 'F') {
            const femaleCount = existingParents.filter(p => p.gender === 'F').length;
            if (femaleCount >= 4) return { error: "Maksimal 4 Ibu (Perempuan) sebagai Orang Tua." };
        }
    }
    
    await db.update(users).set({ 
        name,
        role,
        pin: pin || undefined,
        avatarUrl,
        gender,
        birthDate: birthDate || todayStr,
    }).where(eq(users.id, id));

    revalidatePath("/settings");
    revalidatePath("/dashboard");
}

// --- Worship Management ---

export async function addWorshipItem(formData: FormData) {
  const name = formData.get("name") as string;
  const points = parseInt(formData.get("points") as string);
  const category = formData.get("category") as "wajib" | "sunnah";
  const levels = formData.get("levels") as string;
  const targetLevels = formData.get("targetLevels") as string;
  
  await db.insert(worships).values({
    name,
    points,
    category,
    type: "boolean", 
    levels: levels || null,
    targetLevels: targetLevels || null,
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function deleteWorshipItem(id: number) {
  const authUser = await getCurrentUser();
  if (!canDeleteRecord(authUser)) throw new Error("Unauthorized to delete");

  await db.delete(worships).where(eq(worships.id, id));
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function updateWorshipItem(id: number, formData: FormData) {
    const name = formData.get("name") as string;
    const points = parseInt(formData.get("points") as string);
    const category = formData.get("category") as "wajib" | "sunnah";
    const levels = formData.get("levels") as string;
    const targetLevels = formData.get("targetLevels") as string;
    
    await db.update(worships).set({
        name,
        points,
        category,
        levels: levels || null,
        targetLevels: targetLevels || null,
    }).where(eq(worships.id, id));

    revalidatePath("/settings");
    revalidatePath("/dashboard");
}

// --- System Settings ---

export async function saveProToken(formData: FormData) {
  const token = formData.get("token") as string;
  
  const headersList = await headers();
  const host = headersList.get("host") || "localhost";
  const hostname = host.split(":")[0];
  
  const isValid = await verifyProToken(token, hostname);

  if (isValid) {
    await db.insert(systemStats)
      .values({ key: "pro_token", value: token })
      .onConflictDoUpdate({
        target: systemStats.key,
        set: { value: token, lastUpdated: new Date().toISOString() }
      });
      
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/finance"); // Revalidate finance layout too
    return { success: true, message: "Terima kasih sudah menggunakan versi pro." };
  } else {
    return { success: false, message: "Lisensi tidak cocok dengan domain ini." };
  }
}

export async function saveFamilyName(formData: FormData) {
  const name = formData.get("familyName") as string;
  
  if (name && name.trim().length > 0) {
      await db.insert(systemStats)
        .values({ key: "family_name", value: name.trim() })
        .onConflictDoUpdate({
          target: systemStats.key,
          set: { value: name.trim(), lastUpdated: new Date().toISOString() }
        });
  }

  revalidatePath("/");
  revalidatePath("/auth");
  revalidatePath("/settings");
}

export async function saveFamilyVision(formData: FormData) {
  const target = formData.get("familyTarget") as string;
  const visi = formData.get("familyVisi") as string;
  const misi = formData.get("familyMisi") as string;
  
  const updates = [
    { key: "family_target", value: target },
    { key: "family_vision", value: visi },
    { key: "family_mission", value: misi }
  ];

  for (const update of updates) {
      if (update.value && update.value.trim().length > 0) {
          await db.insert(systemStats)
            .values({ key: update.key, value: update.value.trim() })
            .onConflictDoUpdate({
              target: systemStats.key,
              set: { value: update.value.trim(), lastUpdated: new Date().toISOString() }
            });
      }
  }

  revalidatePath("/");
  revalidatePath("/auth");
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function revokeProToken() {
  await db.delete(systemStats).where(eq(systemStats.key, "pro_token"));
  
  revalidatePath("/");
  revalidatePath("/auth");
  revalidatePath("/settings");
  revalidatePath("/finance");
  revalidatePath("/dashboard");
  return { success: true, message: "Lisensi Pro berhasil dihapus." };
}

export async function saveInspirasiSetting(formData: FormData) {
  const enabled = formData.get("show_inspirasi") === "true";
  const strValue = enabled ? "1" : "0";

  await db.insert(systemStats)
    .values({ key: "show_inspirasi", value: strValue })
    .onConflictDoUpdate({
      target: systemStats.key,
      set: { value: strValue, lastUpdated: new Date().toISOString() }
    });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function updateSystemStat(key: string, value: string) {
  const authUser = await getCurrentUser();
  if (!canEditRecord(authUser)) return { error: "Unauthorized" };

  await db.insert(systemStats)
    .values({ key, value })
    .onConflictDoUpdate({
      target: systemStats.key,
      set: { value, lastUpdated: new Date().toISOString() }
    });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/");
  return { success: true };
}

import { mutabaahLogs, accounts, transactions, budgets, bondingActivities } from "@/db/schema";

export async function generateDemoData() {
    const authUser = await getCurrentUser();
    if (!canEditRecord(authUser)) return { error: "Unauthorized" };

    const allUsers = await db.select().from(users);
    const allWorships = await db.select().from(worships);
    
    const today = new Date();
    
    console.log("Generating Mutabaah Logs...");
    // 1. Mutabaah Logs (Last 30 days)
    for (const user of allUsers) {
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Randomly select 3-5 worships to log
            const randomWorships = allWorships.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 3);
            
            for (const w of randomWorships) {
                // Skip if log already exists
                const existing = await db.select().from(mutabaahLogs).where(
                    and(eq(mutabaahLogs.userId, user.id), eq(mutabaahLogs.worshipId, w.id), eq(mutabaahLogs.date, dateStr))
                ).get();
                
                if (!existing) {
                    await db.insert(mutabaahLogs).values({
                        userId: user.id,
                        worshipId: w.id,
                        date: dateStr,
                        value: w.levels ? Math.floor(Math.random() * 3) + 1 : 1, // Random level or boolean
                        timestamp: date.toISOString()
                    });
                }
            }
        }
    }

    console.log("Generating Finance Data...");
    // 2. Finance Data
    let myAccounts = await db.select().from(accounts);
    if (myAccounts.length === 0) {
        await db.insert(accounts).values([
            { id: crypto.randomUUID(), name: "Dompet Tunai", type: "CASH", balance: 1500000 },
            { id: crypto.randomUUID(), name: "Bank Syariah", type: "BANK", balance: 25000000 },
        ]);
        myAccounts = await db.select().from(accounts);
    }

    const categories = ["Makanan", "Transportasi", "Pendidikan", "Kesehatan", "Hiburan", "Zakat/Infaq"];
    
    for (const acc of myAccounts) {
        for (let i = 0; i < 15; i++) {
            const date = new Date();
            date.setDate(today.getDate() - Math.floor(Math.random() * 25));
            const dateStr = date.toISOString().split('T')[0];
            
            const isIncome = Math.random() > 0.8;
            const amount = isIncome ? (Math.floor(Math.random() * 5) + 1) * 1000000 : (Math.floor(Math.random() * 20) + 1) * 10000;
            
            await db.insert(transactions).values({
                id: crypto.randomUUID(),
                accountId: acc.id,
                type: isIncome ? "INCOME" : "EXPENSE",
                amount,
                category: isIncome ? "Gaji/Bonus" : categories[Math.floor(Math.random() * categories.length)],
                description: isIncome ? "Penghasilan Bulanan" : "Belanja Kebutuhan",
                dateMasehi: dateStr,
                dateHijri: dateStr, // Simplified for seed
                isHalalCertified: true
            });
        }
    }

    // 3. Budgets
    const existingBudgets = await db.select().from(budgets);
    if (existingBudgets.length === 0) {
        await db.insert(budgets).values([
            { category: "Makanan", monthlyLimit: 3000000, periodType: "MASEHI" },
            { category: "Transportasi", monthlyLimit: 1000000, periodType: "MASEHI" },
            { category: "Zakat/Infaq", monthlyLimit: 500000, periodType: "MASEHI" },
        ]);
    }

    console.log("Generating Bounding Data...");
    // 4. Bounding
    const allActivities = await db.select().from(bondingActivities);
    if (allActivities.length > 0) {
        const randomActivities = allActivities.sort(() => 0.5 - Math.random()).slice(0, 5);
        for (const act of randomActivities) {
            await db.update(bondingActivities)
                .set({ isCompleted: true, completedAt: today.toISOString() })
                .where(eq(bondingActivities.id, act.id));
        }
    }

    console.log("Generating Journal Data...");
    // 5. Journal
    const journalContents = [
        "Alhamdulillah hari ini bisa berkumpul bersama keluarga.",
        "Anak-anak sangat senang belajar tahsin hari ini.",
        "Bersyukur atas nikmat sehat yang diberikan Allah.",
        "Semoga target hafalan bulan ini tercapai.",
        "Hari yang penuh berkah, banyak rezeki tak terduga."
    ];
    const { journals } = await import("@/db/schema");
    
    for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(today.getDate() - Math.floor(Math.random() * 10));
        
        await db.insert(journals).values({
            id: crypto.randomUUID(),
            userId: allUsers[Math.floor(Math.random() * allUsers.length)].id,
            content: journalContents[Math.floor(Math.random() * journalContents.length)],
            createdAt: date.toISOString(),
            mood: ["😊", "😇", "🥰"][Math.floor(Math.random() * 3)]
        });
    }

    revalidatePath("/dashboard");
    revalidatePath("/finance");
    revalidatePath("/mutabaah");
    revalidatePath("/bonding");
    revalidatePath("/settings");
    revalidatePath("/journal");
    
    return { success: true, message: "Data dummy berhasil dibuat untuk bulan ini." };
}
