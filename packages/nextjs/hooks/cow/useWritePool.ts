import { Address } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { abis } from "~~/contracts/abis";
import { type Token } from "~~/hooks/cow";
import { useTransactor } from "~~/hooks/scaffold-eth";

const POOL_ABI = abis.CoW.BCoWPool;
const WEIGHT = 1000000000000000000n; // bind 2 tokens with 1e18 weight for each to get a 50/50 pool

export const useWritePool = (pool: Address) => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const writeTx = useTransactor(); // scaffold hook for tx status toast notifications

  const setSwapFee = async (rawAmount: bigint) => {
    if (!publicClient) throw new Error("No public client found");
    if (!walletClient) throw new Error("No wallet client found");

    const { request: setSwapFee } = await publicClient.simulateContract({
      abi: POOL_ABI,
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

  const bind = async (token: Token, rawAmount: bigint) => {
    if (!publicClient) throw new Error("No public client found");
    if (!walletClient) throw new Error("No wallet client found");

    try {
      const { request: bind } = await publicClient.simulateContract({
        abi: POOL_ABI,
        address: pool,
        functionName: "bind",
        account: walletClient.account,
        args: [token.address, rawAmount, WEIGHT],
      });

      await writeTx(() => walletClient.writeContract(bind), {
        blockConfirmations: 1,
        onBlockConfirmation: () => {
          console.log("Bound token:", token.symbol, "to pool:", pool);
        },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const finalize = async () => {
    if (!publicClient) throw new Error("No public client found!");
    if (!walletClient) throw new Error("No wallet client found!");

    const { request: finalizePool } = await publicClient.simulateContract({
      abi: POOL_ABI,
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

  return { setSwapFee, bind, finalize };
};
