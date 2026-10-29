import path from "node:path";

const root = process.cwd();

/** Folder holding the SQLite file. Override with `DATA_DIR`. */
export const DATA_DIR = process.env.DATA_DIR ?? path.join(root, "data");
export const DB_PATH = path.join(DATA_DIR, "problems.db");

export const SCHEMA_PATH = path.join(root, "db", "schema.sql");

/** The portable backup / source of truth for your data. Override with `SEED_PATH`. */
export const SEED_PATH =
  process.env.SEED_PATH ?? path.join(root, "db", "seed.sql");

/** Committed starter data, used when no `seed.sql` exists yet. */
export const SEED_SAMPLE_PATH = path.join(root, "db", "seed.sample.sql");

export const BACKUP_DIR = path.join(path.dirname(SEED_PATH), "backups");
