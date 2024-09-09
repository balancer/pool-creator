export type SupportedTokenWeight = "5050" | "8020";
export interface TokenWeightSelectItem {
  id: SupportedTokenWeight;
  label: string;
}

export const TokenWeightSelectItems: TokenWeightSelectItem[] = [
  { id: "5050", label: "50/50" },
  { id: "8020", label: "80/20" },
];

export function getPerTokenWeights(tokenWeights: SupportedTokenWeight) {
  return {
    token1Weight: tokenWeights === "8020" ? "80" : "50",
    token2Weight: tokenWeights === "8020" ? "20" : "50",
  };
}

export function getDenormalizedTokenWeight(tokenWeights: SupportedTokenWeight, isToken1: boolean) {
  if (tokenWeights === "8020") {
    if (isToken1) {
      return 8000000000000000000n;
    } else {
      return 2000000000000000000n;
    }
  }

  return 1000000000000000000n; // bind 2 tokens with 1e18 weight for each to get a 50/50 pool
}
