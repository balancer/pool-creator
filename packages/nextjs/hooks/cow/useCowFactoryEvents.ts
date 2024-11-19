import { useEffect } from "react";
import { useAccount } from "wagmi";
import externalContracts from "~~/contracts/externalContracts";
import { usePoolCreationStore } from "~~/hooks/cow/usePoolCreationStore";
import { useScaffoldEventHistory, useTargetNetwork } from "~~/hooks/scaffold-eth";

export const useCowFactoryEvents = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const { updatePoolCreation } = usePoolCreationStore();

  const { data: events, isLoading: isLoadingEvents } = useScaffoldEventHistory({
    contractName: "BCoWFactory",
    eventName: "LOG_NEW_POOL",
    fromBlock: externalContracts[targetNetwork.id as keyof typeof externalContracts].BCoWFactory.fromBlock,
    watch: true,
    filters: { caller: connectedAddress },
  });

  useEffect(() => {
    if (!isLoadingEvents && events) {
      const pools = events.map(e => e.args.bPool).filter((pool): pool is string => pool !== undefined);
      // zero index is the most recently created pool for the user
      const mostRecentlyCreated = pools[0];
      updatePoolCreation({ address: mostRecentlyCreated });
    }
  }, [isLoadingEvents, events, updatePoolCreation]);
};
