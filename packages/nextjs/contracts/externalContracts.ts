import { abis } from "./abis";
import { arbitrum, base, gnosis, mainnet, sepolia } from "viem/chains";
import scaffoldConfig from "~~/scaffold.config";
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const FACTORY_ADDRESSES = {
  11155111: "0x1E3D76AC2BB67a2D7e8395d3A624b30AA9056DF9", // Sepolia
  1: "0xf76c421bAb7df8548604E60deCCcE50477C10462", // Mainnet
  100: "0x703Bd8115E6F21a37BB5Df97f78614ca72Ad7624", // Gnosis
  42161: "0xE0e2Ba143EE5268DA87D529949a2521115987302", // Arbitrum
  8453: "0x03362f847B4fAbC12e1Ce98b6b59F94401E4588e", // Base -> https://basescan.org/address/0x03362f847b4fabc12e1ce98b6b59f94401e4588e#code
} as const;

const externalContracts = {
  31337: {
    BCoWFactory: {
      address: FACTORY_ADDRESSES[scaffoldConfig.targetFork.id],
      abi: abis.CoW.BCoWFactory,
      fromBlock: 0n,
    },
  },
  11155111: {
    BCoWFactory: {
      address: FACTORY_ADDRESSES[sepolia.id],
      abi: abis.CoW.BCoWFactory,
      fromBlock: 6415186n,
    },
  },
  1: {
    BCoWFactory: {
      address: FACTORY_ADDRESSES[mainnet.id],
      abi: abis.CoW.BCoWFactory,
      fromBlock: 20432455n,
    },
  },
  100: {
    BCoWFactory: {
      address: FACTORY_ADDRESSES[gnosis.id],
      abi: abis.CoW.BCoWFactory,
      fromBlock: 35259725n,
    },
  },
  42161: {
    BCoWFactory: {
      address: FACTORY_ADDRESSES[arbitrum.id],
      abi: abis.CoW.BCoWFactory,
      fromBlock: 248291297n,
    },
  },
  8453: {
    BCoWFactory: {
      address: FACTORY_ADDRESSES[base.id],
      abi: abis.CoW.BCoWFactory,
      fromBlock: 23650200n,
    },
  },
} as const;

export default externalContracts satisfies GenericContractsDeclaration;
