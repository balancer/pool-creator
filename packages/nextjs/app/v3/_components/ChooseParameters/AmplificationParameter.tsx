import { NumberParameterButton } from "./NumberParameterButton";
import { type HandleNumberInputChange } from "./types";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { NumberInput } from "~~/components/common";
import { usePoolCreationStore } from "~~/hooks/v3";

export function AmplificationParameter({
  handleNumberInputChange,
}: {
  handleNumberInputChange: HandleNumberInputChange;
}) {
  const amplificationParameters = ["10", "100", "1000"];

  const { amplificationParameter, updatePool } = usePoolCreationStore();

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
        {amplificationParameters.map(value => (
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
            placeholder="1 - 5000"
            value={amplificationParameter}
            onChange={e => handleNumberInputChange(e, "amplificationParameter", 0, 5000)}
            min={1}
            max={5000}
            step={1}
          />
        </div>
      </div>
    </div>
  );
}
