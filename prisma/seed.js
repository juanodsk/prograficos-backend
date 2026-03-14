import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  const salt = await bcrypt.genSalt(10);

  // ==================== USERS ====================
  const admin = await prisma.user.upsert({
    where: { email: "admin@prograficos.com" },
    update: {},
    create: {
      name: "Admin",
      surename: "Principal",
      email: "admin@prograficos.com",
      password: await bcrypt.hash("admin123", salt),
      role: "ADMIN",
      is_active: true,
    },
  });

  const supervisor = await prisma.user.upsert({
    where: { email: "supervisor@prograficos.com" },
    update: {},
    create: {
      name: "Carlos",
      surename: "Supervisor",
      email: "supervisor@prograficos.com",
      password: await bcrypt.hash("super123", salt),
      role: "SUPERVISOR",
      is_active: true,
    },
  });

  const operario = await prisma.user.upsert({
    where: { email: "operario@prograficos.com" },
    update: {},
    create: {
      name: "Luis",
      surename: "Operario",
      email: "operario@prograficos.com",
      password: await bcrypt.hash("operario123", salt),
      role: "EMPLOYEE",
      is_active: true,
    },
  });

  console.log("✅ Users listos");

  // ==================== TROQUELES ====================
  const troquel1 = await prisma.troqueles.upsert({
    where: { code: "Troquel 1" },
    update: {},
    create: {
      code: "Troquel 1",
      size: "MEDIUM",
      file: "troquel1.pdf",
      is_active: true,
    },
  });

  const troquel2 = await prisma.troqueles.upsert({
    where: { code: "Troquel 2" },
    update: {},
    create: {
      code: "Troquel 2",
      size: "LARGE",
      file: "troquel2.pdf",
      is_active: true,
    },
  });

  console.log("✅ Troqueles listos");

  // ==================== PROCESSES ====================
  const proceso1 = await prisma.process.upsert({
    where: { name: "Impresión" },
    update: {},
    create: {
      name: "Impresión",
      order: 1,
      use_troquel: false,
      use_measure: true,
      use_inks: true,
      is_finished: false,
      is_active: true,
    },
  });

  const proceso2 = await prisma.process.upsert({
    where: { name: "Troquelado" },
    update: {},
    create: {
      name: "Troquelado",
      order: 2,
      use_troquel: true,
      use_measure: true,
      use_inks: false,
      is_finished: false,
      is_active: true,
    },
  });

  const proceso3 = await prisma.process.upsert({
    where: { name: "Plastificado" },
    update: {},
    create: {
      name: "Plastificado",
      order: 3,
      use_troquel: false,
      use_measure: false,
      use_inks: false,
      is_finished: false,
      is_active: true,
    },
  });

  console.log("✅ Procesos listos");

  // ==================== MACHINERY ====================
  const maquina1 = await prisma.machinery.upsert({
    where: { reference: "HCD-74" },
    update: {},
    create: {
      name: "Heidelberg CD 74",
      reference: "HCD-74",
      type: "IMPRESION",
      is_active: true,
    },
  });

  const maquina2 = await prisma.machinery.upsert({
    where: { reference: "TRQ-AUTO-01" },
    update: {},
    create: {
      name: "Troqueladora Autom.",
      reference: "TRQ-AUTO-01",
      type: "TROQUELADO",
      is_active: true,
    },
  });

  const maquina3 = await prisma.machinery.upsert({
    where: { reference: "PLAST-01" },
    update: {},
    create: {
      name: "Plastificadora",
      reference: "PLAST-01",
      type: "PLASTIFICADO",
      is_active: true,
    },
  });

  console.log("✅ Maquinaria lista");

  // ==================== FORMATS ====================
  await prisma.format.createMany({
    data: [
      { name: "1 Pliego", is_active: true },
      { name: "1/2 Pliego", is_active: true },
      { name: "1/3 Pliego", is_active: true },
      { name: "1/4 Pliego", is_active: true },
      { name: "1/5 Pliego", is_active: true },
      { name: "1/6 Pliego", is_active: true },
      { name: "1/8 Pliego", is_active: true },
      { name: "1/9 Pliego", is_active: true },
      { name: "1/10 Pliego", is_active: true },
      { name: "1/12 Pliego", is_active: true },
      { name: "1/15 Pliego", is_active: true },
      { name: "1/16 Pliego", is_active: true },
      { name: "1/18 Pliego", is_active: true },
      { name: "1/20 Pliego", is_active: true },
      { name: "1/22 Pliego", is_active: true },
      { name: "1/24 Pliego", is_active: true },
      { name: "1/25 Pliego", is_active: true },
      { name: "1/32 Pliego", is_active: true },
      { name: "1/36 Pliego", is_active: true },
      { name: "1/132 Pliego", is_active: true },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Formats listos");

  // ==================== PAPER TYPES ====================
  await prisma.paper_Type.createMany({
    data: [
      {
        name: "Propalcote",
        description: "Papel brillante",
        grammage: 90,
        is_active: true,
      },
      {
        name: "Propalcote",
        description: "Papel brillante",
        grammage: 115,
        is_active: true,
      },
      {
        name: "Propalcote",
        description: "Papel brillante",
        grammage: 150,
        is_active: true,
      },
      {
        name: "Propalcote",
        description: "Papel brillante",
        grammage: 200,
        is_active: true,
      },
      {
        name: "Bond",
        description: "Papel estándar",
        grammage: 75,
        is_active: true,
      },
      {
        name: "Bond",
        description: "Papel estándar",
        grammage: 90,
        is_active: true,
      },
      {
        name: "Opalina",
        description: "Alta blancura",
        grammage: 150,
        is_active: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Paper types listos");

  // ==================== THIRDS ====================
  const third1 = await prisma.thirds.upsert({
    where: { email: "contacto@abc.com" },
    update: {},
    create: {
      name: "Empresa ABC",
      email: "contacto@abc.com",
      address: "Calle 10 #20-30",
      type_person: "CLIENTE",
      company_name: "ABC S.A.S",
      is_active: true,
    },
  });

  const third2 = await prisma.thirds.upsert({
    where: { email: "ventas@xyz.com" },
    update: {},
    create: {
      name: "Distribuidora XYZ",
      email: "ventas@xyz.com",
      address: "Carrera 5 #15-20",
      type_person: "PROVEEDOR",
      company_name: "XYZ Ltda",
      is_active: true,
    },
  });

  const third3 = await prisma.thirds.upsert({
    where: { email: "juan@gmail.com" },
    update: {},
    create: {
      name: "Juan Pérez",
      email: "juan@gmail.com",
      address: "Calle 50 #30-10",
      type_person: "CLIENTE",
      company_name: null,
      is_active: true,
    },
  });

  console.log("✅ Thirds listos");

  // ==================== PRODUCTS ====================
  const product1 = await prisma.product.upsert({
    where: { name: "Volante 1/4" },
    update: {},
    create: { name: "Volante 1/4", is_active: true },
  });

  const product2 = await prisma.product.upsert({
    where: { name: "Afiche Pliego" },
    update: {},
    create: { name: "Afiche Pliego", is_active: true },
  });

  const product3 = await prisma.product.upsert({
    where: { name: "Tarjeta Personal" },
    update: {},
    create: { name: "Tarjeta Personal", is_active: true },
  });

  console.log("✅ Products listos");

  // ==================== PRODUCT CUSTOMER ====================
  const pc1 = await prisma.product_Customer.upsert({
    where: { code: "PC-001" },
    update: {},
    create: {
      code: "PC-001",
      name: "Volante Empresa ABC",
      product_id: product1.id,
      third_id: third1.id,
      is_active: true,
    },
  });

  const pc2 = await prisma.product_Customer.upsert({
    where: { code: "PC-002" },
    update: {},
    create: {
      code: "PC-002",
      name: "Tarjeta Juan Pérez",
      product_id: product3.id,
      third_id: third3.id,
      is_active: true,
    },
  });

  console.log("✅ Product customers listos");

  console.log("🎉 Seed ejecutado correctamente");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
