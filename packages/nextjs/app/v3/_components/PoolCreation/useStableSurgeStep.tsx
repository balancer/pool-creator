import { transactionButtonManager } from "./index";
import { PoolType } from "@balancer/sdk";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { useSetMaxSurgeFee } from "~~/hooks/v3/";
import { useSetMaxSurgeFeeTxHash } from "~~/hooks/v3/";
import { usePoolCreationStore } from "~~/hooks/v3/";
import { getBlockExplorerTxLink } from "~~/utils/scaffold-eth";

export function useStableSurgeStep() {
  const { address: connectedWalletAddress } = useAccount();
  const { chain, setMaxSurgeFeeTx, poolType, swapFeeManager } = usePoolCreationStore();
  const {
    mutate: setMaxSurgeFee,
    isPending: isSetMaxSurgeFeePending,
    error: setMaxSurgeFeeError,
  } = useSetMaxSurgeFee();
  const { isFetching: isSetMaxSurgeFeeTxHashPending, error: setMaxSurgeFeeTxHashError } = useSetMaxSurgeFeeTxHash();

  const setMaxSurgeFeeUrl = setMaxSurgeFeeTx.wagmiHash && getBlockExplorerTxLink(chain?.id, setMaxSurgeFeeTx.wagmiHash);

  const setMaxSurgeFeeStep = transactionButtonManager({
    label: "Set Max Fee",
    onSubmit: setMaxSurgeFee,
    isPending: isSetMaxSurgeFeePending || isSetMaxSurgeFeeTxHashPending,
    error: setMaxSurgeFeeError || setMaxSurgeFeeTxHashError,
    blockExplorerUrl: setMaxSurgeFeeUrl,
    infoMsg: "For better integration with aggregators, we recommend setting this pool's max surge fee to 10%",
  });

  const isStableSurge = poolType === PoolType.StableSurge;
  const connectedWalletIsSwapFeeManager = swapFeeManager === connectedWalletAddress;
  const showSetMaxSurgeFeeStep = isStableSurge && connectedWalletIsSwapFeeManager;
  const isDaoSwapFeeManager = swapFeeManager === "" || swapFeeManager === zeroAddress;
  const showWarnDaoMustUpdateFee = isStableSurge && isDaoSwapFeeManager;

  return { setMaxSurgeFeeStep, showSetMaxSurgeFeeStep, showWarnDaoMustUpdateFee };
}
