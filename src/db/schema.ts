import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  role: text("role", { enum: ["parent", "child"] }).notNull().default("child"),
  gender: text("gender", { enum: ["M", "F", ""] }).default(""),
  birthDate: text("birth_date"),
  pin: text("pin"), // Encrypted or simple check for parents
  telegramId: text("telegram_id"),
  avatarUrl: text("avatar_url"),
  avatarColor: text("avatar_color"), // Custom hex or tailwind class
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
  levels: text("levels"), // JSON string array of { label: string, points: number }
  targetLevels: text("target_levels"), // JSON string array of IslamicLevel (e.g. '["parent", "baligh"]')
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

export const savingGoals = sqliteTable("saving_goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  targetAmount: integer("target_amount").notNull(),
  currentAmount: integer("current_amount").notNull().default(0),
  deadline: text("deadline"), // e.g., "Dzulhijjah 1446" or null
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
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

export const journalLikes = sqliteTable("journal_likes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  journalId: text("journal_id").references(() => journals.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const journalComments = sqliteTable("journal_comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  journalId: text("journal_id").references(() => journals.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const bondingActivities = sqliteTable("bonding_activities", {
  id: text("id").primaryKey(), // UUID
  title: text("title").notNull(),
  description: text("description"),
  category: text("category", { enum: ["SPIRITUAL", "FUN", "SERVICE", "DEEP_TALK"] }).notNull(),
  target: text("target", { enum: ["COUPLE", "FAMILY"] }).notNull().default("COUPLE"),
  isCompleted: integer("is_completed", { mode: "boolean" }).default(false),
  completedAt: text("completed_at"),
  insight: text("insight"), // Catatan/refleksi setelah selesai
  photoUrl: text("photo_url"), // Foto kegiatan (base64 or URL)
  mood: text("mood"), // Emoticon/perasaan
});

// =============================================
// MENU MAKAN MODULE
// =============================================

export const menuFoods = sqliteTable("menu_foods", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category", { enum: ["APPETIZER", "MAIN", "DESSERT"] }).notNull(),
  mealTime: text("meal_time").notNull(), // JSON: ["PAGI","SIANG","MALAM"]
  foodType: text("food_type", { enum: ["TRADISIONAL", "SIMPLE", "SEHAT", "DIET", "SUNNAH"] }).notNull(),
  description: text("description"),
  benefits: text("benefits").notNull(), // JSON string[]
  ingredients: text("ingredients").notNull(), // JSON: [{item, amount, perServing}]
  steps: text("steps").notNull(), // JSON string[]
  emoji: text("emoji").notNull().default("🍽️"),
  gradientFrom: text("gradient_from").notNull().default("#f97316"),
  gradientTo: text("gradient_to").notNull().default("#ef4444"),
  priceMin: integer("price_min").notNull().default(5000),
  priceMax: integer("price_max").notNull().default(20000),
  tags: text("tags"), // JSON string[]
  isSunnah: integer("is_sunnah", { mode: "boolean" }).default(false),
  servingUnit: text("serving_unit").notNull().default("porsi"),
  isCustom: integer("is_custom", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const mealPlans = sqliteTable("meal_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(), // YYYY-MM-DD, unique
  memberCount: integer("member_count").notNull().default(4),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const mealPlanItems = sqliteTable("meal_plan_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  planId: integer("plan_id").references(() => mealPlans.id, { onDelete: "cascade" }).notNull(),
  foodId: integer("food_id").references(() => menuFoods.id, { onDelete: "cascade" }).notNull(),
  mealTime: text("meal_time", { enum: ["PAGI", "SIANG", "MALAM"] }).notNull(),
  servings: integer("servings").notNull().default(1),
  notes: text("notes"),
});

// =============================================
// AL-QURAN MODULE
// =============================================

export const quranLogs = sqliteTable("quran_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: text("type", { enum: ["tilawah", "ziyadah", "murojaah", "tadabur", "setoran"] }).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  sessionTime: text("session_time"), // e.g. "07:30" – waktu sesi
  // Tilawah fields
  startSurah: integer("start_surah"),
  startAyat: integer("start_ayat"),
  endSurah: integer("end_surah"),
  endAyat: integer("end_ayat"),
  totalAyat: integer("total_ayat"), // computed & stored for fast access
  // Murojaah / Ziyadah
  surahNumber: integer("surah_number"),
  quality: text("quality", { enum: ["lancar", "cukup", "perlu_diulang"] }),
  // Tadabur
  ayatRef: text("ayat_ref"), // e.g. "Al-Baqarah:255"
  // Setoran
  teacherName: text("teacher_name"),
  material: text("material"),
  // General
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const ziyadahProgress = sqliteTable("ziyadah_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  surahNumber: integer("surah_number").notNull(),
  memorizedAyat: integer("memorized_ayat").notNull().default(0),
  totalAyat: integer("total_ayat").notNull(),
  percentComplete: real("percent_complete").notNull().default(0),
  status: text("status", { enum: ["hafalan", "mutqin"] }).notNull().default("hafalan"),
  lastMurojaahAt: text("last_murojaah_at"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const journalsRelations = relations(journals, ({ one, many }) => ({
	user: one(users, {
		fields: [journals.userId],
		references: [users.id],
	}),
  likes: many(journalLikes),
  comments: many(journalComments),
}));

export const journalLikesRelations = relations(journalLikes, ({ one }) => ({
  journal: one(journals, {
    fields: [journalLikes.journalId],
    references: [journals.id],
  }),
  user: one(users, {
    fields: [journalLikes.userId],
    references: [users.id],
  }),
}));

export const journalCommentsRelations = relations(journalComments, ({ one }) => ({
  journal: one(journals, {
    fields: [journalComments.journalId],
    references: [journals.id],
  }),
  user: one(users, {
    fields: [journalComments.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  journals: many(journals),
  journalLikes: many(journalLikes),
  journalComments: many(journalComments),
  mutabaahLogs: many(mutabaahLogs),
  quranLogs: many(quranLogs),
  ziyadahProgress: many(ziyadahProgress),
}));

export const quranLogsRelations = relations(quranLogs, ({ one }) => ({
  user: one(users, {
    fields: [quranLogs.userId],
    references: [users.id],
  }),
}));

export const ziyadahProgressRelations = relations(ziyadahProgress, ({ one }) => ({
  user: one(users, {
    fields: [ziyadahProgress.userId],
    references: [users.id],
  }),
}));

export const mutabaahLogsRelations = relations(mutabaahLogs, ({ one }) => ({
  user: one(users, {
    fields: [mutabaahLogs.userId],
    references: [users.id],
  }),
  worship: one(worships, {
    fields: [mutabaahLogs.worshipId],
    references: [worships.id],
  }),
}));

export const worshipsRelations = relations(worships, ({ many }) => ({
  logs: many(mutabaahLogs),
}));

