import { useEffect, useMemo, useState } from "react";
import { Address, isAddress } from "viem";
import { useApiConfig } from "~~/hooks/balancer";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useReadToken } from "~~/hooks/token";
import type { Token } from "~~/hooks/token";
import { tokenBlacklist } from "~~/utils";

export function useExoticToken(searchText: string, filteredTokenOptions: Token[]) {
  const { targetNetwork } = useTargetNetwork();
  const [exoticTokenAddress, setExoticTokenAddress] = useState<Address | undefined>();
  const { chainName } = useApiConfig();

  const { name, symbol, decimals, isLoadingName, isLoadingDecimals, isLoadingSymbol } =
    useReadToken(exoticTokenAddress);

  // TODO: handle priceRateProviderData and underlyingTokenAddress for exotic tokens?
  const exoticToken: Token | undefined = useMemo(() => {
    if (exoticTokenAddress && name && symbol && decimals) {
      return {
        address: exoticTokenAddress,
        name,
        symbol,
        logoURI: "",
        decimals,
        chainId: targetNetwork.id,
        priceRateProviderData: null,
        underlyingTokenAddress: undefined,
        isBufferAllowed: false,
      };
    }
  }, [exoticTokenAddress, name, symbol, decimals, targetNetwork.id]);

  const blacklist = useMemo(() => tokenBlacklist[chainName as keyof typeof tokenBlacklist] || [], [chainName]);

  useEffect(() => {
    if (filteredTokenOptions.length === 0 && isAddress(searchText) && !blacklist.includes(searchText.toLowerCase())) {
      setExoticTokenAddress(searchText);
    }
    if (!isAddress(searchText)) {
      setExoticTokenAddress(undefined);
    }
  }, [searchText, filteredTokenOptions, blacklist]);

  const isLoadingExoticToken = isLoadingName || isLoadingDecimals || isLoadingSymbol;

  return { exoticToken, isLoadingExoticToken };
}
