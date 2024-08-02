import { Dispatch, SetStateAction, useEffect } from "react";
import { Address } from "viem";
import { useScaffoldEventHistory, useScaffoldWatchContractEvent } from "~~/hooks/scaffold-eth";

export const useNewPoolEvents = (
  connectedAddress: Address | undefined,
  setUserPoolAddress: Dispatch<SetStateAction<Address | undefined>>,
) => {
  const { data: events, isLoading: isLoadingEvents } = useScaffoldEventHistory({
    contractName: "BCoWFactory",
    eventName: "LOG_NEW_POOL",
    fromBlock: 6415186n,
    watch: true,
    filters: { caller: connectedAddress },
  });

  useScaffoldWatchContractEvent({
    contractName: "BCoWFactory",
    eventName: "LOG_NEW_POOL",
    onLogs: logs => {
      logs.forEach(log => {
        const { bPool, caller } = log.args;
        if (bPool && caller == connectedAddress) {
          console.log("useScaffoldWatchContractEvent: LOG_NEW_POOL", { bPool, caller });
          setUserPoolAddress(bPool);
        }
      });
    },
  });

  useEffect(() => {
    if (!isLoadingEvents && events) {
      const pools = events.map(e => e.args.bPool).filter((pool): pool is string => pool !== undefined);
      const mostRecentlyCreated = pools[0];
      setUserPoolAddress(mostRecentlyCreated);
    }
  }, [isLoadingEvents, events, setUserPoolAddress]);
};
