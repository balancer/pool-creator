import { useAccount } from "wagmi";

export const useIsSafeWallet = () => {
  const { connector } = useAccount();
  return connector?.id === "safe";
};

// export function useShouldBatchTransactions(pool: Pool): boolean {
//     const isSafeWallet = useIsSafeWallet()

//     return isSafeWallet && isCowAmmPool(pool.type)
//   }
