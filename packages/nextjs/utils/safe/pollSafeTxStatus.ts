import SafeAppsSDK from "@safe-global/safe-apps-sdk";
import { TransactionStatus } from "@safe-global/safe-apps-sdk";

export async function pollSafeTxStatus(sdk: SafeAppsSDK, txHash: `0x${string}`): Promise<`0x${string}`> {
  while (true) {
    console.log("polling safe transaction status...");
    const safeTxDetails = await sdk.txs.getBySafeTxHash(txHash);

    // if safe tx is successful, return the on chain tx hash
    if (safeTxDetails?.txStatus === TransactionStatus.SUCCESS && safeTxDetails.txHash)
      return safeTxDetails.txHash as `0x${string}`;

    if (safeTxDetails?.txStatus === TransactionStatus.FAILED) throw new Error("Safe transaction failed");

    if (safeTxDetails?.txStatus === TransactionStatus.CANCELLED) throw new Error("Safe transaction was cancelled");

    await new Promise(resolve => setTimeout(resolve, 3000)); // poll every 3 seconds
  }
}
