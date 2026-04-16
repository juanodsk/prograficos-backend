import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const processBlueprints = [
  {
    name: "Corte",
    order: 1,
    category: "CORTE",
    fields: [
      {
        key: "tamano_corte",
        label: "Tamano",
        field_type: "TEXT",
        is_required: true,
      },
      {
        key: "tamano_entregado",
        label: "Tamanos entregados",
        field_type: "NUMBER",
        is_required: false,
      },
    ],
  },
  {
    name: "Impresión",
    order: 2,
    category: "IMPRESION",
    fields: [
      {
        key: "numero_tintas",
        label: "No. de tintas",
        field_type: "NUMBER",
        is_required: true,
      },
      {
        key: "color_1",
        label: "Color 1",
        field_type: "TEXT",
        is_required: true,
      },
      {
        key: "color_2",
        label: "Color 2",
        field_type: "TEXT",
        is_required: false,
      },
      {
        key: "policromia",
        label: "Policromia",
        field_type: "BOOLEAN",
        is_required: false,
      },
      {
        key: "retiro",
        label: "Retiro",
        field_type: "BOOLEAN",
        is_required: false,
      },
      {
        key: "unid_impresion",
        label: "Unid. impresion",
        field_type: "NUMBER",
        is_required: false,
      },
    ],
  },
  {
    name: "Plastificado",
    order: 3,
    category: "ACABADO",
    fields: [
      {
        key: "tipo_plastico",
        label: "Tipo plastico",
        field_type: "TEXT",
        is_required: true,
      },
      {
        key: "medida_plastico",
        label: "Medida",
        field_type: "TEXT",
        is_required: false,
      },
      {
        key: "unid_plastificado",
        label: "Unid. plastificado",
        field_type: "NUMBER",
        is_required: false,
      },
    ],
  },
  {
    name: "Troquelado",
    order: 4,
    category: "TROQUELADO",
    fields: [
      {
        key: "codigo_troquel_aplicado",
        label: "Codigo troquel aplicado",
        field_type: "TEXT",
        is_required: false,
      },
      {
        key: "unid_troquelado",
        label: "Unid. troquelado",
        field_type: "NUMBER",
        is_required: false,
      },
    ],
  },
  {
    name: "Acabados Estampado",
    order: 5,
    category: "ACABADO",
    fields: [
      {
        key: "color_estampado",
        label: "Color",
        field_type: "TEXT",
        is_required: true,
      },
      {
        key: "unid_estampado",
        label: "Unid. estampado",
        field_type: "NUMBER",
        is_required: false,
      },
    ],
  },
  {
    name: "Acabado de Pegado",
    order: 6,
    category: "PEGADO",
    fields: [
      {
        key: "tipo_pegue",
        label: "Tipo de pegue",
        field_type: "TEXT",
        is_required: false,
      },
      {
        key: "unid_pegado",
        label: "Unid. pegado",
        field_type: "NUMBER",
        is_required: false,
      },
    ],
  },
];

const userSeeds = [
  {
    name: "Admin",
    surename: "Principal",
    email: "admin@prograficos.com",
    password: "admin123",
    role: "ADMIN",
  },
  {
    name: "Carlos",
    surename: "Supervisor",
    email: "supervisor@prograficos.com",
    password: "super123",
    role: "SUPERVISOR",
  },
  {
    name: "Luis",
    surename: "Operario",
    email: "operario@prograficos.com",
    password: "operario123",
    role: "EMPLOYEE",
  },
];

const machinerySeeds = [
  {
    name: "Guillotina Polar",
    reference: "GUI-01",
    type: "GUILLOTINA",
  },
  {
    name: "Heidelberg 74",
    reference: "HEI-74",
    type: "IMPRESORA_OFFSET",
  },
  {
    name: "Konica Minolta C4080",
    reference: "DIG-01",
    type: "IMPRESORA_DIGITAL",
  },
  {
    name: "Plastificadora Termica",
    reference: "PLA-01",
    type: "PLASTIFICADORA",
  },
  {
    name: "Troqueladora Automatica",
    reference: "TRQ-01",
    type: "TROQUELADORA",
  },
  {
    name: "Pegadora Lineal",
    reference: "PEG-01",
    type: "PEGADORA",
  },
];

