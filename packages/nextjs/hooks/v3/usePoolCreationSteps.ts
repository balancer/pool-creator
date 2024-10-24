import { sepolia } from "viem/chains";
import { type Step } from "~~/app/cow/_components/StepsDisplay";
import { type TokenConfig, usePoolCreationStore } from "~~/hooks/v3";
import { getBlockExplorerTxLink } from "~~/utils/scaffold-eth/";

/**
 * Handles logic for defining steps in the pool creation process
 * based on number of tokens and whether or not any of them have useBoostedVariant set to true
 */
export function usePoolCreationSteps(tokenConfigs: TokenConfig[]) {
  const { createPoolTxHash, initPoolTxHash } = usePoolCreationStore();

  const poolDeploymentUrl = createPoolTxHash ? getBlockExplorerTxLink(sepolia.id, createPoolTxHash) : undefined;
  const poolInitializationUrl = initPoolTxHash ? getBlockExplorerTxLink(sepolia.id, initPoolTxHash) : undefined;

  const firstStep = {
    number: 1,
    label: "Deploy Pool",
    blockExplorerUrl: poolDeploymentUrl,
  };

  const approveOnTokenSteps: Step[] = tokenConfigs.map((token, idx) => {
    return {
      number: idx + 2,
      label: `Approve ${token?.tokenInfo?.symbol}`,
    };
  });

  //TODO figure this out
  // let swapIntoBoostedSteps;

  const approveOnPermit2Steps: Step[] = tokenConfigs.map((token, idx) => ({
    number: idx + tokenConfigs.length + 2,
    label: `Permit ${token?.tokenInfo?.symbol}`,
  }));

  const lastStep: Step = {
    number: approveOnPermit2Steps.length + approveOnTokenSteps.length + 2,
    label: "Initialize Pool",
    blockExplorerUrl: poolInitializationUrl,
  };

  const poolCreationSteps = [firstStep, ...approveOnTokenSteps, ...approveOnPermit2Steps, lastStep];

  return {
    poolCreationSteps,
    poolDeploymentUrl,
    poolInitializationUrl,
  };
}
