import { db } from "@/db";
import { sql } from "drizzle-orm";
import { quotes } from "@/db/schema";
import quotesData from "@/db/quotes.json";

const INIT_SQL = [
  `CREATE TABLE IF NOT EXISTS \`users\` (
    \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    \`name\` text NOT NULL,
    \`role\` text NOT NULL DEFAULT 'child',
    \`gender\` text DEFAULT '',
    \`birth_date\` text,
    \`pin\` text,
    \`telegram_id\` text,
    \`avatar_url\` text,
    \`target_points\` integer DEFAULT 100,
    \`created_at\` text DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS \`worships\` (
    \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    \`name\` text NOT NULL,
    \`type\` text NOT NULL DEFAULT 'boolean',
    \`category\` text NOT NULL DEFAULT 'sunnah',
    \`points\` integer NOT NULL DEFAULT 10,
    \`target_unit\` integer,
    \`icon_name\` text,
    \`levels\` text,
    \`target_levels\` text,
    \`created_at\` text DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS \`mutabaah_logs\` (
    \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    \`user_id\` integer NOT NULL,
    \`worship_id\` integer NOT NULL,
    \`date\` text NOT NULL,
    \`value\` integer NOT NULL,
    \`note\` text,
    \`timestamp\` text DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS \`system_stats\` (
    \`key\` text PRIMARY KEY NOT NULL,
    \`value\` text NOT NULL DEFAULT '',
    \`last_updated\` text DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS \`accounts\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`name\` text NOT NULL,
    \`type\` text NOT NULL,
    \`balance\` integer NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS \`transactions\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`account_id\` text NOT NULL,
    \`type\` text NOT NULL,
    \`amount\` integer NOT NULL,
    \`category\` text NOT NULL,
    \`description\` text,
    \`date_masehi\` text NOT NULL,
    \`date_hijri\` text NOT NULL,
    \`is_halal_certified\` integer DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS \`budgets\` (
    \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    \`category\` text NOT NULL,
    \`monthly_limit\` integer NOT NULL,
    \`period_type\` text NOT NULL DEFAULT 'MASEHI'
  )`,
  `CREATE TABLE IF NOT EXISTS \`assets\` (
    \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    \`name\` text NOT NULL,
    \`purchase_price\` integer NOT NULL,
    \`current_valuation\` integer NOT NULL,
    \`asset_type\` text NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS \`quotes\` (
    \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    \`text\` text NOT NULL,
    \`source\` text NOT NULL,
    \`category\` text NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS \`journals\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`user_id\` integer NOT NULL,
    \`content\` text NOT NULL,
    \`media_urls\` text,
    \`mood\` text,
    \`created_at\` text DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS \`bonding_activities\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`title\` text NOT NULL,
    \`description\` text,
    \`category\` text NOT NULL,
    \`target\` text NOT NULL DEFAULT 'COUPLE',
    \`is_completed\` integer DEFAULT 0,
    \`completed_at\` text,
    \`insight\` text,
    \`photo_url\` text,
    \`mood\` text
  )`,
  `CREATE TABLE IF NOT EXISTS \`journal_likes\` (
    \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    \`journal_id\` text NOT NULL,
    \`user_id\` integer NOT NULL,
    \`created_at\` text DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS \`journal_comments\` (
    \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    \`journal_id\` text NOT NULL,
    \`user_id\` integer NOT NULL,
    \`content\` text NOT NULL,
    \`created_at\` text DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS \`saving_goals\` (
    \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    \`name\` text NOT NULL,
    \`target_amount\` integer NOT NULL,
    \`current_amount\` integer NOT NULL DEFAULT 0,
    \`deadline\` text,
    \`created_at\` text DEFAULT CURRENT_TIMESTAMP
  )`,
];

let initialized = false;

/** Creates all tables (idempotent). Call before any DB query on first-time deploys. */
export async function ensureDb() {
  if (initialized) return;
  
  // 1. Create tables if they don't exist
  for (const stmt of INIT_SQL) {
    await db.run(sql.raw(stmt));
  }

  // 2. Migration: Add missing columns (each wrapped in own try-catch)
  const migrations = [
      { table: "users", column: "gender", type: "text DEFAULT ''" },
      { table: "users", column: "birth_date", type: "text" },
      { table: "users", column: "telegram_id", type: "text" },
      { table: "users", column: "target_points", type: "integer DEFAULT 100" },
      { table: "users", column: "avatar_color", type: "text" },
      { table: "worships", column: "levels", type: "text" },
      { table: "worships", column: "target_levels", type: "text" },
      { table: "bonding_activities", column: "insight", type: "text" },
      { table: "bonding_activities", column: "photo_url", type: "text" },
      { table: "bonding_activities", column: "target", type: "text NOT NULL DEFAULT 'COUPLE'" },
      { table: "bonding_activities", column: "mood", type: "text" },
  ];

  for (const m of migrations) {
      try {
          await db.run(sql.raw(`ALTER TABLE \`${m.table}\` ADD COLUMN \`${m.column}\` ${m.type}`));
          console.log(`Migrated: added ${m.column} to ${m.table}`);
      } catch {
          // Column already exists, skip
      }
  }

  // 3. Seed quotes if empty or to fix data
  try {
    console.log(`Applying quote fixes...`);
    await db.delete(quotes);
    
    // Fix Quote Seeder format
    const fixedQuotes = quotesData.map((q: { category: string, text: string, source: string }) => {
        const match = q.category.match(/^(.*\([0-9-]+\))(.*)$/);
        if (match && match[2].trim()) {
            const cat = match[1].trim();
            let indText = match[2].trim();
            if (indText.endsWith('*') || indText.endsWith('"') || indText.endsWith('.')) {
                indText = indText.replace(/[*".]+$/, '');
            }
            return { ...q, category: cat, text: indText + ' (' + q.text + ')' };
        }
        return q;
    });

    for (let i = 0; i < fixedQuotes.length; i += 50) {
      const chunk = fixedQuotes.slice(i, i + 50);
      await db.insert(quotes).values(chunk);
    }
    console.log("Quotes seeded successfully.");
  } catch (e) {
    console.error("Quote seeding error (non-fatal):", e);
  }

  // 4. Remove Quran Worships if they exist in Mutabaah
  try {
    await db.run(sql.raw(`DELETE FROM \`worships\` WHERE \`name\` IN ('Tilawah', 'Murojaah', 'Ziyadah', 'Setoran', 'Tadabur')`));
  } catch(e) {}

  initialized = true;
}
