import { sql } from "drizzle-orm";
import { db } from "../db";
import { dramas, type NewDrama } from "../db/schema";
import { apiProxyClient, type UpstreamDrama } from "./api-proxy.client";

const UPSERT_CHUNK = 50;

function slugify(title: string, bookId: string): string {
  const base =
    title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "drama";
  return `${base}-${bookId.slice(-6)}`;
}

type FeaturedOrder = number | null;

function toRow(d: UpstreamDrama, featuredOrder: FeaturedOrder = null): NewDrama {
  const bookId = String(d.bookId);
  const row: NewDrama = {
    bookId,
    slug: slugify(String(d.title ?? ""), bookId),
    title: String(d.title ?? "").trim(),
    description: d.intro ? String(d.intro) : null,
    posterUrl: d.cover ? String(d.cover) : null,
    genres: [],
    status: "ongoing",
    totalEpisodes: Number(d.chapterCount ?? d.episodeCount ?? 0),
    playCount: d.playCount != null ? String(d.playCount) : null,
    updatedAt: new Date(),
  };
  if (featuredOrder !== null) {
    row.featured = true;
    row.featuredOrder = featuredOrder;
  }
  return row;
}

async function upsertRows(rows: NewDrama[]): Promise<number> {
  let total = 0;
  for (let i = 0; i < rows.length; i += UPSERT_CHUNK) {
    const chunk = rows.slice(i, i + UPSERT_CHUNK);
    await db
      .insert(dramas)
      .values(chunk)
      .onConflictDoUpdate({
        target: dramas.bookId,
        set: {
          slug: sql`excluded.slug`,
          title: sql`excluded.title`,
          description: sql`excluded.description`,
          posterUrl: sql`excluded.poster_url`,
          totalEpisodes: sql`excluded.total_episodes`,
          playCount: sql`excluded.play_count`,
          featured: sql`excluded.featured`,
          featuredOrder: sql`excluded.featured_order`,
          updatedAt: new Date(),
        },
      });
    total += chunk.length;
  }
  return total;
}

async function upsertPlain(items: UpstreamDrama[]): Promise<number> {
  return upsertRows(items.map((d) => toRow(d)));
}

async function upsertFeatured(items: UpstreamDrama[]): Promise<number> {
  return upsertRows(items.map((d, i) => toRow(d, i)));
}

export interface SyncResult {
  latest: number;
  featured: number;
  rank: number;
}

/** Sinkronisasi ringan untuk cron: latest + featured + rank. Idempoten by bookId. */
export async function syncIncremental(): Promise<SyncResult> {
  const [latest, featured, rank] = await Promise.all([
    apiProxyClient.latest(1, 50),
    apiProxyClient.featured(1, 50),
    apiProxyClient.rank(1),
  ]);

  const plain = [...latest, ...rank];
  await upsertPlain(plain);
  await upsertFeatured(featured);

  return { latest: latest.length, featured: featured.length, rank: rank.length };
}

export interface SyncFullResult {
  total: number;
}

/** Seed awal: tarik seluruh katalog indo (~865) dan upsert semuanya. */
export async function syncFull(): Promise<SyncFullResult> {
  const all = await apiProxyClient.fetchAllIndo();
  const total = await upsertPlain(all);
  return { total };
}
