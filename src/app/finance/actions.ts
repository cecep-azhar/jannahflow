"use server";

import { db } from "@/db";
import { accounts, transactions, budgets, assets, savingGoals } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

async function verifyNotChild() {
    const cookieStore = await cookies();
    const roleCookie = cookieStore.get("mutabaah-user-role")?.value;
    if (roleCookie === "child") {
        throw new Error("Akses ditolak: Akun anak tidak dapat memodifikasi data keuangan.");
    }
}

// ==================== ACCOUNTS ====================

export async function addAccount(formData: FormData) {
  await verifyNotChild();
  const name = formData.get("name") as string;
  const type = formData.get("type") as "CASH" | "BANK" | "GOLD" | "INVESTMENT";
  const balanceStr = formData.get("balance") as string;
  
  const balance = parseInt(balanceStr.replace(/\D/g, "")) || 0;

  await db.insert(accounts).values({
    id: crypto.randomUUID(),
    name,
    type,
    balance,
  });

  revalidatePath("/finance/accounts");
  revalidatePath("/finance");
  redirect("/finance/accounts");
}

export async function deleteAccount(formData: FormData) {
  await verifyNotChild();
  const id = formData.get("id") as string;
  await db.delete(accounts).where(eq(accounts.id, id));
  revalidatePath("/finance/accounts");
  revalidatePath("/finance");
}

// ==================== TRANSACTIONS ====================

export async function addTransaction(formData: FormData) {
  await verifyNotChild();
  const accountId = formData.get("accountId") as string;
  const type = formData.get("type") as "INCOME" | "EXPENSE" | "TRANSFER";
  const amountStr = formData.get("amount") as string;
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const dateMasehi = formData.get("dateMasehi") as string;
  const dateHijri = formData.get("dateHijri") as string;
  const isHalalCertified = formData.get("isHalalCertified") === "on";

  const amount = parseInt(amountStr.replace(/\D/g, "")) || 0;

  if (!accountId || !type || amount <= 0 || !category || !dateMasehi || !dateHijri) {
    throw new Error("Missing required fields");
  }

  const account = await db.query.accounts.findFirst({
    where: eq(accounts.id, accountId),
  });

  if (!account) {
    throw new Error("Account not found");
  }

  await db.insert(transactions).values({
    id: crypto.randomUUID(),
    accountId,
    type,
    amount,
    category,
    description,
    dateMasehi,
    dateHijri,
    isHalalCertified: isHalalCertified ? true : false,
  });

  let newBalance = account.balance;
  if (type === "INCOME") {
    newBalance += amount;
  } else if (type === "EXPENSE") {
    newBalance -= amount;
  }

  await db.update(accounts).set({ balance: newBalance }).where(eq(accounts.id, accountId));

  revalidatePath("/finance/transactions");
  revalidatePath("/finance/accounts");
  revalidatePath("/finance");
  revalidatePath("/finance/budgets");
  redirect("/finance/transactions");
}

export async function deleteTransaction(formData: FormData) {
  await verifyNotChild();
  const id = formData.get("id") as string;
  const accountId = formData.get("accountId") as string;
  const amountStr = formData.get("amount") as string;
  const type = formData.get("type") as string;

  const amount = parseInt(amountStr) || 0;

  // Revert balance
  if (accountId && amount > 0) {
    const account = await db.query.accounts.findFirst({ where: eq(accounts.id, accountId) });
    if (account) {
      let revertedBalance = account.balance;
      if (type === "INCOME") revertedBalance -= amount;
      else if (type === "EXPENSE") revertedBalance += amount;
      await db.update(accounts).set({ balance: revertedBalance }).where(eq(accounts.id, accountId));
    }
  }

  await db.delete(transactions).where(eq(transactions.id, id));
  revalidatePath("/finance/transactions");
  revalidatePath("/finance/accounts");
  revalidatePath("/finance");
  revalidatePath("/finance/budgets");
}

// ==================== BUDGETS ====================

export async function addBudget(formData: FormData) {
  await verifyNotChild();
  const category = formData.get("category") as string;
  const limitStr = formData.get("monthlyLimit") as string;
  const periodType = formData.get("periodType") as "MASEHI" | "HIJRI";

  const monthlyLimit = parseInt(limitStr.replace(/\D/g, "")) || 0;

  if (!category || monthlyLimit <= 0) throw new Error("Missing fields");

  await db.insert(budgets).values({
    category,
    monthlyLimit,
    periodType
  });

  revalidatePath("/finance/budgets");
  redirect("/finance/budgets");
}

export async function deleteBudget(formData: FormData) {
  await verifyNotChild();
  const id = formData.get("id") as string;
  await db.delete(budgets).where(eq(budgets.id, parseInt(id)));
  revalidatePath("/finance/budgets");
}

// ==================== ASSETS ====================

export async function addAsset(formData: FormData) {
  await verifyNotChild();
  const name = formData.get("name") as string;
  const purchasePriceStr = formData.get("purchasePrice") as string;
  const currentValuationStr = formData.get("currentValuation") as string;
  const assetType = formData.get("assetType") as "PROPERTY" | "GOLD" | "VEHICLE" | "STOCK";

  const purchasePrice = parseInt(purchasePriceStr.replace(/\D/g, "")) || 0;
  const currentValuation = parseInt(currentValuationStr.replace(/\D/g, "")) || 0;

  if (!name || !assetType) throw new Error("Missing fields");

  await db.insert(assets).values({
    name,
    purchasePrice,
    currentValuation,
    assetType
  });

  revalidatePath("/finance/assets");
  redirect("/finance/assets");
}

export async function deleteAsset(formData: FormData) {
  await verifyNotChild();
  const id = formData.get("id") as string;
  await db.delete(assets).where(eq(assets.id, parseInt(id)));
  revalidatePath("/finance/assets");
}

// ==================== SAVING GOALS ====================

export async function addSavingGoal(formData: FormData) {
  await verifyNotChild();
  const name = formData.get("name") as string;
  const targetAmountStr = formData.get("targetAmount") as string;
  const currentAmountStr = formData.get("currentAmount") as string;
  const deadline = formData.get("deadline") as string;

  const targetAmount = parseInt(targetAmountStr.replace(/\D/g, "")) || 0;
  const currentAmount = parseInt(currentAmountStr.replace(/\D/g, "")) || 0;

  if (!name || targetAmount <= 0) throw new Error("Missing required fields");

  await db.insert(savingGoals).values({
    name,
    targetAmount,
    currentAmount,
    deadline: deadline || null,
  });

  revalidatePath("/finance/saving-goals");
  redirect("/finance/saving-goals");
}

export async function addDeposit(formData: FormData) {
  await verifyNotChild();
  const id = formData.get("id") as string;
  const amountStr = formData.get("amount") as string;
  const amount = parseInt(amountStr.replace(/\D/g, "")) || 0;

  if (!id || amount <= 0) return;

  const goal = await db.query.savingGoals.findFirst({ where: eq(savingGoals.id, parseInt(id)) });
  if (!goal) return;

  const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
  await db.update(savingGoals).set({ currentAmount: newAmount }).where(eq(savingGoals.id, parseInt(id)));

  revalidatePath("/finance/saving-goals");
}

export async function deleteSavingGoal(formData: FormData) {
  await verifyNotChild();
  const id = formData.get("id") as string;
  await db.delete(savingGoals).where(eq(savingGoals.id, parseInt(id)));
  revalidatePath("/finance/saving-goals");
}
