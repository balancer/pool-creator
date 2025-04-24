import { type TokenConfig } from "~~/hooks/v3/usePoolCreationStore";

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

export const sortTokenConfigs = (tokenConfigs: TokenConfig[]) => {
  return [...tokenConfigs].sort((a, b) => a.address.localeCompare(b.address));
};
