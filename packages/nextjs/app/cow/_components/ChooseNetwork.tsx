import * as chains from "viem/chains";
import { useSwitchChain } from "wagmi";

export const ChooseNetwork = ({ options }: { options: chains.Chain[] }) => {
  const { switchChain } = useSwitchChain();

  return (
    <div className="bg-base-200 rounded-xl px-5 pt-5 pb-7 w-96">
      <div className="text-2xl text-center mb-4">Supported Networks</div>
      <div className="flex flex-col gap-3 px-5">
        {options.map(network => (
          <div
            key={network.id}
            onClick={() => {
              switchChain?.({ chainId: network.id });
            }}
            className="text-lg btn bg-base-100 w-full rounded-xl"
          >
            {network.name}
          </div>
        ))}
      </div>
    </div>
  );
};
