import { prisma } from "../config/db.js";
import { buildActiveWhere, normalizeIsActive } from "../utils/active.js";
import { toSnakeCase } from "../utils/string.js";

const buildFieldDefinitionsData = (fieldDefinitions = []) =>
  fieldDefinitions.map((field, index) => ({
    key: field.key,
    label: field.label,
    field_type: field.field_type,
    is_required: Boolean(field.is_required),
    sort_order: field.sort_order ?? index + 1,
    options: field.options ?? null,
  }));

const normalizeFieldDefinitionInput = (field, index) => ({
  id:
    field?.id != null && field.id !== ""
      ? Number(field.id)
      : null,
  label: field?.label?.trim(),
  key: toSnakeCase(field?.key?.trim() || field?.label?.trim() || ""),
  field_type: field?.field_type,
  is_required: Boolean(field?.is_required),
  sort_order: Number(field?.sort_order) || index + 1,
  options: field?.options ?? null,
});

const validateFieldDefinitions = (fieldDefinitions = []) => {
  const seenKeys = new Set();

  for (const field of fieldDefinitions) {
    if (field.id != null && Number.isNaN(field.id)) {
      return "Uno de los campos configurables no tiene un id válido";
    }

    if (!field.label || !field.field_type) {
      return "Todos los campos configurables deben tener nombre y tipo";
    }

    if (!field.key) {
      return "La clave automática de uno de los campos no es válida";
    }

    const normalizedKey = field.key.toLowerCase();

    if (seenKeys.has(normalizedKey)) {
      return "No puedes repetir campos que generen la misma clave automática";
    }

    seenKeys.add(normalizedKey);
  }

  return null;
};