const troquelSeeds = [
  {
    code: "BOX01",
    size: "MEDIUM",
    file_name: "box01.pdf",
    file: "troqueles/box01.pdf",
  },
  {
    code: "M14",
    size: "LARGE",
    file_name: "m14.pdf",
    file: "troqueles/m14.pdf",
  },
  {
    code: "TRAY02",
    size: "SMALL",
    file_name: "tray02.pdf",
    file: "troqueles/tray02.pdf",
  },
];

const paperTypeSeeds = [
  {
    name: "Optimo Kraft",
    description: "Papel kraft para empaque",
    grammage: 200,
  },
  {
    name: "Propalcote",
    description: "Papel brillante para cajas plegadizas",
    grammage: 150,
  },
  {
    name: "Bond",
    description: "Papel estandar para material comercial",
    grammage: 90,
  },
];

const thirdSeeds = [
  {
    name: "La Granja Burguer",
    email: "produccion@lagranjaburguer.com",
    address: "Zona industrial",
    type_person: "CLIENTE",
    person_type: "JURIDICA",
    document_type: "NIT",
    document_number: "900123456",
    company_name: "La Granja Burguer",
  },
  {
    name: "Cafe Aroma",
    email: "compras@cafearoma.com",
    address: "Parque comercial",
    type_person: "CLIENTE",
    person_type: "JURIDICA",
    document_type: "NIT",
    document_number: "900223344",
    company_name: "Cafe Aroma SAS",
  },
  {
    name: "Panaderia Del Sol",
    email: "produccion@panaderiadelsol.com",
    address: "Centro logistico",
    type_person: "CLIENTE",
    person_type: "JURIDICA",
    document_type: "NIT",
    document_number: "900998877",
    company_name: "Panaderia Del Sol SAS",
  },
  {
    name: "Proveedor Papel",
    email: "compras@proveedorpapel.com",
    address: "Parque industrial",
    type_person: "PROVEEDOR",
    person_type: "JURIDICA",
    document_type: "NIT",
    document_number: "901234567",
    company_name: "Proveedor Papel SAS",
  },
  {
    name: "Dispapeles",
    email: "ventas@dispapeles.com",
    address: "Zona logistica",
    type_person: "PROVEEDOR",
    person_type: "JURIDICA",
    document_type: "NIT",
    document_number: "902345678",
    company_name: "Dispapeles SAS",
  },
];

const productSeeds = [
  {
    name: "Caja Hamburguesa Clasica",
    troquelCode: "BOX01",
    thirdEmail: "produccion@lagranjaburguer.com",
  },
  {
    name: "Portavaso Cafe Aroma",
    troquelCode: "TRAY02",
    thirdEmail: "compras@cafearoma.com",
  },
  {
    name: "Caja Panaderia Premium",
    troquelCode: "M14",
    thirdEmail: "produccion@panaderiadelsol.com",
  },
];

const paperSupplierSeeds = [
  {
    paperTypeName: "Optimo Kraft",
    supplierEmail: "compras@proveedorpapel.com",
    purchasePrice: "5200",
  },
  {
    paperTypeName: "Propalcote",
    supplierEmail: "compras@proveedorpapel.com",
    purchasePrice: "4600",
  },
  {
    paperTypeName: "Propalcote",
    supplierEmail: "ventas@dispapeles.com",
    purchasePrice: "4550",
  },
  {
    paperTypeName: "Bond",
    supplierEmail: "ventas@dispapeles.com",
    purchasePrice: "2100",
  },
];

