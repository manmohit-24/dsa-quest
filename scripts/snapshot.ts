/**
 * CLI: dump the current DB state → db/seed.sql
 *
 *   npm run snapshot          overwrite seed.sql
 *   npm run snapshot:backup   also write db/backups/seed.<timestamp>.sql
 *   npm run snapshot:dry      print to console, write nothing
 */
import fs from "node:fs";
import { openDatabase } from "../src/server/db/connection";
import { DB_PATH } from "../src/server/db/paths";
import { writeSnapshot } from "../src/server/db/snapshot";

const args = process.argv.slice(2);

if (!fs.existsSync(DB_PATH)) {
  console.error(
    "❌ problems.db not found. Start the app once first (npm run dev).",
  );
  process.exit(1);
}

const db = openDatabase();
try {
  const result = writeSnapshot(db, {
    dryRun: args.includes("--dry-run"),
    backup: args.includes("--backup"),
  });

  if (!result.written) {
    console.log(result.sql);
    console.log("\n[dry-run] Nothing written.");
  } else {
    console.log(
      `✅ seed.sql updated (${result.problems} problems, ${result.links} links)`,
    );
    if (result.backupPath)
      console.log(`📦 Backup written: ${result.backupPath}`);
  }
} finally {
  db.close();
}
