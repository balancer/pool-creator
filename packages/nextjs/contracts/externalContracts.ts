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
  // Ethereum Sepolia
  11155111: {
    BCoWFactory: {
      address: "0x1E3D76AC2BB67a2D7e8395d3A624b30AA9056DF9",
      abi: abis.CoW.BCoWFactory,
    },
  },
  // Ethereum Mainnet
  1: {
    BCoWFactory: {
      address: "0xf76c421bAb7df8548604E60deCCcE50477C10462",
      abi: abis.CoW.BCoWFactory,
    },
  },
  // Gnosis Mainnet
  100: {
    BCoWFactory: {
      address: "0x703Bd8115E6F21a37BB5Df97f78614ca72Ad7624",
      abi: abis.CoW.BCoWFactory,
    },
  },
} as const;

export default externalContracts satisfies GenericContractsDeclaration;
