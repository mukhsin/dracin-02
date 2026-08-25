import type {
  DramaListData,
  ErrorEnvelope,
  GenreWithCount,
  SuccessEnvelope,
} from "@dracin/shared";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { listDramasQuerySchema } from "@dracin/shared";
import { dramaService } from "../services/drama.service";

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
