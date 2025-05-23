// import { erc20Abi } from "viem";
// import { useReadContract } from "wagmi";
import { useSortedTokenConfigs } from "~~/hooks/balancer";
import { usePoolCreationStore } from "~~/hooks/v3";

/**
 * Lexicographically sort tokens and take into account whether user has inverted params for chart display
 */
export const useEclpTokenOrder = () => {
  const { eclpParams } = usePoolCreationStore();
  const { isEclpParamsInverted } = eclpParams;

  const sortedTokenConfigs = useSortedTokenConfigs();
  const sortedTokens = sortedTokenConfigs.map(token => ({
    address: token.address,
    symbol: token.tokenInfo?.symbol,
    underlyingTokenAddress: token.tokenInfo?.underlyingTokenAddress,
    rateProvider: token.rateProvider,
    useBoostedVariant: token.useBoostedVariant,
  }));

  // reverse token order if user has inverted the params
  if (isEclpParamsInverted) sortedTokens.reverse();

  return sortedTokens;

  // fetch underlying token symbols for chart display
  // const { data: underlyingToken0Symbol } = useReadContract({
  //   address: sortedTokens[0].underlyingTokenAddress,
  //   abi: erc20Abi,
  //   functionName: "symbol",
  // });

  // const { data: underlyingToken1Symbol } = useReadContract({
  //   address: sortedTokens[1].underlyingTokenAddress,
  //   abi: erc20Abi,
  //   functionName: "symbol",
  // });

  // const symbolForToken0 = underlyingToken0Symbol ? underlyingToken0Symbol : sortedTokens[0].symbol;
  // const symbolForToken1 = underlyingToken1Symbol ? underlyingToken1Symbol : sortedTokens[1].symbol;

  // return sortedTokens.map((token, index) => ({
  //   ...token,
  //   symbol: index === 0 ? symbolForToken0 : symbolForToken1,
  // }));
};