const formatCatalog = [
  {
    name: "1 Pliego",
    sheet_divisions: 1,
    measures: [{ width: 100, height: 70 }],
  },
  {
    name: "1/2 Pliego",
    sheet_divisions: 2,
    measures: [{ width: 70, height: 50 }],
  },
  {
    name: "1/3 Pliego",
    sheet_divisions: 3,
    measures: [
      { width: 65, height: 35 },
      { width: 70, height: 33 },
    ],
  },
  {
    name: "1/4 Pliego",
    sheet_divisions: 4,
    measures: [
      { width: 50, height: 35 },
      { width: 70, height: 25 },
    ],
  },
  {
    name: "1/5 Pliego",
    sheet_divisions: 5,
    measures: [
      { width: 43, height: 27 },
      { width: 42, height: 28 },
      { width: 40, height: 30 },
    ],
  },
  {
    name: "1/6 Pliego",
    sheet_divisions: 6,
    measures: [
      { width: 50, height: 23 },
      { width: 35, height: 33 },
    ],
  },
  {
    name: "1/8 Pliego",
    sheet_divisions: 8,
    measures: [{ width: 35, height: 25 }],
  },
  {
    name: "1/9 Pliego",
    sheet_divisions: 9,
    measures: [{ width: 33, height: 23 }],
  },
  {
    name: "1/10 Pliego",
    sheet_divisions: 10,
    measures: [{ width: 28, height: 22 }],
  },
  {
    name: "1/12 Pliego",
    sheet_divisions: 12,
    measures: [
      { width: 33, height: 17.5 },
      { width: 25, height: 23 },
    ],
  },
  {
    name: "1/15 Pliego",
    sheet_divisions: 15,
    measures: [{ width: 23, height: 20 }],
  },
  {
    name: "1/16 Pliego",
    sheet_divisions: 16,
    measures: [{ width: 25, height: 17.5 }],
  },
  {
    name: "1/18 Pliego",
    sheet_divisions: 18,
    measures: [{ width: 23, height: 16.5 }],
  },
  {
    name: "1/20 Pliego",
    sheet_divisions: 20,
    measures: [{ width: 20, height: 17.5 }],
  },
  {
    name: "1/22 Pliego",
    sheet_divisions: 22,
    measures: [{ width: 22, height: 14 }],
  },
  {
    name: "1/24 Pliego",
    sheet_divisions: 24,
    measures: [{ width: 17.5, height: 16.5 }],
  },
  {
    name: "1/25 Pliego",
    sheet_divisions: 25,
    measures: [{ width: 20, height: 14 }],
  },
  {
    name: "1/32 Pliego",
    sheet_divisions: 32,
    measures: [{ width: 17.5, height: 12.5 }],
  },
  {
    name: "1/36 Pliego",
    sheet_divisions: 36,
    measures: [{ width: 16.5, height: 11.5 }],
  },
  {
    name: "1/132 Pliego",
    sheet_divisions: 132,
    measures: [{ width: 9, height: 5.5 }],
  },
];

const demoOrderBlueprints = [
  {
    productName: "Caja Hamburguesa Clasica",
    measureFormatName: "1/4 Pliego",
    measureSize: { width: 50, height: 35 },
    paperTypeName: "Optimo Kraft",
    cavities: 1,
    amount_sheets: 250,
    total_estimated: 1000,
    order_status: "PENDIENTE",
  },
  {
    productName: "Portavaso Cafe Aroma",
    measureFormatName: "1/8 Pliego",
    measureSize: { width: 35, height: 25 },
    paperTypeName: "Propalcote",
    cavities: 2,
    amount_sheets: 120,
    total_estimated: 1920,
    order_status: "EN_PROCESO",
  },
  {
    productName: "Caja Panaderia Premium",
    measureFormatName: "1/6 Pliego",
    measureSize: { width: 50, height: 23 },
    paperTypeName: "Bond",
    cavities: 1,
    amount_sheets: 180,
    total_estimated: 1080,
    order_status: "TERMINADO",
  },
];

