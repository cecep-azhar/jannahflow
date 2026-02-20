import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  role: text("role", { enum: ["parent", "child"] }).notNull().default("child"),
  pin: text("pin"), // Encrypted or simple check for parents
  telegramId: text("telegram_id"),
  avatarUrl: text("avatar_url"),
  targetPoints: integer("target_points").default(100),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const worships = sqliteTable("worships", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type", { enum: ["boolean", "counter"] }).notNull().default("boolean"),
  category: text("category", { enum: ["wajib", "sunnah"] }).notNull().default("sunnah"),
  points: integer("points").notNull().default(10),
  targetUnit: integer("target_unit"), // For counters, e.g. 100 dzikir
  iconName: text("icon_name"), // Lucide icon name
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const mutabaahLogs = sqliteTable("mutabaah_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  worshipId: integer("worship_id").references(() => worships.id, { onDelete: "cascade" }).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  value: integer("value").notNull(), // 1 for boolean, N for counter
  note: text("note"),
  timestamp: text("timestamp").default(sql`CURRENT_TIMESTAMP`),
});

export const systemStats = sqliteTable("system_stats", {
  key: text("key").primaryKey(), // e.g., 'page_views', 'pro_token'
  value: text("value").notNull().default(""), // changed to text to support pro_token
  lastUpdated: text("last_updated").default(sql`CURRENT_TIMESTAMP`),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull(),
  type: text("type", { enum: ["CASH", "BANK", "GOLD", "INVESTMENT"] }).notNull(),
  balance: integer("balance").notNull().default(0), // Store as integer (cents/lowest denom) or keep as number
});

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(), // UUID
  accountId: text("account_id").references(() => accounts.id, { onDelete: "cascade" }).notNull(),
  type: text("type", { enum: ["INCOME", "EXPENSE", "TRANSFER"] }).notNull(),
  amount: integer("amount").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  dateMasehi: text("date_masehi").notNull(),
  dateHijri: text("date_hijri").notNull(),
  isHalalCertified: integer("is_halal_certified", { mode: "boolean" }).default(false),
});

export const budgets = sqliteTable("budgets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category").notNull(),
  monthlyLimit: integer("monthly_limit").notNull(),
  periodType: text("period_type", { enum: ["MASEHI", "HIJRI"] }).notNull().default("MASEHI"),
});

export const assets = sqliteTable("assets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  purchasePrice: integer("purchase_price").notNull(),
  currentValuation: integer("current_valuation").notNull(),
  assetType: text("asset_type", { enum: ["PROPERTY", "GOLD", "VEHICLE", "STOCK"] }).notNull(),
});

export const quotes = sqliteTable("quotes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  source: text("source").notNull(),
  category: text("category").notNull(),
});

export const journals = sqliteTable("journals", {
  id: text("id").primaryKey(), // UUID
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  mediaUrls: text("media_urls"), // Stored as JSON string array
  mood: text("mood"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const bondingActivities = sqliteTable("bonding_activities", {
  id: text("id").primaryKey(), // UUID
  title: text("title").notNull(),
  description: text("description"),
  category: text("category", { enum: ["SPIRITUAL", "FUN", "SERVICE", "DEEP_TALK"] }).notNull(),
  isCompleted: integer("is_completed", { mode: "boolean" }).default(false),
  completedAt: text("completed_at"),
});

export const journalsRelations = relations(journals, ({ one }) => ({
	user: one(users, {
		fields: [journals.userId],
		references: [users.id],
	}),
}));

export const usersRelations = relations(users, ({ many }) => ({
  journals: many(journals),
}));

