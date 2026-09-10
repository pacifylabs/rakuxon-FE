# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
COPY . .
RUN pnpm install --frozen-lockfile
FROM dependencies AS build
ARG APP_NAME
ARG NEXT_PUBLIC_API_BASE_URL=/api
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
# Build-time catalogue requests fail fast; runtime uses the private API.
ENV API_INTERNAL_URL=http://127.0.0.1:3001
RUN pnpm --filter @rakuxon/$APP_NAME build
RUN mkdir -p apps/$APP_NAME/public /output/apps/$APP_NAME/.next && \
    cp -a apps/$APP_NAME/.next/standalone/. /output/ && \
    cp -a apps/$APP_NAME/.next/static /output/apps/$APP_NAME/.next/static && \
    cp -a apps/$APP_NAME/public /output/apps/$APP_NAME/public
FROM node:24-bookworm-slim AS runtime
ARG APP_NAME
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
WORKDIR /app
COPY --from=build --chown=node:node /output/ ./
USER node
WORKDIR /app/apps/$APP_NAME
EXPOSE 3000
CMD ["node", "server.js"]
