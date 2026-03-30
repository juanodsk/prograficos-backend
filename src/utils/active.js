export const isTruthyValue = (value) =>
  value === true ||
  value === "true" ||
  value === 1 ||
  value === "1";

export const normalizeIsActive = (value, fallback = true) =>
  value == null ? fallback : isTruthyValue(value);

export const buildActiveWhere = (query = {}, extraWhere = {}) => {
  const where = { ...extraWhere };

  if (isTruthyValue(query.onlyActive)) {
    where.is_active = true;
  }

  return where;
};
