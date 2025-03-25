export const extractDomain = (url: string): string => {
  try {
    const { hostname } = new URL(url);
    return hostname;
  } catch {
    return "";
  }
};

export const abbreviateAddress = (address: string | undefined): string => {
  if (!address) return "???";
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
};

/**
 * Handles formattinc eclp params for storage as strings in zustand store
 * Removes trailing zeros after decimal point (but keeps the decimal if needed)
 */
export const formatEclpParamValues = (num: number): string => {
  // First convert to fixed decimal string
  const fixed = num.toFixed(18);
  // Then remove trailing zeros after decimal point (but keep the decimal if needed)
  return fixed.replace(/(\.\d*[1-9])0+$|\.0+$/, "$1");
};
