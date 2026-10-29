import "server-only";
import { initializeDatabase } from "./bootstrap";
import { openDatabase, type DB } from "./connection";

/**
 * One connection per server process. It lives on `globalThis` so Next's dev
 * server (which re-evaluates modules on every edit) doesn't leak connections,
 * and so the RSC, route and instrumentation bundles all share it.
 */
const globalForDb = globalThis as typeof globalThis & { __dsaQuestDb?: DB };

export function getDb(): DB {
  if (!globalForDb.__dsaQuestDb) {
    const db = openDatabase();
    initializeDatabase(db);
    globalForDb.__dsaQuestDb = db;
  }
  return globalForDb.__dsaQuestDb;
}
