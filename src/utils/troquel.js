const troquelSizeMap = {
  S: "SMALL",
  M: "MEDIUM",
  L: "LARGE",
};

const parseTroquelSearchTerm = (rawSearch) => {
  const search = rawSearch?.trim();

  if (!search) {
    return null;
  }

  if (/^solo\b/i.test(search)) {
    return {
      size: "SMALL",
      code: search,
    };
  }

  const sizeOnlyMatch = search.match(/^([sml])$/i);

  if (sizeOnlyMatch) {
    return {
      size: troquelSizeMap[sizeOnlyMatch[1].toUpperCase()] || null,
      code: "",
    };
  }

  const match = search.match(/^([sml])\s*(.+)$/i);

  if (!match) {
    return null;
  }

  return {
    size: troquelSizeMap[match[1].toUpperCase()] || null,
    code: match[2]?.trim() || "",
  };
};

export { parseTroquelSearchTerm };
