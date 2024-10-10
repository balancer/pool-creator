// import { CreatePool, CreatePoolInput } from "@balancer/sdk";
// import { useMutation } from "@tanstack/react-query";
// import { parseUnits, zeroAddress } from "viem";
// import { usePublicClient, useWalletClient } from "wagmi";
// import { useTransactor } from "~~/hooks/scaffold-eth";
// import { usePoolStore } from "~~/hooks/v3";

export const useCreatePool = () => {
  // const { data: walletClient } = useWalletClient();
  // const publicClient = usePublicClient();
  // const writeTx = useTransactor();
  // const {
  //   tokenConfigs,
  //   name,
  //   symbol,
  //   poolType,
  //   swapFeePercentage,
  //   pauseManager,
  //   poolHooksContract,
  //   swapFeeManager,
  //   enableDonation,
  //   disableUnbalancedLiquidity,
  // } = usePoolStore();
  // console.log("walletClient", walletClient);
  // const createPool = async () => {
  //   if (!publicClient) throw new Error("Public client must be available!");
  //   if (!walletClient) throw new Error("Wallet client must be connected!");
  //   if (poolType === undefined) throw new Error("No pool type provided!");
  //   if (!pauseManager) throw new Error("No pause manager provided!");
  //   if (!swapFeeManager) throw new Error("No swap fee manager provided!");
  //   const createPool = new CreatePool();
  //   const input: CreatePoolInput = {
  //     chainId,
  //     protocolVersion: 3,
  //     poolType,
  //     name,
  //     symbol,
  //     tokens: tokenConfigs.map(({ address, weight, rateProvider, tokenType, paysYieldFees }) => ({
  //       address,
  //       weight,
  //       rateProvider,
  //       tokenType,
  //       paysYieldFees,
  //     })),
  //     swapFeePercentage: parseUnits(swapFeePercentage, 16),
  //     swapFeeManager,
  //     pauseManager,
  //     poolHooksContract: poolHooksContract ?? zeroAddress, // use zero address if user does not provide a pool hooks contract address
  //     enableDonation,
  //     disableUnbalancedLiquidity,
  //   };
  //   const call = createPool.buildCall(input);
  //   await writeTx(
  //     () =>
  //       walletClient.sendTransaction({
  //         account: walletClient.account,
  //         data: call.callData,
  //         to: call.to,
  //       }),
  //     {
  //       blockConfirmations: 1,
  //       onBlockConfirmation: () => {
  //         console.log("Successfully deployed and registered a balancer v3 pool!");
  //       },
  //     },
  //   );
  // };
  // return useMutation({ mutationFn: () => createPool() });
};
