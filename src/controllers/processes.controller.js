import { prisma } from "../config/db.js";

const buildFieldDefinitionsData = (fieldDefinitions = []) =>
  fieldDefinitions.map((field, index) => ({
    key: field.key,
    label: field.label,
    field_type: field.field_type,
    is_required: Boolean(field.is_required),
    sort_order: field.sort_order ?? index + 1,
    options: field.options ?? null,
  }));

const createProcess = async (req, res) => {
  try {
    const { name, order, category, field_definitions = [] } = req.body;

    const process = await prisma.process.create({
      data: {
        name,
        order,
        category,
        field_definitions: field_definitions.length
          ? {
              create: buildFieldDefinitionsData(field_definitions),
            }
          : undefined,
      },
      include: {
        field_definitions: {
          orderBy: { sort_order: "asc" },
        },
      },
    });

    res.status(201).json({
      status: "success",
      message: "Proceso creado exitosamente",
      data: process,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al crear Proceso",
    });
  }
};

const getProcesses = async (req, res) => {
  try {
    const processes = await prisma.process.findMany({
      include: {
        field_definitions: {
          orderBy: { sort_order: "asc" },
        },
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });

    res.status(200).json({
      status: "success",
      message: "Procesos obtenidos exitosamente",
      data: processes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener los procesos",
    });
  }
};

const getProcessById = async (req, res) => {
  try {
    const { id } = req.params;
    const process = await prisma.process.findUnique({
      where: {
        id: parseInt(id, 10),
      },
      include: {
        field_definitions: {
          orderBy: { sort_order: "asc" },
        },
      },
    });

    if (!process) {
      return res.status(404).json({
        status: "error",
        message: "Proceso no encontrado",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Proceso obtenido exitosamente",
      data: process,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener el proceso",
    });
  }
};

const updateProcess = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, order, category, field_definitions = [] } = req.body;
    const processId = parseInt(id, 10);

    const process = await prisma.$transaction(async (tx) => {
      await tx.process_Field_Definition.deleteMany({
        where: { process_id: processId },
      });

      return tx.process.update({
        where: {
          id: processId,
        },
        data: {
          name,
          order,
          category,
          field_definitions: field_definitions.length
            ? {
                create: buildFieldDefinitionsData(field_definitions),
              }
            : undefined,
        },
        include: {
          field_definitions: {
            orderBy: { sort_order: "asc" },
          },
        },
      });
    });

    res.status(200).json({
      status: "success",
      message: "Proceso actualizado exitosamente",
      data: process,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al actualizar el proceso",
    });
  }
};

const deleteProcess = async (req, res) => {
  try {
    const { id } = req.params;
    const processId = parseInt(id, 10);

    const detailsCount = await prisma.detail_Production_Order.count({
      where: { process_id: processId },
    });

    if (detailsCount > 0) {
      return res.status(400).json({
        status: "error",
        message: `No se puede eliminar, tiene ${detailsCount} órdenes de producción asociadas`,
      });
    }

    await prisma.process.delete({
      where: {
        id: processId,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Proceso eliminado exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al eliminar el proceso",
    });
  }
};

export {
  createProcess,
  getProcesses,
  getProcessById,
  updateProcess,
  deleteProcess,
};
