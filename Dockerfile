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

CMD ["npm","run","start:prod"]