import { db } from "@/db";
import { sql } from "drizzle-orm";

const INIT_SQL = [
  `CREATE TABLE IF NOT EXISTS \`users\` (
    \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    \`name\` text NOT NULL,
    \`role\` text NOT NULL DEFAULT 'child',
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
    \`is_halal_certified\` integer DEFAULT false
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
    \`is_completed\` integer DEFAULT false,
    \`completed_at\` text
  )`,
];

let initialized = false;

/** Creates all tables (idempotent). Call before any DB query on first-time deploys. */
export async function ensureDb() {
  if (initialized) return;
  for (const stmt of INIT_SQL) {
    await db.run(sql.raw(stmt));
  }
  initialized = true;
}
