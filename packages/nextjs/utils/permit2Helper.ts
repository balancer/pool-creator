import {
  AllowanceTransfer,
  MaxAllowanceExpiration,
  MaxSigDeadline,
  PERMIT2,
  Permit2,
  Permit2Batch,
  PermitDetails,
  permit2Abi,
} from "@balancer/sdk";
import { Address, PublicClient, WalletClient, getContract } from "viem";

export type CreatePermit2 = {
  chainId: number;
  tokens: { address: string; amount: bigint }[];
  client: { public: PublicClient; wallet: WalletClient };
  spender: Address;
};

export const createPermit2 = async ({ client, chainId, tokens, spender }: CreatePermit2) => {
  if (!client.wallet.account) throw new Error("Wallet account not found for permit2 allowance read");
  if (!client.wallet.chain?.id) throw new Error("Wallet chain not found for permit2 allowance read");

  const owner = client.wallet.account.address;

  const permit2Contract = getContract({
    address: PERMIT2[chainId],
    abi: permit2Abi,
    client,
  });

  const details: PermitDetails[] = await Promise.all(
    tokens.map(async token => {
      const [, , nonce] = await permit2Contract.read.allowance([owner, token.address as `0x${string}`, spender]);

      return {
        token: token.address as `0x${string}`,
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

  const { domain, types, values } = AllowanceTransfer.getPermitData(batch, PERMIT2[chainId], client.wallet.chain.id);

  const signature = await client.wallet.signTypedData({
    account: client.wallet.account,
    message: {
      ...values,
    },
    domain,
    primaryType: "PermitBatch",
    types,
  });

  const permit2: Permit2 = {
    batch,
    signature,
  };

  return permit2;
};
