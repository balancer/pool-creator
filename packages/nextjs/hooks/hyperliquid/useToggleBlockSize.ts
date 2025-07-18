"use client";

import { useIsUsingBigBlocks } from "./useIsUsingBigBlocks";
import * as hl from "@nktkas/hyperliquid";
import { useMutation } from "@tanstack/react-query";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { useWalletClient } from "wagmi";

export function useToggleBlockSize() {
  const { data: isUsingBigBlocks } = useIsUsingBigBlocks();
  const { data: walletClient } = useWalletClient();

  async function toggleBlockSize() {
    if (!walletClient) throw new Error("Wallet client not found");

    const transport = new hl.HttpTransport();

    const exchangeClient = new hl.ExchangeClient({
      wallet: walletClient,
      transport,
    });

    // create agent that will execute the evmUserModify action
    const privateKey = generatePrivateKey();

    const account = privateKeyToAccount(privateKey);

    const approveAgentResult = await exchangeClient.approveAgent({
      agentAddress: account.address,
      agentName: "testAgent3",
    });

    console.log("approveAgentResult", approveAgentResult);

    const agentExchangeClient = new hl.ExchangeClient({
      wallet: privateKey,
      transport,
    });

    const evmUserModifyResult = await agentExchangeClient.evmUserModify({
      usingBigBlocks: !isUsingBigBlocks,
    });

    console.log("evmUserModifyResult", evmUserModifyResult);

    // TODO: figure out 1. how to check how many agents exist?  2. how to prune agents to make room for new one? (zekraken said there was max agent count)
  }

  return useMutation({
    mutationFn: toggleBlockSize,
    // onSuccess: TODO: refetch isUsingBigBlocks to update cache
    onError: error => {
      console.error(error);
    },
  });
}
