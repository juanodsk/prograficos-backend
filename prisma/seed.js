import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // ==================== USERS ====================
  const salt = await bcrypt.genSalt(10);

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

  console.log("✅ Users creados");

  // ==================== PROCESSES ====================
  const proceso1 = await prisma.process.create({
    data: {
      name: "Impresión",
      order: "1",
      use_troquel: false,
      use_measure: true,
      use_inks: true,
      is_finished: false,
    },
  });

  const proceso2 = await prisma.process.create({
    data: {
      name: "Troquelado",
      order: "2",
      use_troquel: true,
      use_measure: true,
      use_inks: false,
      is_finished: false,
    },
  });

  const proceso3 = await prisma.process.create({
    data: {
      name: "Plastificado",
      order: "3",
      use_troquel: false,
      use_measure: false,
      use_inks: false,
      is_finished: false,
    },
  });

  console.log("✅ Processes creados");

  // ==================== MACHINERY ====================
  const maquina1 = await prisma.machinery.create({
    data: {
      name: "Heidelberg CD 74",
      reference: "HCD-74",
      type: true,
      is_active: true,
    },
  });

  const maquina2 = await prisma.machinery.create({
    data: {
      name: "Troqueladora Autom.",
      reference: "TRQ-AUTO-01",
      type: false,
      is_active: true,
    },
  });

  const maquina3 = await prisma.machinery.create({
    data: {
      name: "Plastificadora",
      reference: "PLAST-01",
      type: false,
      is_active: true,
    },
  });

  console.log("✅ Machinery creada");

  // ==================== FORMATS ====================
  const formatData = [
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
  ];

  for (const format of formatData) {
    await prisma.format.create({ data: format });
  }

  console.log("✅ Formats creados");

  // ==================== MEASURES ====================
  await prisma.measure.createMany({
    data: [
      { width: 100, height: 70, format_id: 1 },
      { width: 70, height: 50, format_id: 2 },
      { width: 65, height: 35, format_id: 3 },
      { width: 70, height: 33, format_id: 3 },
      { width: 50, height: 35, format_id: 4 },
      { width: 70, height: 25, format_id: 4 },
      { width: 43, height: 27, format_id: 5 },
      { width: 42, height: 28, format_id: 5 },
      { width: 40, height: 30, format_id: 5 },
      { width: 50, height: 23, format_id: 6 },
      { width: 35, height: 33, format_id: 6 },
      { width: 35, height: 25, format_id: 7 },
      { width: 33, height: 23, format_id: 8 },
      { width: 28, height: 22, format_id: 9 },
      { width: 33, height: 17.5, format_id: 10 },
      { width: 25, height: 23, format_id: 10 },
      { width: 23, height: 20, format_id: 11 },
      { width: 25, height: 17.5, format_id: 12 },
      { width: 23, height: 16.5, format_id: 13 },
      { width: 20, height: 17.5, format_id: 14 },
      { width: 22, height: 14, format_id: 15 },
      { width: 17.5, height: 16.5, format_id: 16 },
      { width: 20, height: 14, format_id: 17 },
      { width: 17.5, height: 12.5, format_id: 18 },
      { width: 16.5, height: 11.5, format_id: 19 },
      { width: 9, height: 5.5, format_id: 20 },
    ],
  });

  console.log("✅ Measures creadas");

  // ==================== PAPER TYPES ====================
  await prisma.paper_Type.createMany({
    data: [
      {
        name: "Propalcote",
        description: "Papel brillante alta calidad",
        grammage: 90,
        is_active: true,
      },
      {
        name: "Propalcote",
        description: "Papel brillante alta calidad",
        grammage: 115,
        is_active: true,
      },
      {
        name: "Propalcote",
        description: "Papel brillante alta calidad",
        grammage: 150,
        is_active: true,
      },
      {
        name: "Propalcote",
        description: "Papel brillante alta calidad",
        grammage: 200,
        is_active: true,
      },
      {
        name: "Bond",
        description: "Papel estándar uso general",
        grammage: 75,
        is_active: true,
      },
      {
        name: "Bond",
        description: "Papel estándar uso general",
        grammage: 90,
        is_active: true,
      },
      {
        name: "Opalina",
        description: "Alta blancura acabado suave",
        grammage: 150,
        is_active: true,
      },
    ],
  });

  console.log("✅ Paper Types creados");

  // ==================== THIRDS ====================
  const third1 = await prisma.thirds.create({
    data: {
      name: "Empresa ABC",
      email: "contacto@abc.com",
      address: "Calle 10 # 20-30",
      type_person: "CLIENTE",
      company_name: "ABC S.A.S",
    },
  });

  const third2 = await prisma.thirds.create({
    data: {
      name: "Distribuidora XYZ",
      email: "ventas@xyz.com",
      address: "Carrera 5 # 15-20",
      type_person: "PROVEEDOR",
      company_name: "XYZ Ltda",
    },
  });

  const third3 = await prisma.thirds.create({
    data: {
      name: "Juan Pérez",
      email: "juan@gmail.com",
      address: "Calle 50 # 30-10",
      type_person: "CLIENTE",
      company_name: null,
    },
  });

  console.log("✅ Thirds creados");

  // ==================== PRODUCTS ====================
  const product1 = await prisma.product.create({
    data: { name: "Volante 1/4", active: true },
  });

  const product2 = await prisma.product.create({
    data: { name: "Afiche Pliego", active: true },
  });

  const product3 = await prisma.product.create({
    data: { name: "Tarjeta Personal", active: true },
  });

  console.log("✅ Products creados");

  // ==================== PRODUCT CUSTOMER ====================
  const pc1 = await prisma.product_Customer.create({
    data: {
      code: "PC-001",
      name: "Volante Empresa ABC",
      product_id: product1.id,
      third_id: third1.id,
    },
  });

  const pc2 = await prisma.product_Customer.create({
    data: {
      code: "PC-002",
      name: "Tarjeta Juan Pérez",
      product_id: product3.id,
      third_id: third3.id,
    },
  });

  console.log("✅ Product Customers creados");

  // ==================== HEADER PRODUCTION ORDER ====================
  const header1 = await prisma.header_Production_Order.create({
    data: {
      date_delivery_estimated: new Date("2025-03-01"),
      order_status: "PENDIENTE",
      amount_sheets: 1000,
      total_estimated: 500,
      measure_id: 1, // 100x70 - 1 Pliego
      paper_type_id: 1, // Propalcote 90gr
      troquel_id: troquel1.id,
      product_customer_id: pc1.id,
      user_id: admin.id,
    },
  });

  const header2 = await prisma.header_Production_Order.create({
    data: {
      date_delivery_estimated: new Date("2025-03-15"),
      order_status: "EN_PROCESO",
      amount_sheets: 2000,
      total_estimated: 1800,
      total_delivered: 500,
      measure_id: 5, // 50x35 - 1/4 Pliego
      paper_type_id: 3, // Propalcote 150gr
      troquel_id: troquel2.id,
      product_customer_id: pc2.id,
      user_id: supervisor.id,
    },
  });

  console.log("✅ Headers creados");

  // ==================== DETAIL PRODUCTION ORDER ====================
  await prisma.detail_Production_Order.create({
    data: {
      start_date: new Date("2025-02-01"),
      start_hour: new Date("2025-02-01T08:00:00"),
      quantity_delivered: 1000,
      quantity_damaged: 10,
      observations: "Sin novedades",
      header_order_id: header1.id,
      process_id: proceso1.id, // Impresión
      user_id: operario.id,
      machinery_id: maquina1.id, // Heidelberg
      measure_cutting_id: 1, // 100x70
    },
  });

  await prisma.detail_Production_Order.create({
    data: {
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
      process_id: proceso2.id, // Troquelado
      user_id: operario.id,
      machinery_id: maquina2.id, // Troqueladora
      measure_cutting_id: 5, // 50x35
    },
  });

  console.log("✅ Details creados");
  console.log("🎉 Seed completado exitosamente");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
