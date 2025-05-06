import { optimism, sepolia, sonic } from "viem/chains";
import { usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";
import { bgBeigeGradient, bgBeigeGradientHover, bgPrimaryGradient } from "~~/utils";

export const PoolCreatedView = ({ setIsModalOpen }: { setIsModalOpen: (isOpen: boolean) => void }) => {
  const { poolAddress, chain, clearPoolStore } = usePoolCreationStore();
  const { clearUserData } = useUserDataStore();

  const chainId = chain?.id;

  // Pools deployed to sepolia are only viewable on test.balancer.fi
  let baseURL = chainId === sepolia.id ? "https://test.balancer.fi" : "https://balancer.fi";

  // Pools deployed to sonic and optimism are only viewable on beets.fi
  if (chainId === sonic.id || chainId === optimism.id) baseURL = "https://beets.fi";

  let chainName = chain?.name.split(" ")[0].toLowerCase(); // V3 FE only uses single word for url paths so need to convert "Arbitrum One" (from wagmi) to "arbitrum" for the URL
  if (chainName === "op") chainName = "optimism"; // viem calls it "OP Mainnet" but path on beets.fi wants "optimism"

  const poolURL = `${baseURL}/pools/${chainName}/v3/${poolAddress}`;

  return (
    <div className="flex flex-col gap-4">
      <a href={poolURL} target="_blank" rel="noopener noreferrer" className="">
        <button className={`btn w-full rounded-xl text-lg ${bgBeigeGradient} ${bgBeigeGradientHover} text-neutral-700`}>
          <div>View on balancer.fi</div>
        </button>
      </a>

      <button
        onClick={() => {
          clearPoolStore();
          clearUserData();
          setIsModalOpen(false);
        }}
        className={`btn w-full rounded-xl text-lg ${bgPrimaryGradient} text-neutral-700`}
      >
        Create another pool
      </button>
    </div>
  );
};
