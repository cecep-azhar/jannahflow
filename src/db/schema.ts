import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
  key: text("key").primaryKey(), // e.g., 'page_views'
  value: integer("value").notNull().default(0),
  lastUpdated: text("last_updated").default(sql`CURRENT_TIMESTAMP`),
});
