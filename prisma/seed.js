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
    },
  });

  const troquel2 = await prisma.troqueles.upsert({
    where: { code: "Troquel 2" },
    update: {},
    create: {
      code: "Troquel 2",
      size: "LARGE",
      file: "troquel2.pdf",
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
      { name: "1 Pliego" },
      { name: "1/2 Pliego" },
      { name: "1/3 Pliego" },
      { name: "1/4 Pliego" },
      { name: "1/5 Pliego" },
      { name: "1/6 Pliego" },
      { name: "1/8 Pliego" },
      { name: "1/9 Pliego" },
      { name: "1/10 Pliego" },
      { name: "1/12 Pliego" },
      { name: "1/15 Pliego" },
      { name: "1/16 Pliego" },
      { name: "1/18 Pliego" },
      { name: "1/20 Pliego" },
      { name: "1/22 Pliego" },
      { name: "1/24 Pliego" },
      { name: "1/25 Pliego" },
      { name: "1/32 Pliego" },
      { name: "1/36 Pliego" },
      { name: "1/132 Pliego" },
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
    },
  });

  console.log("✅ Thirds listos");

  // ==================== PRODUCTS ====================
  const product1 = await prisma.product.upsert({
    where: { name: "Volante 1/4" },
    update: {},
    create: { name: "Volante 1/4", active: true },
  });

  const product2 = await prisma.product.upsert({
    where: { name: "Afiche Pliego" },
    update: {},
    create: { name: "Afiche Pliego", active: true },
  });

  const product3 = await prisma.product.upsert({
    where: { name: "Tarjeta Personal" },
    update: {},
    create: { name: "Tarjeta Personal", active: true },
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
    },
  });

  console.log("✅ Product customers listos");

  // ==================== HEADER PRODUCTION ORDER ====================
  const header1 = await prisma.header_Production_Order.upsert({
    where: { id: 1 },
    update: {},
    create: {
      date_delivery_estimated: new Date("2025-03-01"),
      order_status: "PENDIENTE",
      amount_sheets: 1000,
      total_estimated: 500,
      measure_id: 1,
      paper_type_id: 1,
      troquel_id: troquel1.id,
      product_customer_id: pc1.id,
      user_id: admin.id,
    },
  });

  const header2 = await prisma.header_Production_Order.upsert({
    where: { id: 2 },
    update: {},
    create: {
      date_delivery_estimated: new Date("2025-03-15"),
      order_status: "EN_PROCESO",
      amount_sheets: 2000,
      total_estimated: 1800,
      total_delivered: 500,
      measure_id: 5,
      paper_type_id: 3,
      troquel_id: troquel2.id,
      product_customer_id: pc2.id,
      user_id: supervisor.id,
    },
  });

  console.log("✅ Headers listos");

  // ==================== DETAIL PRODUCTION ORDER ====================
  await prisma.detail_Production_Order.createMany({
    data: [
      {
        start_date: new Date("2025-02-01"),
        start_hour: new Date("2025-02-01T08:00:00"),
        quantity_delivered: 1000,
        quantity_damaged: 10,
        observations: "Sin novedades",
        header_order_id: header1.id,
        process_id: proceso1.id,
        user_id: operario.id,
        machinery_id: maquina1.id,
        measure_cutting_id: 1,
      },
      {
        start_date: new Date("2025-02-10"),
        start_hour: new Date("2025-02-10T08:00:00"),
        end_date: new Date("2025-02-10"),
        end_hour: new Date("2025-02-10T17:00:00"),
        quantity_delivered: 500,
        quantity_damaged: 5,
        plastic_type: "Mate",
        plastic_measure: "100x70",
        stamping_color: "Dorado",
        observations: "Plastificado mate con troquel",
        header_order_id: header2.id,
        process_id: proceso2.id,
        user_id: operario.id,
        machinery_id: maquina2.id,
        measure_cutting_id: 5,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Details listos");

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
