FROM node:20-bullseye-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY . .

RUN npm install

RUN npx prisma generate

EXPOSE 5001

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node src/server"]