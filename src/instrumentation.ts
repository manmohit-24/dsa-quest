/**
 * Runs once when the server starts. Opening the database here means the
 * schema, first-run seeding and the seed.sql auto-snapshot happen at startup
 * (like the original `db.js`) instead of on the first request.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { getDb } = await import("@/server/db");
  getDb();
}
