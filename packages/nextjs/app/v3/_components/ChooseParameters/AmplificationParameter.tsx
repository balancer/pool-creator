import { NumberParameterButton } from "./NumberParameterButton";
import { type HandleNumberInputChange } from "./types";
import { STABLE_POOL_CONSTRAINTS } from "@balancer/sdk";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { NumberInput } from "~~/components/common";
import { usePoolCreationStore } from "~~/hooks/v3";

export function AmplificationParameter({
  handleNumberInputChange,
}: {
  handleNumberInputChange: HandleNumberInputChange;
}) {
  const { amplificationParameter, updatePool } = usePoolCreationStore();

  const ampOptions = ["100", "1000", "10000"];
  const minAmp = Number(STABLE_POOL_CONSTRAINTS.MIN_AMP);
  const maxAmp = Number(STABLE_POOL_CONSTRAINTS.MAX_AMP);

  return (
    <div className="bg-base-100 p-5 rounded-xl">
      <div className="text-lg font-bold mb-3 inline-flex">
        <a
          className="flex items-center gap-2 link no-underline hover:underline"
          href="https://docs-v3.balancer.fi/developer-reference/contracts/vault-config.html#minimum-maximum-amplification-parameter"
          target="_blank"
          rel="noreferrer"
        >
          Amplification Parameter
          <ArrowTopRightOnSquareIcon className="w-5 h-5 mt-0.5" />
        </a>
      </div>

      <div className="flex gap-2 items-end">
        {ampOptions.map(value => (
          <NumberParameterButton
            key={value}
            value={value}
            selectedValue={amplificationParameter}
            onClick={() => updatePool({ amplificationParameter: value })}
            isPercentage={false}
          />
        ))}
        <div className="w-[135px]">
          <NumberInput
            placeholder={`${minAmp} - ${maxAmp}`}
            value={amplificationParameter}
            onChange={e => handleNumberInputChange(e, "amplificationParameter", minAmp, maxAmp)}
            step={1}
          />
        </div>
      </div>
    </div>
  );
}
