"use server";

import { db } from "@/db";
import { users, worships, systemStats, journals, bondingActivities, accounts, transactions, budgets, mutabaahLogs } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and, ne } from "drizzle-orm";
import { bondingSeedData } from "@/lib/bonding-seed";
import { bondingFamilySeedData } from "@/lib/bonding-family-seed";

import { headers } from "next/headers";
import { verifyProToken } from "@/lib/pro-utils";

import { getCurrentUser, canDeleteRecord, canEditRecord } from "@/lib/auth-utils";

// --- Moslem Family Management ---

export async function addFamilyMember(formData: FormData) {
  const authUser = await getCurrentUser();
  if (!canEditRecord(authUser)) return { error: "Unauthorized" };
  const name = formData.get("name") as string;
  const role = formData.get("role") as "parent" | "child";
  const pin = formData.get("pin") as string;
  const avatarUrl = formData.get("avatarUrl") as string;
  const avatarColor = formData.get("avatarColor") as string;
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
    avatarColor,
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
    const avatarColor = formData.get("avatarColor") as string;
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
        avatarColor,
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

export async function saveFamilyPhoto(formData: FormData) {
  const photoBase64 = formData.get("familyPhoto") as string;
  
  // Can be empty if deleting
  await db.insert(systemStats)
    .values({ key: "family_photo", value: photoBase64 || "" })
    .onConflictDoUpdate({
      target: systemStats.key,
      set: { value: photoBase64 || "", lastUpdated: new Date().toISOString() }
    });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  
  return { success: true };
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


export async function generateDemoData(seedType: 'all' | 'mutabaah' | 'journal' | 'bounding' | 'finance' = 'all') {
    const authUser = await getCurrentUser();
    if (!canEditRecord(authUser)) return { error: "Unauthorized" };

    const allUsers = await db.select().from(users);
    const allWorships = await db.select().from(worships);
    
    const today = new Date();
    
    if (seedType === 'all' || seedType === 'mutabaah') {
      console.log("Clearing old mutabaah logs...");
      await db.delete(mutabaahLogs);
    }
    if (seedType === 'all' || seedType === 'finance') {
      console.log("Clearing old finance data...");
      await db.delete(transactions);
      await db.delete(accounts);
      await db.delete(budgets);
    }
    if (seedType === 'all' || seedType === 'journal') {
      console.log("Clearing old journal data...");
      await db.delete(journals);
    }
    if (seedType === 'all' || seedType === 'bounding') {
      // Bounding usually doesn't need full clear if we're just updating status
      // but if we want a fresh start:
      // await db.delete(bondingActivities); 
      // however our previous logic just updated status.
    }

    if (seedType === 'all' || seedType === 'mutabaah') {
      console.log("Generating Mutabaah Logs...");
      // 1. Mutabaah Logs (Last 30 days)
      for (const user of allUsers) {
          for (let i = 0; i < 30; i++) {
              const date = new Date();
              date.setDate(today.getDate() - i);
              const dateStr = date.toISOString().split('T')[0];
              
              const randomWorships = allWorships.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 3);
              
              for (const w of randomWorships) {
                  const existing = await db.select().from(mutabaahLogs).where(
                      and(eq(mutabaahLogs.userId, user.id), eq(mutabaahLogs.worshipId, w.id), eq(mutabaahLogs.date, dateStr))
                  ).get();
                  
                  if (!existing) {
                      await db.insert(mutabaahLogs).values({
                          userId: user.id,
                          worshipId: w.id,
                          date: dateStr,
                          value: w.levels ? Math.floor(Math.random() * 3) + 1 : 1,
                          timestamp: date.toISOString()
                      });
                  }
              }
          }
      }
    }

    if (seedType === 'all' || seedType === 'finance') {
      console.log("Generating Finance Data...");
      const cashAccountId = crypto.randomUUID();
      const bankAccountId = crypto.randomUUID();
      
      await db.insert(accounts).values([
          { id: cashAccountId, name: "Dompet Tunai", type: "CASH", balance: 1500000 },
          { id: bankAccountId, name: "Bank Syariah", type: "BANK", balance: 25000000 },
      ]);

      const categories = ["Makanan", "Transportasi", "Pendidikan", "Kesehatan", "Hiburan", "Zakat/Infaq"];
      const accountIds = [cashAccountId, bankAccountId];
      
      for (const accId of accountIds) {
          let currentBalance = accId === cashAccountId ? 1500000 : 25000000;
          
          for (let i = 0; i < 20; i++) {
              const date = new Date();
              date.setDate(today.getDate() - Math.floor(Math.random() * 28));
              const dateStr = date.toISOString().split('T')[0];
              
              const isIncome = Math.random() > 0.7;
              const amount = isIncome 
                  ? (Math.floor(Math.random() * 3) + 1) * 1000000 
                  : (Math.floor(Math.random() * 15) + 1) * 20000;
              
              await db.insert(transactions).values({
                  id: crypto.randomUUID(),
                  accountId: accId,
                  type: isIncome ? "INCOME" : "EXPENSE",
                  amount,
                  category: isIncome ? "Gaji/Bonus" : categories[Math.floor(Math.random() * categories.length)],
                  description: isIncome ? "Penghasilan Bulanan" : "Belanja Kebutuhan",
                  dateMasehi: dateStr,
                  dateHijri: dateStr,
                  isHalalCertified: true
              });

              currentBalance += isIncome ? amount : -amount;
          }

          await db.update(accounts).set({ balance: currentBalance }).where(eq(accounts.id, accId));
      }

      // Budgets
      await db.insert(budgets).values([
          { category: "Makanan", monthlyLimit: 3000000, periodType: "MASEHI" },
          { category: "Transportasi", monthlyLimit: 1000000, periodType: "MASEHI" },
          { category: "Zakat/Infaq", monthlyLimit: 500000, periodType: "MASEHI" },
      ]);
    }

    if (seedType === 'all' || seedType === 'bounding') {
      console.log("Generating Bounding Data...");
      await db.delete(bondingActivities);

      // Seed COUPLE activities (from bondingSeedData)
      for (const act of bondingSeedData) {
        const isCompleted = Math.random() > 0.8; // Lower completion rate for 100+ items
        await db.insert(bondingActivities).values({
          id: crypto.randomUUID(),
          title: act.title,
          description: act.description,
          category: act.category as "SPIRITUAL" | "FUN" | "SERVICE" | "DEEP_TALK",
          target: "COUPLE",
          isCompleted,
          completedAt: isCompleted ? today.toISOString() : null,
          mood: isCompleted ? ["😊", "🥰", "😇", "🤩", "💖", "🤝", "🤲", "🔥"][Math.floor(Math.random() * 8)] : null,
          insight: isCompleted ? "Alhamdulillah kegiatan ini sangat bermanfaat untuk keharmonisan kami." : null
        });
      }

      // Seed FAMILY activities (from bondingFamilySeedData)
      for (const act of bondingFamilySeedData) {
        const isCompleted = Math.random() > 0.8;
        await db.insert(bondingActivities).values({
          id: crypto.randomUUID(),
          title: act.title,
          description: act.description,
          category: act.category as "SPIRITUAL" | "FUN" | "SERVICE" | "DEEP_TALK",
          target: "FAMILY",
          isCompleted,
          completedAt: isCompleted ? today.toISOString() : null,
          mood: isCompleted ? ["😊", "🥰", "😇", "🤩", "💖", "🤝", "🤲", "🔥"][Math.floor(Math.random() * 8)] : null,
          insight: isCompleted ? "Alhamdulillah anak-anak sangat antusias mengikuti kegiatan ini." : null
        });
      }
    }

    if (seedType === 'all' || seedType === 'journal') {
      console.log("Generating Journal Data...");
      const journalContents = [
          "Alhamdulillah hari ini bisa berkumpul bersama keluarga.",
          "Anak-anak sangat senang belajar tahsin hari ini.",
          "Bersyukur atas nikmat sehat yang diberikan Allah.",
          "Semoga target hafalan bulan ini tercapai.",
          "Hari yang penuh berkah, banyak rezeki tak terduga."
      ];
      
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
    }

    revalidatePath("/dashboard");
    revalidatePath("/finance");
    revalidatePath("/mutabaah");
    revalidatePath("/bonding");
    revalidatePath("/settings");
    revalidatePath("/journal");
    
    return { success: true, message: `Data dummy ${seedType === 'all' ? '' : seedType} berhasil dibuat.` };
}
