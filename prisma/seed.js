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
  await prisma.process_Field_Definition.deleteMany({
    where: { process_id: process.id },
  });

  for (const [index, field] of fields.entries()) {
    await prisma.process_Field_Definition.create({
      data: {
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

async function main() {
  console.log("🌱 Iniciando seed...");

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
