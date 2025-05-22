import { usePoolCreationStore } from "~~/hooks/v3";
import { useBoostableWhitelist } from "~~/hooks/v3/";

export function useSortedTokenConfigs() {
  const { data: boostableWhitelist } = useBoostableWhitelist();

  const { tokenConfigs } = usePoolCreationStore();

  return [...tokenConfigs].sort((a, b) => {
    let addressA = a.address;
    let addressB = b.address;

    // Handle if user is proving underlying for pool that uses boosted variant
    const boostedVariantA = boostableWhitelist?.[a.address];
    const boostedVariantB = boostableWhitelist?.[b.address];

    if (a.useBoostedVariant && boostedVariantA) {
      addressA = boostedVariantA.address;
    }

    if (b.useBoostedVariant && boostedVariantB) {
      addressB = boostedVariantB.address;
    }

    // Lexicographical sort by address
    return addressA.localeCompare(addressB);
  });
}
