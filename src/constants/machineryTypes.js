export const MACHINERY_TYPES = [
  "PREPRENSA",
  "GUILLOTINA",
  "IMPRESORA_OFFSET",
  "IMPRESORA_DIGITAL",
  "PLASTIFICADORA",
  "LAMINADORA",
  "BARNIZADORA",
  "ESTAMPADORA",
  "TROQUELADORA",
  "PEGADORA",
  "DOBLADORA",
  "EMPAQUE",
  "OTRA",
];

export const isValidMachineryType = (value) =>
  MACHINERY_TYPES.includes(value);
