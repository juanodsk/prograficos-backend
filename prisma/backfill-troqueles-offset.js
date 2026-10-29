// Backfill de UNA sola ejecución: asigna la línea de servicio "Offset" a todos
// los troqueles que aún no tienen línea (service_line_id IS NULL).
//
// Es idempotente: si se corre de nuevo, no toca los que ya tienen línea.
// Uso:  node prisma/backfill-troqueles-offset.js
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({ quiet: true });

const prisma = new PrismaClient();

const run = async () => {
  const offset = await prisma.serviceLine.findUnique({
    where: { name: "Offset" },
    select: { id: true },
  });

  if (!offset) {
    throw new Error(
      'No existe la línea de servicio "Offset". Crea las líneas antes del backfill.',
    );
  }

  const pending = await prisma.troqueles.count({
    where: { service_line_id: null },
  });

  if (pending === 0) {
    console.log("✅ Nada que hacer: todos los troqueles ya tienen línea.");
    return;
  }

  const result = await prisma.troqueles.updateMany({
    where: { service_line_id: null },
    data: { service_line_id: offset.id },
  });

  console.log(
    `✅ ${result.count} troquel(es) actualizados a Offset (id ${offset.id}).`,
  );
};

run()
  .catch((error) => {
    console.error("❌ Backfill falló:", error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
