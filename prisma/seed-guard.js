import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

console.log("🗑️ Limpiando base de datos...");
await prisma.$executeRawUnsafe(`
  DO $$ DECLARE
    r RECORD;
  BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
      EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
    END LOOP;
  END $$;
`);
await prisma.$disconnect();

console.log("🌱 Corriendo seed...");
execSync("node prisma/seed.js", { stdio: "inherit" });
