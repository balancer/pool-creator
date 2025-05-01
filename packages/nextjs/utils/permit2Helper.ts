import { PERMIT2_ADDRESS } from "./constants";
import {
  AllowanceTransfer,
  MaxAllowanceExpiration,
  MaxSigDeadline,
  Permit2,
  Permit2Batch,
  PermitDetails,
  permit2Abi,
} from "@balancer/sdk";
import { PublicClient, WalletClient, getContract } from "viem";

export type CreatePermit2 = {
  tokens: { address: `0x${string}`; amount: bigint }[];
  client: { public: PublicClient; wallet: WalletClient };
  spender: `0x${string}`;
};

export const createPermit2 = async ({ client, tokens, spender }: CreatePermit2) => {
  if (!client.wallet.account) throw new Error("Wallet account not found for permit2 allowance read");
  if (!client.wallet.chain?.id) throw new Error("Wallet chain id not found for permit2 allowance read");

  const owner = client.wallet.account.address;

  const permit2Contract = getContract({
    address: PERMIT2_ADDRESS,
    abi: permit2Abi,
    client,
  });

  const details: PermitDetails[] = await Promise.all(
    tokens.map(async token => {
      const [, , nonce] = await permit2Contract.read.allowance([owner, token.address, spender]);

      return {
        token: token.address,
        amount: token.amount,
        expiration: Number(MaxAllowanceExpiration),
        nonce,
      };
    }),
  );

  const batch: Permit2Batch = {
    details,
    spender,
    sigDeadline: MaxSigDeadline,
  };

  const { domain, types, values } = AllowanceTransfer.getPermitData(batch, PERMIT2_ADDRESS, client.wallet.chain.id);

  const signature = await client.wallet.signTypedData({
    account: client.wallet.account,
    message: {
      ...values,
    },
    domain: {
      ...domain,
      chainId: Number(domain.chainId),
    },
    primaryType: "PermitBatch",
    types,
  });

  const permit2: Permit2 = {
    batch,
    signature,
  };

  return permit2;
};