const parseBulkOrdersCount = () => {
  const cliArg = process.argv.find((arg) => arg.startsWith("--bulk-orders="));
  const rawValue =
    cliArg?.split("=")[1] ?? process.env.SEED_BULK_ORDERS ?? "0";
  const parsedValue = Number.parseInt(rawValue, 10);

  return Number.isNaN(parsedValue) || parsedValue < 0 ? 0 : parsedValue;
};

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickRandom = (items) => items[randomInt(0, items.length - 1)];

const createDateOffset = (baseDate, daysOffset) => {
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + daysOffset);
  return nextDate;
};

async function syncProcessDefinitions(process, fields) {
  for (const [index, field] of fields.entries()) {
    await prisma.process_Field_Definition.upsert({
      where: {
        process_id_key: {
          process_id: process.id,
          key: field.key,
        },
      },
      update: {
        label: field.label,
        field_type: field.field_type,
        is_required: Boolean(field.is_required),
        sort_order: index + 1,
        options: field.options ?? null,
      },
      create: {
        process_id: process.id,
        key: field.key,
        label: field.label,
        field_type: field.field_type,
        is_required: Boolean(field.is_required),
        sort_order: index + 1,
        options: field.options ?? null,
      },
    });
  }
}

const getMachineryForProcess = (processCategory, machineryByType) => {
  const categoryMap = {
    CORTE: ["GUILLOTINA"],
    IMPRESION: ["IMPRESORA_OFFSET", "IMPRESORA_DIGITAL"],
    ACABADO: ["PLASTIFICADORA"],
    TROQUELADO: ["TROQUELADORA"],
    PEGADO: ["PEGADORA"],
  };

  const candidates = (categoryMap[processCategory] || [])
    .flatMap((type) => machineryByType.get(type) || [])
    .filter(Boolean);

  return candidates.length ? pickRandom(candidates) : null;
};

const buildDetailState = ({
  processIndex,
  selectedProcesses,
  orderStatus,
  totalEstimated,
}) => {
  const defaultDetail = {
    process_state: "PENDIENTE",
    quantity_delivered: 0,
    quantity_damaged: 0,
    start_date: null,
    end_date: null,
    start_hour: null,
    end_hour: null,
  };

  if (orderStatus === "PENDIENTE") {
    return defaultDetail;
  }

  const now = new Date();
  const startedAt = createDateOffset(now, -randomInt(1, 10));
  const finishedAt = createDateOffset(startedAt, randomInt(0, 1));

  if (orderStatus === "EN_PROCESO") {
    if (processIndex < selectedProcesses.length - 1) {
      return {
        ...defaultDetail,
        process_state: "TERMINADO",
        quantity_delivered: Math.max(0, totalEstimated - randomInt(0, 80)),
        quantity_damaged: randomInt(0, 20),
        start_date: startedAt,
        end_date: finishedAt,
        start_hour: startedAt,
        end_hour: finishedAt,
      };
    }

    return {
      ...defaultDetail,
      process_state: "EN_PROCESO",
      quantity_delivered: Math.max(0, totalEstimated - randomInt(30, 120)),
      quantity_damaged: randomInt(0, 10),
      start_date: startedAt,
      start_hour: startedAt,
    };
  }

  return {
    ...defaultDetail,
    process_state: "TERMINADO",
    quantity_delivered: Math.max(0, totalEstimated - randomInt(0, 60)),
    quantity_damaged: randomInt(0, 15),
    start_date: startedAt,
    end_date: finishedAt,
    start_hour: startedAt,
    end_hour: finishedAt,
  };
};

async function seedUsers() {
  const salt = await bcrypt.genSalt(10);

  for (const userSeed of userSeeds) {
    await prisma.user.upsert({
      where: { email: userSeed.email },
      update: {
        name: userSeed.name,
        surename: userSeed.surename,
        role: userSeed.role,
        is_active: true,
      },
      create: {
        ...userSeed,
        password: await bcrypt.hash(userSeed.password, salt),
        is_active: true,
      },
    });
  }
}

