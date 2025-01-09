import { useAccount } from "wagmi";

export const useIsSafeWallet = () => {
  const { connector } = useAccount();
  return connector?.id === "safe";
};
