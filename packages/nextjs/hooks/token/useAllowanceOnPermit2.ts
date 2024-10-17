import { BALANCER_ROUTER, PERMIT2, permit2Abi } from "@balancer/sdk";
import { Address, zeroAddress } from "viem";
import { useReadContract, useWalletClient } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

// Use Permit2 contract to check users's allowance for Balancer Router
export const useAllowanceOnPermit2 = (token: Address) => {
  const { data: walletClient } = useWalletClient();
  const connectedAddress = walletClient?.account.address || zeroAddress;
  const { targetNetwork } = useTargetNetwork();
  const chainId = targetNetwork.id;

  return useReadContract({
    address: PERMIT2[chainId],
    abi: permit2Abi,
    functionName: "allowance",
    args: [connectedAddress, token, BALANCER_ROUTER[chainId]],
  });
};
