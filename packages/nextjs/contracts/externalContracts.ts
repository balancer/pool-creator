import { abis } from "./abis";
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

/**
 * @example
 * const externalContracts = {
 *   1: {
 *     DAI: {
 *       address: "0x...",
 *       abi: [...],
 *     },
 *   },
 * } as const;
 */
const externalContracts = {
  11155111: {
    BCoWFactory: {
      address: "0x9F151748595bAA8829d44448Bb3181AD6b995E8e",
      abi: abis.CoW.BCoWFactory,
    },
    Faucet: {
      address: "0x26bfAecAe4D5fa93eE1737ce1Ce7D53F2a0E9b2d",
      abi: abis.Balancer.Faucet,
    },
  },
  1: {
    BCoWFactory: {
      address: "0x23fcC2166F991B8946D195de53745E1b804C91B7",
      abi: abis.CoW.BCoWFactory,
    },
  },
  100: {
    BCoWFactory: {
      address: "0x7573B99BC09c11Dc0427fb9c6662bc603E008304",
      abi: abis.CoW.BCoWFactory,
    },
  },
} as const;

export default externalContracts satisfies GenericContractsDeclaration;
