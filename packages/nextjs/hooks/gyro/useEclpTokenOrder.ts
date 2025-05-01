import { erc20Abi } from "viem";
import { useReadContract } from "wagmi";
import { usePoolCreationStore } from "~~/hooks/v3";
import { sortTokenConfigs } from "~~/utils/helpers";

/**
 * Handles sorting tokens according to alphanumeric AND state of isEclpParamsInverted
 */
export const useEclpTokenOrder = () => {
  const { eclpParams, tokenConfigs } = usePoolCreationStore();
  const { isEclpParamsInverted } = eclpParams;

  const sortedTokens = sortTokenConfigs(tokenConfigs).map(token => ({
    address: token.address,
    symbol: token.tokenInfo?.symbol,
    currentRate: token.currentRate,
    underlyingTokenAddress: token.tokenInfo?.underlyingTokenAddress,
  }));
  if (isEclpParamsInverted) sortedTokens.reverse();

  const { data: underlyingToken0Symbol } = useReadContract({
    address: sortedTokens[0].underlyingTokenAddress,
    abi: erc20Abi,
    functionName: "symbol",
  });

  const { data: underlyingToken1Symbol } = useReadContract({
    address: sortedTokens[1].underlyingTokenAddress,
    abi: erc20Abi,
    functionName: "symbol",
  });

  const symbolForToken0 = underlyingToken0Symbol ? underlyingToken0Symbol : sortedTokens[0].symbol;
  const symbolForToken1 = underlyingToken1Symbol ? underlyingToken1Symbol : sortedTokens[1].symbol;

  return sortedTokens.map((token, index) => ({
    ...token,
    symbol: index === 0 ? symbolForToken0 : symbolForToken1,
  }));
};
