import type {
  DramaListData,
  EpisodeDataDto,
  ErrorEnvelope,
  GenreWithCount,
  SuccessEnvelope,
} from "@dracin/shared";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { listDramasQuerySchema } from "@dracin/shared";
import { dramaService } from "../services/drama.service";
import { episodeService } from "../services/episode.service";

export const dramaRoutes = new Hono();

dramaRoutes.get("/", zValidator("query", listDramasQuerySchema), async (c) => {
  const query = c.req.valid("query");
  const data: DramaListData = await dramaService.list(query);
  return c.json({ success: true, data } satisfies SuccessEnvelope<DramaListData>);
});

// Statik didahulukan agar tidak tertelan param :slug.
dramaRoutes.get("/featured", async (c) => {
  const limit = Math.min(Number(c.req.query("limit")) || 10, 20);
  const items = await dramaService.featured(limit);
  return c.json({ success: true, data: { items } });
});

dramaRoutes.get("/genres", async (c) => {
  const genres: GenreWithCount[] = await dramaService.genres();
  return c.json({ success: true, data: genres });
});

dramaRoutes.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const drama = await dramaService.bySlug(slug);
  if (!drama) {
    const body: ErrorEnvelope = {
      success: false,
      error: { code: "NOT_FOUND", message: `Drama "${slug}" tidak ditemukan` },
    };
    return c.json(body, 404);
  }
  return c.json({
    success: true,
    data: drama,
  } satisfies SuccessEnvelope<typeof drama>);
});

// URL video selalu on-demand: diambil segar dari api-proxy, tak tersimpan di DB.
dramaRoutes.get("/:slug/episodes/:number", async (c) => {
  const slug = c.req.param("slug");
  const result = await episodeService.getEpisode(slug, c.req.param("number"));
  if (!result.ok) {
    const message =
      result.reason === "drama-not-found"
        ? `Drama "${slug}" tidak ditemukan`
        : `Episode "${c.req.param("number")}" di luar rentang drama ini`;
    const body: ErrorEnvelope = {
      success: false,
      error: { code: "NOT_FOUND", message },
    };
    return c.json(body, 404);
  }
  return c.json({
    success: true,
    data: result.data,
    meta: { source: result.source },
  } satisfies SuccessEnvelope<EpisodeDataDto>);
});
