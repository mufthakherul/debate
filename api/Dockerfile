FROM node:20-bullseye-slim AS builder

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl libssl1.1 && rm -rf /var/lib/apt/lists/*

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build
RUN npm prune --production

FROM node:20-bullseye-slim AS runtime

WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl libssl1.1 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
EXPOSE 8000

USER node
CMD ["node", "dist/index.js"]
