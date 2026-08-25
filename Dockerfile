FROM oven/bun:1.2 AS build
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/api-proxy/package.json apps/api-proxy/
COPY packages/shared/package.json packages/shared/

RUN bun install --frozen-lockfile

COPY . .

RUN cd apps/web && bun run build

FROM oven/bun:1.2 AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/api-proxy/package.json apps/api-proxy/
COPY packages/shared/package.json packages/shared/

RUN bun install --frozen-lockfile --production

COPY --from=build /app/apps/web/dist ./apps/web/dist
COPY --from=build /app/apps/api/drizzle ./apps/api/drizzle
COPY --from=build /app/apps/api/src ./apps/api/src
COPY --from=build /app/apps/api-proxy/index.js ./apps/api-proxy/index.js
COPY --from=build /app/apps/api-proxy/dracin.js ./apps/api-proxy/dracin.js
COPY --from=build /app/apps/api-proxy/token.js ./apps/api-proxy/token.js
COPY --from=build /app/packages ./packages

EXPOSE 3001 3002

CMD ["bun", "apps/api/src/index.ts"]
