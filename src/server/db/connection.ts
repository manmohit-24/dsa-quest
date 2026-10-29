import fs from "node:fs";
import Database from "better-sqlite3";
import { DATA_DIR, DB_PATH } from "./paths";

export type DB = Database.Database;

/** Open (creating the data folder if needed) the SQLite database with our pragmas. */
export function openDatabase(): DB {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  return db;
}