async function seedProcesses() {
  for (const blueprint of processBlueprints) {
    const process = await prisma.process.upsert({
      where: { name: blueprint.name },
      update: {
        order: blueprint.order,
        category: blueprint.category,
        is_active: true,
      },
      create: {
        name: blueprint.name,
        order: blueprint.order,
        category: blueprint.category,
        is_active: true,
      },
    });

    await syncProcessDefinitions(process, blueprint.fields);
  }
}

async function seedMachinery() {
  for (const machinerySeed of machinerySeeds) {
    await prisma.machinery.upsert({
      where: { reference: machinerySeed.reference },
      update: {
        name: machinerySeed.name,
        type: machinerySeed.type,
        is_active: true,
      },
      create: {
        ...machinerySeed,
        is_active: true,
      },
    });
  }
}

async function seedTroqueles() {
  for (const troquelSeed of troquelSeeds) {
    await prisma.troqueles.upsert({
      where: { code: troquelSeed.code },
      update: {
        size: troquelSeed.size,
        file_name: troquelSeed.file_name,
        file: troquelSeed.file,
        is_active: true,
      },
      create: {
        ...troquelSeed,
        is_active: true,
      },
    });
  }
}

async function seedFormatsAndMeasures() {
  for (const formatSeed of formatCatalog) {
    const format = await prisma.format.upsert({
      where: { name: formatSeed.name },
      update: {
        sheet_divisions: formatSeed.sheet_divisions,
        is_active: true,
      },
      create: {
        name: formatSeed.name,
        sheet_divisions: formatSeed.sheet_divisions,
        is_active: true,
      },
    });

    for (const measureSeed of formatSeed.measures) {
      const existingMeasure = await prisma.measure.findFirst({
        where: {
          width: measureSeed.width,
          height: measureSeed.height,
          format_id: format.id,
        },
      });

      if (existingMeasure) {
        await prisma.measure.update({
          where: { id: existingMeasure.id },
          data: { is_active: true },
        });
        continue;
      }

      await prisma.measure.create({
        data: {
          width: measureSeed.width,
          height: measureSeed.height,
          format_id: format.id,
          is_active: true,
        },
      });
    }
  }
}

async function seedPaperTypes() {
  for (const paperTypeSeed of paperTypeSeeds) {
    const existingPaperType = await prisma.paper_Type.findFirst({
      where: {
        name: paperTypeSeed.name,
        description: paperTypeSeed.description,
        grammage: paperTypeSeed.grammage,
      },
    });

    if (existingPaperType) {
      await prisma.paper_Type.update({
        where: { id: existingPaperType.id },
        data: { is_active: true },
      });
      continue;
    }

    await prisma.paper_Type.create({
      data: {
        ...paperTypeSeed,
        is_active: true,
      },
    });
  }
}

async function seedThirds() {
  for (const thirdSeed of thirdSeeds) {
    await prisma.thirds.upsert({
      where: { email: thirdSeed.email },
      update: {
        ...thirdSeed,
        is_active: true,
      },
      create: {
        ...thirdSeed,
        is_active: true,
      },
    });
  }
}

async function seedPaperSuppliers() {
  for (const relation of paperSupplierSeeds) {
    const paperType = await prisma.paper_Type.findFirst({
      where: { name: relation.paperTypeName },
    });
    const supplier = await prisma.thirds.findUnique({
      where: { email: relation.supplierEmail },
    });

    if (!paperType || !supplier) continue;

    await prisma.paperTypeSupplier.upsert({
      where: {
        paper_type_id_third_id: {
          paper_type_id: paperType.id,
          third_id: supplier.id,
        },
      },
      update: {
        purchase_price: relation.purchasePrice,
      },
      create: {
        paper_type_id: paperType.id,
        third_id: supplier.id,
        purchase_price: relation.purchasePrice,
      },
    });
  }
}

