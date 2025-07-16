import { useIsUsingBigBlocks } from "./useIsUsingBigBlocks";
import { useMutation } from "@tanstack/react-query";
import { Hex } from "viem";
import { useWalletClient } from "wagmi";

type EvmUserModifyRequest = {
  type: "evmUserModify";
  usingBigBlocks: boolean;
};

type Signature = {
  r: Hex;
  s: Hex;
  v: number;
};

type ToggleBlockSizePayload = {
  action: EvmUserModifyRequest;
  nonce: number;
  signature: Signature;
  vaultAddress: null;
};

export function useToggleBlockSize() {
  const { data: isUsingBigBlocks } = useIsUsingBigBlocks();
  const { data: walletClient } = useWalletClient();

  const action: EvmUserModifyRequest = {
    type: "evmUserModify",
    usingBigBlocks: !isUsingBigBlocks,
  };

  async function signAction(): Promise<Signature> {
    if (!walletClient) throw new Error("Wallet client not found");
    const domain = {
      name: "Exchange",
      version: "1",
      chainId: 1337,
      verifyingContract: "0x0000000000000000000000000000000000000000",
    } as const;
    const types = {
      Agent: [
        { name: "source", type: "string" },
        { name: "connectionId", type: "bytes32" },
      ],
    };

    const message = {
      source: "a",
      connectionId: "TODO!!!",
    };

    const signature: Hex = await walletClient.signTypedData({
      domain,
      types,
      primaryType: "Agent",
      message,
    });

    return splitSignature(signature);
  }

  async function toggleBlockSize() {
    const signature = await signAction();

    const payload: ToggleBlockSizePayload = {
      action,
      nonce: Date.now(),
      signature,
      vaultAddress: null,
    };

    const res = await fetch("https://api.hyperliquid.xyz/exchange", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(res);
      throw new Error(`Request failed: ${res.status}`);
    }

    const data = await res.json();

    if (data.status === "err") throw new Error(data.response);
    return data;
  }

  return useMutation({
    mutationFn: toggleBlockSize,
    // onSuccess: TODO: refetch isUsingBigBlocks to update cache
    onError: error => {
      console.error(error);
    },
  });
}

/**
 * @dev Creates a keccak hash based on the packed action, nonce, and vault address.
 * @dev I just ripped off - https://github.com/hyperliquid-dex/hyperliquid-python-sdk/blob/master/hyperliquid/utils/signing.py#L137-L145
 *
 * @param action - The action data to be packed with MessagePack.
 * @param vaultAddress - The vault address as a hex string or null.
 * @param nonce - A numeric nonce.
 *
 * @returns The keccak hash as a hex string.
 */
// export function computeL1ActionHash(action: ValueType, nonce: number, vaultAddress: string | null): string {
//   const actionPacked = encode(action);

//   const nonceBuffer: Buffer = Buffer.alloc(8);
//   nonceBuffer.writeBigUInt64BE(BigInt(nonce));

//   let vaultBuffer: Buffer;
//   if (vaultAddress === null) {
//     vaultBuffer = Buffer.from([0x00]);
//   } else {
//     vaultBuffer = Buffer.concat([Buffer.from([0x01]), addressToBytes(vaultAddress)]);
//   }

//   const data = Buffer.concat([actionPacked, nonceBuffer, vaultBuffer]);

//   const hash = keccak256(data);
//   return hash;
// }

/** Splits a signature hexadecimal string into its components. */
function splitSignature(signature: Hex): { r: Hex; s: Hex; v: number } {
  const r = `0x${signature.slice(2, 66)}` as const;
  const s = `0x${signature.slice(66, 130)}` as const;
  const v = parseInt(signature.slice(130, 132), 16);
  return { r, s, v };
}