const findFieldDefinitionByKey = async (key, excludeFieldId = null) =>
  prisma.process_Field_Definition.findFirst({
    where: {
      key: {
        equals: key,
        mode: "insensitive",
      },
      ...(excludeFieldId != null ? { id: { not: excludeFieldId } } : {}),
    },
    select: {
      id: true,
      key: true,
      label: true,
      process: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

const validateFieldDefinitionsUniqueness = async (fieldDefinitions = []) => {
  for (const field of fieldDefinitions) {
    const duplicateField = await findFieldDefinitionByKey(field.key, field.id);

    if (duplicateField) {
      return `La clave "${field.key}" ya está siendo utilizada en el proceso "${duplicateField.process?.name || duplicateField.process?.id}"`;
    }
  }

  return null;
};

const validateProcessFieldKey = async (req, res) => {
  try {
    const key = toSnakeCase(req.query?.key?.trim() || "");
    const excludeFieldId =
      req.query?.excludeFieldId != null && req.query.excludeFieldId !== ""
        ? Number(req.query.excludeFieldId)
        : null;

    if (!key) {
      return res.status(400).json({
        status: "error",
        message: "La clave del campo es obligatoria",
      });
    }

    if (excludeFieldId != null && Number.isNaN(excludeFieldId)) {
      return res.status(400).json({
        status: "error",
        message: "El id del campo a excluir no es válido",
      });
    }

    const duplicateField = await findFieldDefinitionByKey(key, excludeFieldId);

    return res.status(200).json({
      status: "success",
      message: duplicateField
        ? `La clave "${key}" ya está siendo utilizada`
        : `La clave "${key}" está disponible`,
      data: {
        available: !duplicateField,
        key,
        duplicate: duplicateField,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "No se pudo validar la clave del campo",
    });
  }
};

const createProcess = async (req, res) => {
  try {
    const { name, order, category, is_active, field_definitions = [] } = req.body;
    const normalizedFieldDefinitions = field_definitions.map(
      normalizeFieldDefinitionInput,
    );
    const fieldDefinitionsError = validateFieldDefinitions(
      normalizedFieldDefinitions,
    );

    if (fieldDefinitionsError) {
      return res.status(400).json({
        status: "error",
        message: fieldDefinitionsError,
      });
    }

    const duplicateFieldError = await validateFieldDefinitionsUniqueness(
      normalizedFieldDefinitions,
    );

    if (duplicateFieldError) {
      return res.status(409).json({
        status: "warning",
        message: duplicateFieldError,
      });
    }

    const process = await prisma.process.create({
      data: {
        name,
        order,
        category,
        is_active: normalizeIsActive(is_active, true),
        field_definitions: normalizedFieldDefinitions.length
          ? {
              create: buildFieldDefinitionsData(normalizedFieldDefinitions),
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
      where: buildActiveWhere(req.query),
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
    const { name, order, category, is_active, field_definitions = [] } = req.body;
    const processId = parseInt(id, 10);
    const normalizedFieldDefinitions = field_definitions.map(
      normalizeFieldDefinitionInput,
    );
    const fieldDefinitionsError = validateFieldDefinitions(
      normalizedFieldDefinitions,
    );

    if (fieldDefinitionsError) {
      return res.status(400).json({
        status: "error",
        message: fieldDefinitionsError,
      });
    }

    const duplicateFieldError = await validateFieldDefinitionsUniqueness(
      normalizedFieldDefinitions,
    );

    if (duplicateFieldError) {
      return res.status(409).json({
        status: "warning",
        message: duplicateFieldError,
      });
    }

    const existingProcess = await prisma.process.findUnique({
      where: { id: processId },
      select: {
        id: true,
        is_active: true,
        field_definitions: {
          include: {
            _count: {
              select: {
                field_values: true,
              },
            },
          },
          orderBy: { sort_order: "asc" },
        },
      },
    });

    if (!existingProcess) {
      return res.status(404).json({
        status: "error",
        message: "Proceso no encontrado",
      });
    }

    const existingDefinitionsById = new Map(
      existingProcess.field_definitions.map((field) => [field.id, field]),
    );
    const existingDefinitionsByKey = new Map(
      existingProcess.field_definitions.map((field) => [field.key, field]),
    );

    const resolvedFieldDefinitions = normalizedFieldDefinitions.map((field) => {
      if (field.id != null) {
        return field;
      }

      const existingField = existingDefinitionsByKey.get(field.key);

      return existingField ? { ...field, id: existingField.id } : field;
    });

    const incomingDefinitionIds = resolvedFieldDefinitions
      .filter((field) => field.id != null)
      .map((field) => field.id);
    const duplicatedIncomingIds = incomingDefinitionIds.filter(
      (fieldId, index) => incomingDefinitionIds.indexOf(fieldId) !== index,
    );

    if (duplicatedIncomingIds.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Hay campos configurables repetidos en la actualización",
      });
    }

    const unknownFieldDefinition = resolvedFieldDefinitions.find(
      (field) => field.id != null && !existingDefinitionsById.has(field.id),
    );

    if (unknownFieldDefinition) {
      return res.status(400).json({
        status: "error",
        message: "Uno de los campos configurables no pertenece a este proceso",
      });
    }

    const removedDefinitions = existingProcess.field_definitions.filter(
      (field) => !incomingDefinitionIds.includes(field.id),
    );
    const blockedDefinitions = removedDefinitions.filter(
      (field) => field._count.field_values > 0,
    );

    if (blockedDefinitions.length > 0) {
      return res.status(400).json({
        status: "error",
        message: `No puedes eliminar campos que ya tienen registros: ${blockedDefinitions
          .map((field) => field.label)
          .join(", ")}`,
      });
    }

    const process = await prisma.$transaction(async (tx) => {
      await tx.process.update({
        where: {
          id: processId,
        },
        data: {
          name,
          order,
          category,
          is_active: normalizeIsActive(is_active, existingProcess.is_active),
        },
      });

      if (removedDefinitions.length > 0) {
        await tx.process_Field_Definition.deleteMany({
          where: {
            id: {
              in: removedDefinitions.map((field) => field.id),
            },
          },
        });
      }

      for (const field of resolvedFieldDefinitions) {
        const fieldData = {
          key: field.key,
          label: field.label,
          field_type: field.field_type,
          is_required: Boolean(field.is_required),
          sort_order: field.sort_order,
          options: field.options ?? null,
        };

        if (field.id != null) {
          await tx.process_Field_Definition.update({
            where: { id: field.id },
            data: fieldData,
          });
          continue;
        }

        await tx.process_Field_Definition.create({
          data: {
            ...fieldData,
            process_id: processId,
          },
        });
      }

      return tx.process.findUnique({
        where: {
          id: processId,
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
    if (error?.status) {
      return res.status(error.status).json({
        status: "error",
        message: error.message,
      });
    }

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

    if (Number.isNaN(processId)) {
      return res.status(400).json({
        status: "error",
        message: "El id del proceso no es válido",
      });
    }

    const existingProcess = await prisma.process.findUnique({
      where: { id: processId },
      select: { id: true },
    });

    if (!existingProcess) {
      return res.status(404).json({
        status: "error",
        message: "Proceso no encontrado",
      });
    }

    await prisma.process.update({
      where: {
        id: processId,
      },
      data: { is_active: false },
    });

    res.status(200).json({
      status: "success",
      message: "Proceso desactivado exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al desactivar el proceso",
    });
  }
};

export {
  createProcess,
  getProcesses,
  getProcessById,
  validateProcessFieldKey,
  updateProcess,
  deleteProcess,
};
