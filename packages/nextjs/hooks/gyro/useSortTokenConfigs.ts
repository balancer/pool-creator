import { type TokenConfig } from "~~/hooks/v3";
import { useBoostableWhitelist } from "~~/hooks/v3/";

/**
 * This fixes edge case for gyro token sorting where:
 * the underlying token address is before other token but the boosted variant is after
 * what matters is sorting by the token addresses that actually go in the pool
 */
export function useSortTokenConfigs() {
  const { data: boostableWhitelist } = useBoostableWhitelist();

  const sortTokenConfigs = (tokenConfigs: TokenConfig[]) => {
    return [...tokenConfigs].sort((a, b) => {
      let addressA = a.address;
      let addressB = b.address;

      const boostedVariantA = boostableWhitelist?.[a.address];
      const boostedVariantB = boostableWhitelist?.[b.address];

      if (a.useBoostedVariant && boostedVariantA) {
        addressA = boostedVariantA.address;
      }

      if (b.useBoostedVariant && boostedVariantB) {
        addressB = boostedVariantB.address;
      }

      return addressA.localeCompare(addressB);
    });
  };

  return sortTokenConfigs;
}
