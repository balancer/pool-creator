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

export const truncateNumber = (num: number, maxDecimals = 5) => {
  const str = num.toString();
  const decimalIndex = str.indexOf(".");

  // If no decimal point, return as is
  if (decimalIndex === -1) return str;

  // Get everything after the decimal point
  const decimals = str.slice(decimalIndex + 1);

  // If 5 or fewer decimal places, return as is
  if (decimals.length <= maxDecimals) return str;

  // Otherwise truncate to 5 decimal places and add ellipsis
  return num.toFixed(maxDecimals);
};
