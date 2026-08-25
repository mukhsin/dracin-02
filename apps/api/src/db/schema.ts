import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Mirror katalog drama dari upstream DramaBox.
 * Satu-satunya tabel inti di MVP: tanpa seasons, tanpa episodes
 * (jumlah episode cukup dari totalEpisodes; URL video selalu on-demand).
 */
export const dramas = sqliteTable(
  "dramas",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    /** ID drama di upstream (DramaBox bookId). Kunci upsert saat sync. */
    bookId: text("book_id").notNull().unique(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    posterUrl: text("poster_url"),
    genres: text("genres", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),
    status: text("status", { enum: ["ongoing", "completed"] })
      .notNull()
      .default("ongoing"),
    totalEpisodes: integer("total_episodes").notNull().default(0),
    playCount: text("play_count"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    featuredOrder: integer("featured_order"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("dramas_status_idx").on(table.status),
    index("dramas_featured_idx").on(table.featured, table.featuredOrder),
  ],
);

export type Drama = typeof dramas.$inferSelect;
export type NewDrama = typeof dramas.$inferInsert;
