export const THIRD_TYPE_VALUES = ["CLIENTE", "PROVEEDOR", "OTROS"];
export const PERSON_TYPE_VALUES = ["NATURAL", "JURIDICA"];
export const DOCUMENT_TYPE_VALUES = ["NIT", "CC", "CE", "PASAPORTE"];

export const isValidThirdType = (value) => THIRD_TYPE_VALUES.includes(value);
export const isValidPersonType = (value) => PERSON_TYPE_VALUES.includes(value);
export const isValidDocumentType = (value) =>
  DOCUMENT_TYPE_VALUES.includes(value);
