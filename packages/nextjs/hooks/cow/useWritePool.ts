import { Address } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { abis } from "~~/contracts/abis";
import { useTransactor } from "~~/hooks/scaffold-eth";

const DENORMALIZED_WEIGHT = 1000000000000000000n; // bind 2 tokens with 1e18 weight for each to get a 50/50 pool

// TODO: refactor to using tanstack query
export const useWritePool = (pool: Address | undefined) => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const writeTx = useTransactor(); // scaffold hook for tx status toast notifications

  const setSwapFee = async (rawAmount: bigint) => {
    if (!pool) throw new Error("Cannot set swap fee without pool address");
    if (!publicClient) throw new Error("Cannot set swap fee public client");
    if (!walletClient) throw new Error("Cannot set swap fee wallet client");

    const { request: setSwapFee } = await publicClient.simulateContract({
      abi: abis.CoW.BCoWPool,
      address: pool,
      functionName: "setSwapFee",
      account: walletClient.account,
      args: [rawAmount],
    });

    await writeTx(() => walletClient.writeContract(setSwapFee), {
      blockConfirmations: 1,
      onBlockConfirmation: () => {
        console.log("Set swap fee to", rawAmount, "for pool:", pool);
      },
    });
  };

  const bind = async (token: Address, rawAmount: bigint) => {
    if (!pool) throw new Error("Cannot bind token without pool address");
    if (!publicClient) throw new Error("No public client found");
    if (!walletClient) throw new Error("No wallet client found");

    const { request: bind } = await publicClient.simulateContract({
      abi: abis.CoW.BCoWPool,
      address: pool,
      functionName: "bind",
      account: walletClient.account,
      args: [token, rawAmount, DENORMALIZED_WEIGHT],
    });

    await writeTx(() => walletClient.writeContract(bind), {
      blockConfirmations: 1,
      onBlockConfirmation: () => {
        console.log("Bound token:", token, "to pool:", pool);
      },
    });
  };

  const finalize = async () => {
    if (!pool) throw new Error("Cannot finalize without pool address");
    if (!publicClient) throw new Error("No public client found!");
    if (!walletClient) throw new Error("No wallet client found!");

    const { request: finalizePool } = await publicClient.simulateContract({
      abi: abis.CoW.BCoWPool,
      address: pool,
      functionName: "finalize",
      account: walletClient.account,
    });

    await writeTx(() => walletClient.writeContract(finalizePool), {
      blockConfirmations: 1,
      onBlockConfirmation: () => {
        console.log("Finalized pool:", pool);
      },
    });
  };

  return { bind, setSwapFee, finalize };
};
