import { useEffect, useMemo, useState } from "react";
import { isAddress } from "viem";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useReadToken } from "~~/hooks/token";
import type { Token } from "~~/hooks/token";

export function useExoticToken(searchText: string, filteredTokenOptions: Token[]) {
  const { targetNetwork } = useTargetNetwork();
  const [exoticTokenAddress, setExoticTokenAddress] = useState<string | undefined>();

  const { name, symbol, decimals, isLoadingName, isLoadingDecimals, isLoadingSymbol } =
    useReadToken(exoticTokenAddress);

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
        underlyingTokenAddress: null,
        isBufferAllowed: false,
      };
    }
  }, [exoticTokenAddress, name, symbol, decimals, targetNetwork.id]);

  useEffect(() => {
    if (filteredTokenOptions.length === 0 && isAddress(searchText)) {
      setExoticTokenAddress(searchText);
    }
    if (!isAddress(searchText)) {
      setExoticTokenAddress(undefined);
    }
  }, [searchText, filteredTokenOptions]);

  const isLoadingExoticToken = isLoadingName || isLoadingDecimals || isLoadingSymbol;

  return { exoticToken, isLoadingExoticToken };
}
