-- AlterTable: flag para marcar usuarios que operan maquinaria (independiente del rol)
ALTER TABLE "users" ADD COLUMN "operates_machinery" BOOLEAN NOT NULL DEFAULT false;