async function seedProducts() {
  for (const productSeed of productSeeds) {
    const troquel = await prisma.troqueles.findUnique({
      where: { code: productSeed.troquelCode },
    });
    const third = await prisma.thirds.findUnique({
      where: { email: productSeed.thirdEmail },
    });

    if (!troquel || !third) continue;

    await prisma.product.upsert({
      where: {
        troquel_id_third_id: {
          troquel_id: troquel.id,
          third_id: third.id,
        },
      },
      update: {
        name: productSeed.name,
        is_active: true,
      },
      create: {
        name: productSeed.name,
        troquel_id: troquel.id,
        third_id: third.id,
        is_active: true,
      },
    });
  }
}

async function seedDemoOrders() {
  const existingOrders = await prisma.header_Production_Order.count();

  if (existingOrders > 0) {
    console.log("ℹ️ Ya existen órdenes registradas. Se omiten órdenes demo.");
    return;
  }

  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@prograficos.com" },
  });
  const processes = await prisma.process.findMany({
    where: { is_active: true },
    orderBy: { order: "asc" },
  });
  const machinery = await prisma.machinery.findMany({
    where: { is_active: true },
    select: { id: true, type: true },
  });
  const machineryByType = machinery.reduce((map, item) => {
    const current = map.get(item.type) || [];
    current.push(item.id);
    map.set(item.type, current);
    return map;
  }, new Map());

  for (const blueprint of demoOrderBlueprints) {
    const product = await prisma.product.findFirst({
      where: { name: blueprint.productName, is_active: true },
      include: { troquel: true },
    });
    const measure = await prisma.measure.findFirst({
      where: {
        width: blueprint.measureSize.width,
        height: blueprint.measureSize.height,
        format: {
          is: {
            name: blueprint.measureFormatName,
          },
        },
        is_active: true,
      },
      include: { format: true },
    });
    const paperType = await prisma.paper_Type.findFirst({
      where: { name: blueprint.paperTypeName, is_active: true },
    });

    if (!product || !measure || !paperType || !adminUser) continue;

    const selectedProcesses = processes.slice(
      0,
      blueprint.order_status === "PENDIENTE" ? 3 : processes.length,
    );

    const detailRecords = selectedProcesses.map((process, processIndex) => {
      const detailState = buildDetailState({
        processIndex,
        selectedProcesses,
        orderStatus: blueprint.order_status,
        totalEstimated: blueprint.total_estimated,
      });

      return {
        process_id: process.id,
        measure_cutting_id: measure.id,
        machinery_id: getMachineryForProcess(process.category, machineryByType),
        user_id:
          detailState.process_state === "PENDIENTE" ? null : adminUser.id,
        observations: `Orden demo seed · ${process.name}`,
        ...detailState,
      };
    });

    await prisma.header_Production_Order.create({
      data: {
        date: createDateOffset(new Date(), -randomInt(2, 20)),
        order_status: blueprint.order_status,
        amount_sheets: blueprint.amount_sheets,
        cavities: blueprint.cavities,
        total_estimated: blueprint.total_estimated,
        total_delivered:
          blueprint.order_status === "TERMINADO"
            ? blueprint.total_estimated - 12
            : null,
        total_damaged: blueprint.order_status === "TERMINADO" ? 12 : null,
        measure_id: measure.id,
        paper_type_id: paperType.id,
        troquel_id: product.troquel_id,
        product_id: product.id,
        user_id: adminUser.id,
        detail_production_orders: {
          create: detailRecords,
        },
      },
    });
  }
}

