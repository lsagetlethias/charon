ARG NODE_VERSION=20-alpine

# Builder
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY package.json yarn.lock tsconfig.json env.d.ts ./
COPY src ./src

ARG CHARON_PORT=4500
ENV CHARON_PORT=${CHARON_PORT}

RUN yarn install --frozen-lockfile
RUN yarn build && \
    yarn install --production

# Runner
FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

USER 1001

EXPOSE ${CHARON_PORT}

CMD ["node", "dist/index.js"]
