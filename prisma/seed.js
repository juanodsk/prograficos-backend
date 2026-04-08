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

  const blueprintKeys = fields.map((field) => field.key);
  const legacyDefinitions = await prisma.process_Field_Definition.findMany({
    where: {
      process_id: process.id,
      key: {
        notIn: blueprintKeys,
      },
    },
    select: { key: true },
  });

  if (legacyDefinitions.length > 0) {
    console.log(
      `ℹ️ Proceso "${process.name}" conserva campos legacy: ${legacyDefinitions
        .map((field) => field.key)
        .join(", ")}`,
    );
  }
}

const BULK_PRODUCT_CUSTOMER_PREFIX = "SEED-ORD-";

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

const resolveOrderStatus = (index) => {
  if (index % 10 === 0) return "ENTREGADO";
  if (index % 4 === 0) return "TERMINADO";
  if (index % 3 === 0) return "EN_PROCESO";
  return "PENDIENTE";
};

const buildDetailState = ({
  processIndex,
  selectedProcesses,
  orderStatus,
  amountSheets,
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
  const startedAt = createDateOffset(now, -randomInt(1, 15));
  const finishedAt = createDateOffset(startedAt, randomInt(0, 2));

  if (orderStatus === "EN_PROCESO") {
    if (processIndex < selectedProcesses.length - 1) {
      return {
        ...defaultDetail,
        process_state: "TERMINADO",
        quantity_delivered: Math.max(0, amountSheets - randomInt(0, 25)),
        quantity_damaged: randomInt(0, 15),
        start_date: startedAt,
        end_date: finishedAt,
        start_hour: startedAt,
        end_hour: finishedAt,
      };
    }

    return {
      ...defaultDetail,
      process_state: "EN_PROCESO",
      quantity_delivered: Math.max(0, amountSheets - randomInt(10, 60)),
      quantity_damaged: randomInt(0, 10),
      start_date: startedAt,
      start_hour: startedAt,
    };
  }

  return {
    ...defaultDetail,
    process_state: "TERMINADO",
    quantity_delivered: Math.max(0, amountSheets - randomInt(0, 35)),
    quantity_damaged: randomInt(0, 20),
    start_date: startedAt,
    end_date: finishedAt,
    start_hour: startedAt,
    end_hour: finishedAt,
  };
};

const getMachineryForProcess = (processCategory, machineryByType) => {
  const categoryMap = {
    CORTE: ["GUILLOTINA"],
    IMPRESION: ["IMPRESORA_OFFSET", "IMPRESORA_DIGITAL"],
    ACABADO: ["PLASTIFICADORA", "ESTAMPADORA", "LAMINADORA", "BARNIZADORA"],
    TROQUELADO: ["TROQUELADORA"],
    PEGADO: ["PEGADORA"],
  };

  const candidates = (categoryMap[processCategory] || [])
    .flatMap((type) => machineryByType.get(type) || [])
    .filter(Boolean);

  return candidates.length ? pickRandom(candidates) : null;
};

async function ensureBulkOrderCatalog() {
  const clientSpecs = Array.from({ length: 12 }, (_, index) => ({
    email: `seed.bulk.client${index + 1}@prograficos.test`,
    name: `Cliente Demo ${index + 1}`,
    address: `Zona industrial ${index + 1}`,
    type_person: "CLIENTE",
    person_type: "JURIDICA",
    document_type: "NIT",
    document_number: `990000${String(index + 1).padStart(4, "0")}`,
    company_name: `Cliente Demo ${index + 1} SAS`,
    is_active: true,
  }));

  const productSpecs = Array.from({ length: 8 }, (_, index) => ({
    name: `Producto Demo ${index + 1}`,
    is_active: true,
  }));

  const clients = [];

  for (const clientSpec of clientSpecs) {
    const client = await prisma.thirds.upsert({
      where: { email: clientSpec.email },
      update: {
        name: clientSpec.name,
        address: clientSpec.address,
        type_person: clientSpec.type_person,
        person_type: clientSpec.person_type,
        document_type: clientSpec.document_type,
        document_number: clientSpec.document_number,
        company_name: clientSpec.company_name,
        is_active: true,
      },
      create: clientSpec,
    });

    clients.push(client);
  }

  const products = [];

  for (const productSpec of productSpecs) {
    const product = await prisma.product.upsert({
      where: { name: productSpec.name },
      update: { is_active: true },
      create: productSpec,
    });

    products.push(product);
  }

  const productCustomers = [];
  let codeCounter = 1;

  for (const client of clients) {
    for (const product of products.slice(0, 3)) {
      const code = `${BULK_PRODUCT_CUSTOMER_PREFIX}${String(codeCounter).padStart(3, "0")}`;
      const productCustomer = await prisma.product_Customer.upsert({
        where: { code },
        update: {
          name: `${product.name} - ${client.name}`,
          product_id: product.id,
          third_id: client.id,
          is_active: true,
        },
        create: {
          code,
          name: `${product.name} - ${client.name}`,
          product_id: product.id,
          third_id: client.id,
          is_active: true,
        },
      });

      productCustomers.push(productCustomer);
      codeCounter += 1;
    }
  }

  return productCustomers;
}

async function seedBulkOrders(bulkOrdersCount) {
  if (!bulkOrdersCount) {
    return;
  }

  console.log(`📦 Preparando carga de prueba de ${bulkOrdersCount} órdenes...`);

  const productCustomers = await ensureBulkOrderCatalog();

  const [
    users,
    measures,
    paperTypes,
    troqueles,
    processes,
    machinery,
    existingBulkOrders,
  ] = await Promise.all([
    prisma.user.findMany({
      where: { is_active: true },
      select: { id: true },
      orderBy: { id: "asc" },
    }),
    prisma.measure.findMany({
      where: { is_active: true },
      select: { id: true },
      orderBy: { id: "asc" },
    }),
    prisma.paper_Type.findMany({
      where: { is_active: true },
      select: { id: true },
      orderBy: { id: "asc" },
    }),
    prisma.troqueles.findMany({
      where: { is_active: true },
      select: { id: true },
      orderBy: { id: "asc" },
    }),
    prisma.process.findMany({
      where: { is_active: true },
      select: { id: true, order: true, category: true },
      orderBy: { order: "asc" },
    }),
    prisma.machinery.findMany({
      where: { is_active: true },
      select: { id: true, type: true },
      orderBy: { id: "asc" },
    }),
    prisma.header_Production_Order.count({
      where: {
        product_customer: {
          is: {
            code: {
              startsWith: BULK_PRODUCT_CUSTOMER_PREFIX,
            },
          },
        },
      },
    }),
  ]);

  if (
    !users.length ||
    !measures.length ||
    !paperTypes.length ||
    !troqueles.length ||
    !processes.length ||
    !productCustomers.length
  ) {
    throw new Error(
      "No hay catálogo suficiente para crear órdenes masivas de prueba",
    );
  }

  const ordersToCreate = Math.max(0, bulkOrdersCount - existingBulkOrders);

  if (!ordersToCreate) {
    console.log(
      `ℹ️ Ya existen ${existingBulkOrders} órdenes de prueba; no se crearán más.`,
    );
    return;
  }

  const machineryByType = machinery.reduce((map, item) => {
    const current = map.get(item.type) || [];
    current.push(item.id);
    map.set(item.type, current);
    return map;
  }, new Map());

  for (let index = 0; index < ordersToCreate; index += 1) {
    const absoluteIndex = existingBulkOrders + index + 1;
    const orderStatus = resolveOrderStatus(absoluteIndex);
    const amountSheets = randomInt(300, 5000);
    const totalEstimated = amountSheets * randomInt(8, 30);
    const createdAt = createDateOffset(new Date(), -randomInt(1, 180));
    const selectedProcessCount = randomInt(2, processes.length);
    const selectedProcesses = processes.slice(0, selectedProcessCount);
    const detailRecords = selectedProcesses.map((process, processIndex) => {
      const detailState = buildDetailState({
        processIndex,
        selectedProcesses,
        orderStatus,
        amountSheets,
      });

      return {
        process_id: process.id,
        measure_cutting_id: pickRandom(measures).id,
        machinery_id: getMachineryForProcess(process.category, machineryByType),
        user_id: detailState.process_state === "PENDIENTE" ? null : pickRandom(users).id,
        observations: `[SEED_LOAD_TEST] Orden ${absoluteIndex} · ${process.category}`,
        ...detailState,
      };
    });

    const totalDelivered =
      orderStatus === "TERMINADO" || orderStatus === "ENTREGADO"
        ? Math.max(0, totalEstimated - randomInt(0, 120))
        : null;

    const totalDamaged =
      orderStatus === "TERMINADO" || orderStatus === "ENTREGADO"
        ? randomInt(0, 60)
        : null;

    await prisma.header_Production_Order.create({
      data: {
        date: createdAt,
        date_delivery_estimated: createDateOffset(createdAt, randomInt(2, 20)),
        order_status: orderStatus,
        amount_sheets: amountSheets,
        total_estimated: totalEstimated,
        total_delivered: totalDelivered,
        total_damaged: totalDamaged,
        measure_id: pickRandom(measures).id,
        paper_type_id: pickRandom(paperTypes).id,
        troquel_id: pickRandom(troqueles).id,
        product_customer_id: pickRandom(productCustomers).id,
        user_id: pickRandom(users).id,
        detail_production_orders: {
          create: detailRecords,
        },
      },
    });

    if ((index + 1) % 50 === 0 || index === ordersToCreate - 1) {
      console.log(
        `🧱 Órdenes de prueba creadas: ${index + 1}/${ordersToCreate}`,
      );
    }
  }

  console.log(
    `✅ Carga de prueba lista. Total de órdenes seed detectadas: ${existingBulkOrders + ordersToCreate}`,
  );
}

async function main() {
  console.log("🌱 Iniciando seed...");
  const bulkOrdersCount = parseBulkOrdersCount();

  const salt = await bcrypt.genSalt(10);

  await prisma.user.upsert({
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

  await prisma.user.upsert({
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

  await prisma.user.upsert({
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

  await prisma.troqueles.upsert({
    where: { code: "BOX01" },
    update: {},
    create: {
      code: "BOX01",
      size: "MEDIUM",
      file: "box01.pdf",
      is_active: true,
    },
  });

  await prisma.troqueles.upsert({
    where: { code: "M14" },
    update: {},
    create: {
      code: "M14",
      size: "LARGE",
      file: "m14.pdf",
      is_active: true,
    },
  });

  console.log("✅ Troqueles listos");

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

  console.log("✅ Procesos y campos configurables listos");

  await prisma.machinery.upsert({
    where: { reference: "GUI-01" },
    update: {
      type: "GUILLOTINA",
      is_active: true,
    },
    create: {
      name: "Guillotina Polar",
      reference: "GUI-01",
      type: "GUILLOTINA",
      is_active: true,
    },
  });

  await prisma.machinery.upsert({
    where: { reference: "HEI-74" },
    update: {
      type: "IMPRESORA_OFFSET",
      is_active: true,
    },
    create: {
      name: "Heidelberg 74",
      reference: "HEI-74",
      type: "IMPRESORA_OFFSET",
      is_active: true,
    },
  });

  await prisma.machinery.upsert({
    where: { reference: "PLA-01" },
    update: {
      type: "PLASTIFICADORA",
      is_active: true,
    },
    create: {
      name: "Plastificadora Termica",
      reference: "PLA-01",
      type: "PLASTIFICADORA",
      is_active: true,
    },
  });

  await prisma.machinery.upsert({
    where: { reference: "TRQ-01" },
    update: {
      type: "TROQUELADORA",
      is_active: true,
    },
    create: {
      name: "Troqueladora Automatica",
      reference: "TRQ-01",
      type: "TROQUELADORA",
      is_active: true,
    },
  });

  await prisma.machinery.upsert({
    where: { reference: "DIG-01" },
    update: {
      type: "IMPRESORA_DIGITAL",
      is_active: true,
    },
    create: {
      name: "Konica Minolta C4080",
      reference: "DIG-01",
      type: "IMPRESORA_DIGITAL",
      is_active: true,
    },
  });

  console.log("✅ Maquinaria lista");

  await prisma.format.createMany({
    data: [
      { name: "1 Pliego", is_active: true },
      { name: "1/2 Pliego", is_active: true },
      { name: "1/4 Pliego", is_active: true },
      { name: "1/8 Pliego", is_active: true },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Formatos listos");

  const pliego = await prisma.format.findUnique({
    where: { name: "1 Pliego" },
  });

  if (pliego) {
    const defaultMeasures = [
      { width: 70, height: 100, format_id: pliego.id, is_active: true },
      { width: 50, height: 35, format_id: pliego.id, is_active: true },
      { width: 35, height: 25, format_id: pliego.id, is_active: true },
    ];

    for (const measure of defaultMeasures) {
      const existingMeasure = await prisma.measure.findFirst({
        where: {
          width: measure.width,
          height: measure.height,
          format_id: measure.format_id,
        },
      });

      if (!existingMeasure) {
        await prisma.measure.create({ data: measure });
      }
    }
  }

  console.log("✅ Medidas listas");

  const defaultPaperTypes = [
    {
      name: "Optimo Kraft",
      description: "Papel kraft para empaque",
      grammage: 200,
      is_active: true,
    },
    {
      name: "Propalcote",
      description: "Papel brillante",
      grammage: 150,
      is_active: true,
    },
    {
      name: "Bond",
      description: "Papel estandar",
      grammage: 90,
      is_active: true,
    },
  ];

  for (const paperType of defaultPaperTypes) {
    const existingPaperType = await prisma.paper_Type.findFirst({
      where: {
        name: paperType.name,
        description: paperType.description,
        grammage: paperType.grammage,
      },
    });

    if (!existingPaperType) {
      await prisma.paper_Type.create({ data: paperType });
    }
  }

  console.log("✅ Tipos de papel listos");

  const cliente = await prisma.thirds.upsert({
    where: { email: "produccion@lagranjaburguer.com" },
    update: {},
    create: {
      name: "La Granja Burguer",
      email: "produccion@lagranjaburguer.com",
      address: "Zona industrial",
      type_person: "CLIENTE",
      person_type: "JURIDICA",
      document_type: "NIT",
      document_number: "900123456",
      company_name: "La Granja Burguer",
      is_active: true,
    },
  });

  await prisma.thirds.upsert({
    where: { email: "compras@proveedorpapel.com" },
    update: {},
    create: {
      name: "Proveedor Papel",
      email: "compras@proveedorpapel.com",
      address: "Parque industrial",
      type_person: "PROVEEDOR",
      person_type: "JURIDICA",
      document_type: "NIT",
      document_number: "901234567",
      company_name: "Proveedor Papel SAS",
      is_active: true,
    },
  });

  await prisma.thirds.upsert({
    where: { email: "ventas@dispapeles.com" },
    update: {},
    create: {
      name: "Dispapeles",
      email: "ventas@dispapeles.com",
      address: "Zona logistica",
      type_person: "PROVEEDOR",
      person_type: "JURIDICA",
      document_type: "NIT",
      document_number: "902345678",
      company_name: "Dispapeles SAS",
      is_active: true,
    },
  });

  console.log("✅ Terceros listos");

  const productoCaja = await prisma.product.upsert({
    where: { name: "Caja Box" },
    update: {},
    create: { name: "Caja Box", is_active: true },
  });

  await prisma.product.upsert({
    where: { name: "Volante Promocional" },
    update: {},
    create: { name: "Volante Promocional", is_active: true },
  });

  console.log("✅ Productos listos");

  await prisma.product_Customer.upsert({
    where: { code: "BOX01-LGB" },
    update: {},
    create: {
      code: "BOX01-LGB",
      name: "Caja Box La Granja Burguer",
      product_id: productoCaja.id,
      third_id: cliente.id,
      is_active: true,
    },
  });

  const proveedorPapel = await prisma.thirds.findUnique({
    where: { email: "compras@proveedorpapel.com" },
  });
  const dispapeles = await prisma.thirds.findUnique({
    where: { email: "ventas@dispapeles.com" },
  });
  const optimoKraft = await prisma.paper_Type.findFirst({
    where: { name: "Optimo Kraft" },
  });
  const propalcote = await prisma.paper_Type.findFirst({
    where: { name: "Propalcote" },
  });
  const bond = await prisma.paper_Type.findFirst({
    where: { name: "Bond" },
  });

  if (proveedorPapel && optimoKraft) {
    await prisma.paperTypeSupplier.upsert({
      where: {
        paper_type_id_third_id: {
          paper_type_id: optimoKraft.id,
          third_id: proveedorPapel.id,
        },
      },
      update: {
        purchase_price: 5200,
      },
      create: {
        paper_type_id: optimoKraft.id,
        third_id: proveedorPapel.id,
        purchase_price: 5200,
      },
    });
  }

  if (proveedorPapel && propalcote) {
    await prisma.paperTypeSupplier.upsert({
      where: {
        paper_type_id_third_id: {
          paper_type_id: propalcote.id,
          third_id: proveedorPapel.id,
        },
      },
      update: {
        purchase_price: 4600,
      },
      create: {
        paper_type_id: propalcote.id,
        third_id: proveedorPapel.id,
        purchase_price: 4600,
      },
    });
  }

  if (dispapeles && propalcote) {
    await prisma.paperTypeSupplier.upsert({
      where: {
        paper_type_id_third_id: {
          paper_type_id: propalcote.id,
          third_id: dispapeles.id,
        },
      },
      update: {
        purchase_price: 4550,
      },
      create: {
        paper_type_id: propalcote.id,
        third_id: dispapeles.id,
        purchase_price: 4550,
      },
    });
  }

  if (dispapeles && bond) {
    await prisma.paperTypeSupplier.upsert({
      where: {
        paper_type_id_third_id: {
          paper_type_id: bond.id,
          third_id: dispapeles.id,
        },
      },
      update: {
        purchase_price: 2100,
      },
      create: {
        paper_type_id: bond.id,
        third_id: dispapeles.id,
        purchase_price: 2100,
      },
    });
  }

  console.log("✅ Productos por cliente listos");
  await seedBulkOrders(bulkOrdersCount);
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
