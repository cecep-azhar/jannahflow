"use server";

import { db } from "@/db";
import { mutabaahLogs, users, worships, transactions, accounts, journals } from "@/db/schema";
import { and, gte, lte, eq, desc } from "drizzle-orm";

export async function getReportData(startDate: string, endDate: string) {
  const allUsers = await db.select().from(users);
  const allWorships = await db.select().from(worships);
  
  // Fetch logs within range
  const logs = await db.select().from(mutabaahLogs).where(
    and(
      gte(mutabaahLogs.date, startDate),
      lte(mutabaahLogs.date, endDate)
    )
  );

  // Group data by User -> Date -> Worship
  // Structure: 
  // [
  //   { 
  //     user: { name, role },
  //     summary: { totalPoints: X, percentage: Y },
  //     details: [ { date: 'YYYY-MM-DD', points: Z } ]
  //   }
  // ]

  const report = allUsers.map(user => {
    const userLogs = logs.filter(l => l.userId === user.id);
    
    // Calculate total possible points in range? 
    // Or just sum obtained points? 
    // Let's sum obtained points for now.
    
    let totalPoints = 0;
    userLogs.forEach(log => {
      const worship = allWorships.find(w => w.id === log.worshipId);
      if (worship) {
         if (worship.type === 'boolean') {
             if (log.value > 0) totalPoints += worship.points;
         } else {
             // For counter, assuming 1 value = 1 point roughly or based on target?
             // Reverting to simple logic: logicValue > 0 = points
             if (log.value > 0) totalPoints += worship.points;
         }
      }
    });

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      totalPoints,
      logs: userLogs
    };
  });

  return { report, allWorships };
}

export async function getFinanceReportData(startDate: string, endDate: string) {
  const allAccounts = await db.select().from(accounts);
  const totalBalance = allAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  const txs = await db.select().from(transactions).where(
    and(
      gte(transactions.dateMasehi, startDate),
      lte(transactions.dateMasehi, endDate)
    )
  );

  const totalIncome = txs.filter(t => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = txs.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);

  return {
    accounts: allAccounts,
    transactions: txs,
    summary: { totalBalance, totalIncome, totalExpense }
  };
}

export async function getJournalReportData(startDate: string, endDate: string) {
  try {
     const rows = await db
         .select({
             id: journals.id,
             userId: journals.userId,
             content: journals.content,
             mediaUrls: journals.mediaUrls,
             mood: journals.mood,
             createdAt: journals.createdAt,
             userName: users.name,
             userRole: users.role,
         })
         .from(journals)
         .leftJoin(users, eq(journals.userId, users.id))
         .where(
             and(
                 gte(journals.createdAt, startDate),
                 lte(journals.createdAt, endDate + "T23:59:59.999Z")
             )
         )
         .orderBy(desc(journals.createdAt));

     return rows.map((row) => ({
         id: row.id,
         userId: row.userId,
         content: row.content,
         mediaUrls: row.mediaUrls,
         mood: row.mood,
         createdAt: row.createdAt,
         user: {
             name: row.userName ?? "Unknown",
             role: row.userRole ?? "child",
         },
     }));
  } catch (e) {
      console.error(e);
      return [];
  }
}

