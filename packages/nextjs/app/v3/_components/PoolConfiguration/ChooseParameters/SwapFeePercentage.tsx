import { NumberParameterButton } from "./NumberParameterButton";
import { type HandleNumberInputChange } from "./types";
import { PoolType } from "@balancer/sdk";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { NumberInput } from "~~/components/common";
import { usePoolCreationStore } from "~~/hooks/v3";

export function SwapFeePercentage({ handleNumberInputChange }: { handleNumberInputChange: HandleNumberInputChange }) {
  const swapFeePercentages = ["0.1", "0.3", "1"];

  const { poolType, swapFeePercentage, updatePool } = usePoolCreationStore();

  let minSwapFeePercentage = 0.001; // Weighted & GyroECLP
  if (poolType === PoolType.Stable || poolType === PoolType.StableSurge) minSwapFeePercentage = 0.0001;
  if (poolType === PoolType.ReClamm) minSwapFeePercentage = 0.1;

  return (
    <div className="bg-base-100 p-5 rounded-xl">
      <a
        className="flex items-center gap-2 link no-underline hover:underline text-lg font-bold mb-3"
        href="https://docs.balancer.fi/developer-reference/contracts/vault-config.html"
        target="_blank"
        rel="noreferrer"
      >
        Swap fee percentage
        <ArrowTopRightOnSquareIcon className="w-5 h-5 mt-0.5" />
      </a>

      <div className="flex gap-2">
        {swapFeePercentages.map(fee => (
          <NumberParameterButton
            key={fee}
            value={fee}
            selectedValue={swapFeePercentage}
            onClick={() => updatePool({ swapFeePercentage: fee })}
            isPercentage={true}
          />
        ))}
        <div>
          <NumberInput
            placeholder={`${minSwapFeePercentage} - 10`}
            value={swapFeePercentage}
            onChange={e => handleNumberInputChange(e, "swapFeePercentage", minSwapFeePercentage, 10)}
            min={minSwapFeePercentage}
            max={10}
            step={minSwapFeePercentage}
            isPercentage={true}
          />
        </div>
      </div>
    </div>
  );
}
