import { useSafeAppsSDK } from "@safe-global/safe-apps-react-sdk";
import { TransactionStatus } from "@safe-global/safe-apps-sdk";
import { getPublicClient } from "@wagmi/core";
import { Hash, SendTransactionParameters, WalletClient } from "viem";
import { Config, useWalletClient } from "wagmi";
import { SendTransactionMutate } from "wagmi/query";
import { useIsSafeWallet } from "~~/hooks/safe/useIsSafeWallet";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { getBlockExplorerTxLink, getParsedError, notification } from "~~/utils/scaffold-eth";
import { TransactorFuncOptions } from "~~/utils/scaffold-eth/contract";

type TransactionFunc = (
  tx: (() => Promise<Hash>) | Parameters<SendTransactionMutate<Config, undefined>>[0],
  options?: TransactorFuncOptions,
) => Promise<Hash | undefined>;

/**
 * Custom notification content for TXs.
 */
export const TxnNotification = ({ message, blockExplorerLink }: { message: string; blockExplorerLink?: string }) => {
  return (
    <div className={`flex flex-col ml-1 cursor-default`}>
      <p className="my-0">{message}</p>
      {blockExplorerLink && blockExplorerLink.length > 0 ? (
        <a href={blockExplorerLink} target="_blank" rel="noreferrer" className="block link text-md">
          check out transaction
        </a>
      ) : null}
    </div>
  );
};

const MAX_POLLING_ATTEMPTS = 100; // 100 * 3s = 5 minutes
const POLLING_INTERVAL = 3000; // 3 seconds

const pollSafeTxStatus = async (sdk: any, transactionHash: string): Promise<`0x${string}`> => {
  let attempts = 0;

  while (attempts < MAX_POLLING_ATTEMPTS) {
    const safeTxDetails = await sdk.txs.getBySafeTxHash(transactionHash);

    console.log("safeTxDetails", safeTxDetails);

    if (safeTxDetails?.txStatus === TransactionStatus.SUCCESS && safeTxDetails.txHash) {
      return safeTxDetails.txHash as `0x${string}`;
    }

    if (safeTxDetails?.txStatus === TransactionStatus.FAILED) throw new Error("Safe transaction failed");

    attempts++;
    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
  }

  throw new Error("Timeout waiting for Safe transaction to complete");
};

/**
 * Runs Transaction passed in to returned function showing UI feedback.
 * @param _walletClient - Optional wallet client to use. If not provided, will use the one from useWalletClient.
 * @returns function that takes in transaction function as callback, shows UI feedback for transaction and returns a promise of the transaction hash
 */
export const useTransactor = (_walletClient?: WalletClient): TransactionFunc => {
  let walletClient = _walletClient;
  const { data } = useWalletClient();
  if (walletClient === undefined && data) {
    walletClient = data;
  }
  const isSafeWallet = useIsSafeWallet();
  const { sdk } = useSafeAppsSDK();

  const result: TransactionFunc = async (tx, options) => {
    if (!walletClient) {
      notification.error("Cannot access account");
      console.error("⚡️ ~ file: useTransactor.tsx ~ error");
      return;
    }

    let notificationId = null;
    let transactionHash: Hash | undefined = undefined;
    try {
      const network = await walletClient.getChainId();
      // Get full transaction from public client
      const publicClient = getPublicClient(wagmiConfig);

      notificationId = notification.loading(<TxnNotification message="Awaiting for user confirmation" />);
      if (typeof tx === "function") {
        // Tx is already prepared by the caller
        const result = await tx();
        transactionHash = result;
      } else if (tx != null) {
        transactionHash = await walletClient.sendTransaction(tx as SendTransactionParameters);
      } else {
        throw new Error("Incorrect transaction passed to transactor");
      }
      notification.remove(notificationId);

      notificationId = notification.loading(<TxnNotification message="Waiting for safe to process" />);

      if (isSafeWallet) {
        transactionHash = await pollSafeTxStatus(sdk, transactionHash);
      }

      notification.remove(notificationId);

      const blockExplorerTxURL = network ? getBlockExplorerTxLink(network, transactionHash) : "";

      notificationId = notification.loading(
        <TxnNotification message="Waiting for transaction to complete." blockExplorerLink={blockExplorerTxURL} />,
      );
      // Matt added this callback to save tx hash to local storage incase user disconnects while tx pending
      if (options?.onTransactionHash && transactionHash) {
        options.onTransactionHash(transactionHash);
      }

      const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: transactionHash,
        confirmations: options?.blockConfirmations,
      });
      notification.remove(notificationId);

      if (transactionReceipt.status === "success") {
        notification.success(
          <TxnNotification message="Transaction completed successfully!" blockExplorerLink={blockExplorerTxURL} />,
          {
            icon: "🎉",
          },
        );
      } else {
        throw new Error("Transaction reverted");
      }

      if (options?.onBlockConfirmation) options.onBlockConfirmation(transactionReceipt);
    } catch (error: any) {
      if (notificationId) {
        notification.remove(notificationId);
      }
      console.error("⚡️ ~ file: useTransactor.ts ~ error", error);
      const message = getParsedError(error);
      notification.error(message);
      throw error;
    }

    return transactionHash;
  };

  return result;
};
