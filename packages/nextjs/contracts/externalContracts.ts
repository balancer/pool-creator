import { abis } from "./abis";
import { arbitrum, gnosis, mainnet, sepolia } from "viem/chains";
import scaffoldConfig from "~~/scaffold.config";
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const FACTORY_ADDRESSES = {
  11155111: "0x1E3D76AC2BB67a2D7e8395d3A624b30AA9056DF9",
  1: "0xf76c421bAb7df8548604E60deCCcE50477C10462",
  100: "0x703Bd8115E6F21a37BB5Df97f78614ca72Ad7624",
  42161: "0xE0e2Ba143EE5268DA87D529949a2521115987302",
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
} as const;

export default externalContracts satisfies GenericContractsDeclaration;
