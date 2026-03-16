FROM node:20-bullseye-slim

WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

COPY package*.json ./

RUN npm install --omit=dev

COPY prisma ./prisma

RUN npx prisma generate

COPY . .

EXPOSE 5001

CMD ["sh", "-c", "npx prisma migrate resolve --rolled-back 20260314173459_soft_delete_system || true && npx prisma migrate deploy && npx prisma db seed || true && node src/server.js"]