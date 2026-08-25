import { syncFull } from "../services/sync.service";
import { sqlite } from "../db";

const result = await syncFull();
console.log(`[sync-full] selesai: ${result.total} drama di-upsert`);
sqlite.close();
process.exit(0);
