const syncDynamicFieldValues = async (
  tx,
  detailId,
  processId,
  fieldValues = [],
) => {
  const definitions = await tx.process_Field_Definition.findMany({
    where: { process_id: processId, deleted_at: null },
  });

  const fieldValuesMap = new Map(
    Array.isArray(fieldValues)
      ? fieldValues
          .filter((fieldValue) => fieldValue?.field_definition_id)
          .map((fieldValue) => [
            Number(fieldValue.field_definition_id),
            fieldValue.value,
          ])
      : [],
  );

  for (const definition of definitions) {
    let value = fieldValuesMap.get(definition.id);

    if (value == null || value === "") continue;

    await tx.detail_Process_Field_Value.upsert({
      where: {
        detail_production_order_id_field_definition_id: {
          detail_production_order_id: detailId,
          field_definition_id: definition.id,
        },
      },
      update: {
        value: String(value),
      },
      create: {
        detail_production_order_id: detailId,
        field_definition_id: definition.id,
        value: String(value),
      },
    });
  }
};

export { syncDynamicFieldValues };
