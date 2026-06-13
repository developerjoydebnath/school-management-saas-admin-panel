export const buildQueryParams = (filter: Record<string, any>) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filter)) {
    if (value === undefined || value === null || value === "") continue;

    if (Array.isArray(value)) {
      // Handle array values (like status and orderType in your example)
      value.forEach((item) => {
        if (item?.value !== undefined) {
          params.append(key, item.value);
        } else if (item !== undefined && item !== null) {
          params.append(key, item);
        }
      });
    } else if (typeof value === "object" && value !== null) {
      // Handle object values (if they have a 'value' property)
      if (value.value !== undefined) {
        params.append(key, value.value);
      }
    } else {
      // Handle primitive values (string, number, boolean)
      params.append(key, value.toString());
    }
  }

  return params;
};
