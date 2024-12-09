import { type Address } from "viem";
import { useFetchTokenPrices } from "~~/hooks/token";

export const useTokenUsdValue = (tokenAddress: Address | undefined, amount: string) => {
  const { data: tokenPrices, isLoading, isError } = useFetchTokenPrices();
  if (!tokenAddress || !amount) return { tokenDollarValue: null, isLoading, isError };

  const pricePerToken = tokenPrices?.find(token => token.address.toLowerCase() === tokenAddress.toLowerCase())?.price;

  const tokenUsdValue = pricePerToken !== undefined ? pricePerToken * Number(amount) : null;

  return { tokenUsdValue, isLoading, isError };
};
