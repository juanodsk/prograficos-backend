const defaultPageSize = 10;
const defaultMaxPageSize = 50;

export const parsePagination = (
  query = {},
  { fallbackPageSize = defaultPageSize, maxPageSize = defaultMaxPageSize } = {},
) => {
  const requestedPage = Number.parseInt(query?.page, 10);
  const requestedPageSize = Number.parseInt(query?.pageSize, 10);

  return {
    page: Number.isNaN(requestedPage) || requestedPage < 1 ? 1 : requestedPage,
    pageSize: Number.isNaN(requestedPageSize)
      ? fallbackPageSize
      : Math.min(Math.max(requestedPageSize, 1), maxPageSize),
  };
};

export const buildPaginationMeta = (requestedPage, pageSize, total) => {
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;
  const page = Math.min(requestedPage, totalPages);

  return {
    page,
    pageSize,
    total,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
};

export const buildInsensitiveContains = (value) => ({
  contains: value,
  mode: "insensitive",
});
