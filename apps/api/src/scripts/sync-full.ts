import { syncFull } from "../services/sync.service";

const result = await syncFull();
console.log(`[sync-full] selesai: ${result.total} drama di-upsert`);
process.exit(0);
