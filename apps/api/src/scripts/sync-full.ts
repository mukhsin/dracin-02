import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { db, sqlite } from "../db";

migrate(db, { migrationsFolder: `${import.meta.dir}/../../drizzle` });

const { syncFull } = await import("../services/sync.service");

const result = await syncFull();
console.log(`[sync-full] selesai: ${result.total} drama di-upsert`);
sqlite.close();
process.exit(0);
