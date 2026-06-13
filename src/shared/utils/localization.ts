export const getLocalizedName = (name: any, locale: string): string => {
  if (!name) return "";
  if (typeof name === "string") return name;
  if (typeof name === "object") {
    return name[locale] || name["en"] || "";
  }
  return "";
};