async function seedBulkOrders(bulkOrdersCount) {
  if (!bulkOrdersCount) return;

  console.log(`📦 Preparando ${bulkOrdersCount} órdenes masivas de prueba...`);

  const [users, measures, paperTypes, products, processes, machinery] =
    await Promise.all([
      prisma.user.findMany({
        where: { is_active: true },
        select: { id: true },
      }),
      prisma.measure.findMany({
        where: { is_active: true },
        include: { format: true },
      }),
      prisma.paper_Type.findMany({
        where: { is_active: true },
        select: { id: true },
      }),
      prisma.product.findMany({
        where: { is_active: true },
        select: { id: true, troquel_id: true },
      }),
      prisma.process.findMany({
        where: { is_active: true },
        select: { id: true, order: true, category: true },
        orderBy: { order: "asc" },
      }),
      prisma.machinery.findMany({
        where: { is_active: true },
        select: { id: true, type: true },
      }),
    ]);

  if (
    !users.length ||
    !measures.length ||
    !paperTypes.length ||
    !products.length ||
    !processes.length
  ) {
    throw new Error(
      "No hay catálogo suficiente para crear órdenes masivas de prueba",
    );
  }

  const machineryByType = machinery.reduce((map, item) => {
    const current = map.get(item.type) || [];
    current.push(item.id);
    map.set(item.type, current);
    return map;
  }, new Map());

  for (let index = 0; index < bulkOrdersCount; index += 1) {
    const product = pickRandom(products);
    const measure = pickRandom(measures);
    const user = pickRandom(users);
    const paperType = pickRandom(paperTypes);
    const cavities = randomInt(1, 4);
    const unitsPerSheet =
      Math.max(1, Number(measure.format?.sheet_divisions || 1)) * cavities;
    const amountSheets = randomInt(80, 800);
    const totalEstimated = amountSheets * unitsPerSheet;
    const orderStatus = pickRandom(["PENDIENTE", "EN_PROCESO", "TERMINADO"]);
    const selectedProcesses = processes.slice(0, randomInt(2, processes.length));

    const detailRecords = selectedProcesses.map((process, processIndex) => {
      const detailState = buildDetailState({
        processIndex,
        selectedProcesses,
        orderStatus,
        totalEstimated,
      });

      return {
        process_id: process.id,
        measure_cutting_id: measure.id,
        machinery_id: getMachineryForProcess(process.category, machineryByType),
        user_id: detailState.process_state === "PENDIENTE" ? null : user.id,
        observations: `Carga masiva seed #${index + 1} · ${process.name}`,
        ...detailState,
      };
    });

    await prisma.header_Production_Order.create({
      data: {
        date: createDateOffset(new Date(), -randomInt(1, 120)),
        order_status: orderStatus,
        amount_sheets: amountSheets,
        cavities,
        total_estimated: totalEstimated,
        total_delivered:
          orderStatus === "TERMINADO"
            ? Math.max(0, totalEstimated - randomInt(0, 80))
            : null,
        total_damaged: orderStatus === "TERMINADO" ? randomInt(0, 25) : null,
        measure_id: measure.id,
        paper_type_id: paperType.id,
        troquel_id: product.troquel_id,
        product_id: product.id,
        user_id: user.id,
        detail_production_orders: {
          create: detailRecords,
        },
      },
    });

    if ((index + 1) % 50 === 0 || index === bulkOrdersCount - 1) {
      console.log(`🧱 Órdenes masivas creadas: ${index + 1}/${bulkOrdersCount}`);
    }
  }
}

async function main() {
  console.log("🌱 Iniciando seed...");
  const bulkOrdersCount = parseBulkOrdersCount();

  await seedUsers();
  console.log("✅ Usuarios listos");

  await seedProcesses();
  console.log("✅ Procesos y campos listos");

  await seedMachinery();
  console.log("✅ Maquinaria lista");

  await seedTroqueles();
  console.log("✅ Troqueles listos");

  await seedFormatsAndMeasures();
  console.log("✅ Formatos y medidas listos");

  await seedPaperTypes();
  console.log("✅ Tipos de papel listos");

  await seedThirds();
  console.log("✅ Terceros listos");

  await seedPaperSuppliers();
  console.log("✅ Relación de proveedores y papeles lista");

  await seedProducts();
  console.log("✅ Productos listos");

  await seedDemoOrders();
  console.log("✅ Órdenes demo listas");

  await seedBulkOrders(bulkOrdersCount);

  console.log("🎉 Seed ejecutado correctamente");
}

main()
  .catch((error) => {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
