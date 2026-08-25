import { and, asc, count, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "../db";
import { dramas, type Drama } from "../db/schema";
import type {
  DramaDto,
  GenreWithCount,
  ListDramasQuery,
} from "@dracin/shared";

function toDto(row: Drama): DramaDto {
  return {
    id: row.id,
    bookId: row.bookId,
    slug: row.slug,
    title: row.title,
    description: row.description,
    posterUrl: row.posterUrl,
    genres: row.genres ?? [],
    status: row.status,
    totalEpisodes: row.totalEpisodes,
    playCount: row.playCount,
    featured: row.featured,
    featuredOrder: row.featuredOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const POPULAR_SCORE = sql`(
  CAST(COALESCE(REPLACE(REPLACE(${dramas.playCount}, 'K', ''), 'M', ''), '0') AS REAL)
  * CASE
      WHEN ${dramas.playCount} LIKE '%M' THEN 1000000
      WHEN ${dramas.playCount} LIKE '%K' THEN 1000
      ELSE 1
    END
)`;

export interface PaginatedDramas {
  items: DramaDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const dramaService = {
  async list(query: ListDramasQuery): Promise<PaginatedDramas> {
    const conditions = [];
    if (query.search) {
      const needle = `%${query.search}%`;
      conditions.push(
        or(like(dramas.title, needle), like(dramas.description, needle)),
      );
    }
    if (query.genre) {
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM json_each(${dramas.genres}) je
          WHERE lower(je.value) = ${query.genre.toLowerCase()}
        )`,
      );
    }
    const where = conditions.length ? and(...conditions) : undefined;

    const orderBy =
      query.sort === "popular"
        ? [desc(POPULAR_SCORE)]
        : query.sort === "title"
          ? [sql`${dramas.title} COLLATE NOCASE ASC`]
          : [desc(dramas.createdAt), asc(dramas.title)];

    const countRows = await db
      .select({ total: count() })
      .from(dramas)
      .where(where);
    const total = countRows[0]?.total ?? 0;

    const totalPages = Math.ceil(total / query.limit);
    const rows = await db
      .select()
      .from(dramas)
      .where(where)
      .orderBy(...orderBy)
      .limit(query.limit)
      .offset((query.page - 1) * query.limit);

    return {
      items: rows.map(toDto),
      pagination: { page: query.page, limit: query.limit, total, totalPages },
    };
  },

  async featured(limit: number): Promise<DramaDto[]> {
    const rows = await db
      .select()
      .from(dramas)
      .where(eq(dramas.featured, true))
      .orderBy(asc(dramas.featuredOrder))
      .limit(limit);
    return rows.map(toDto);
  },

  async genres(): Promise<GenreWithCount[]> {
    const rows = await db.all<{ name: string; dramaCount: number }>(sql`
      SELECT je.value AS name, COUNT(*) AS dramaCount
      FROM ${dramas}, json_each(${dramas.genres}) je
      GROUP BY je.value
      ORDER BY dramaCount DESC, name ASC
    `);
    return rows;
  },

  async bySlug(slug: string): Promise<DramaDto | null> {
    const row = await db
      .select()
      .from(dramas)
      .where(eq(dramas.slug, slug))
      .get();
    return row ? toDto(row) : null;
  },
};
