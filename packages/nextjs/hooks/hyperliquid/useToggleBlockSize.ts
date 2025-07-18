"use client";

import { useIsUsingBigBlocks } from "./useIsUsingBigBlocks";
import * as hl from "@nktkas/hyperliquid";
import { useMutation } from "@tanstack/react-query";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { useWalletClient } from "wagmi";

export function useToggleBlockSize() {
  const { data: isUsingBigBlocks, refetch: refetchIsUsingBigBlocks } = useIsUsingBigBlocks();
  const { data: walletClient } = useWalletClient();

  async function toggleBlockSize() {
    if (!walletClient) throw new Error("Wallet client not found");

    // Create and approve agent that will execute the evmUserModify action
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    const transport = new hl.HttpTransport();
    const userExchangeClient = new hl.ExchangeClient({
      wallet: walletClient,
      transport,
    });

    const approveAgentResult = await userExchangeClient.approveAgent({
      agentAddress: account.address,
      // no name agent always prunes the last no name agent so we do not have to worry about agent cap?
      agentName: "", // https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets#api-wallet-pruning
    });
    console.log("approveAgentResult", approveAgentResult);

    // Agent is authorized to execute orders on behalf of the user
    const agentExchangeClient = new hl.ExchangeClient({
      wallet: privateKey,
      transport,
    });

    const evmUserModifyResult = await agentExchangeClient.evmUserModify({
      usingBigBlocks: !isUsingBigBlocks,
    });
    console.log("evmUserModifyResult", evmUserModifyResult);
  }

  return useMutation({
    mutationFn: toggleBlockSize,
    onSuccess: () => {
      refetchIsUsingBigBlocks();
    },
    onError: error => {
      console.error(error);
    },
  });
}
