# Base
FROM node:20-alpine AS base

ARG BUILD_DATE
ARG VCS_REF
ARG VERSION
ENV CHARON_VERSION="${VERSION}-${VCS_REF} (${BUILD_DATE})"

# Builder
FROM base AS builder

WORKDIR /app

COPY package.json yarn.lock tsconfig.json env.d.ts ./
COPY src ./src

RUN yarn install --frozen-lockfile
RUN yarn build && \
    yarn install --production

# Runner
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

USER 1001

EXPOSE ${CHARON_PORT}

CMD ["node", "dist/index.js"]
