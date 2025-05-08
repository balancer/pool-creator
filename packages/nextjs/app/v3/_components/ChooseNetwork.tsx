import * as chains from "viem/chains";
import { useSwitchChain } from "wagmi";
import { usePoolCreationStore } from "~~/hooks/v3";

export const ChooseNetwork = ({ options }: { options: chains.Chain[] }) => {
  const { switchChain } = useSwitchChain();
  const { updatePool } = usePoolCreationStore();

  return (
    <div className="flex justify-center">
      <div className="bg-base-200 rounded-xl px-5 pt-5 pb-7 w-96">
        <div className="text-2xl text-center mb-4">Choose a Network</div>
        <div className="flex flex-col gap-4 px-5">
          {options.map(network => (
            <div
              key={network.id}
              onClick={() => {
                switchChain?.({ chainId: network.id });
                updatePool({ chain: network });
              }}
              className="text-xl btn btn-lg bg-base-100 w-full rounded-xl"
            >
              {network.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
