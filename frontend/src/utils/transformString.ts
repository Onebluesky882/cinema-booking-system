export const toCamelCase = <T extends Record<string, any>>(obj: T) => {
  const newObj: any = {};

  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

    newObj[camelKey] = obj[key];
  }

  return newObj;
};
