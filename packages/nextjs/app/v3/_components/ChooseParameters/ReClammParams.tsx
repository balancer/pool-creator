import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { TextField } from "~~/components/common";
import { usePoolCreationStore } from "~~/hooks/v3";

export const ReClammParams = () => {
  const { reClammParams, updateReClammParam } = usePoolCreationStore();

  const { initialTargetPrice, initialMinPrice, initialMaxPrice, priceShiftDailyRate, centerednessMargin } =
    reClammParams;
  return (
    <div className="bg-base-100 p-5 rounded-xl">
      <div className="text-lg font-bold mb-3 inline-flex">
        <a
          className="flex items-center gap-2 link no-underline hover:underline"
          href="https://github.com/balancer/reclamm/blob/b83104394eb4863f819636ab9615d8f147bc4b91/contracts/ReClammPoolFactory.sol#L45-L49"
          target="_blank"
          rel="noreferrer"
        >
          Readjusting parameters
          <ArrowTopRightOnSquareIcon className="w-5 h-5 mt-0.5" />
        </a>
      </div>

      <div className="bg-base-200 w-full h-72 rounded-xl mb-3"></div>

      <div className="flex flex-col gap-5">
        <TextField
          label="Initial Target Price"
          value={initialTargetPrice}
          onChange={e => updateReClammParam({ initialTargetPrice: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Initial Min Price"
            value={initialMinPrice}
            onChange={e => updateReClammParam({ initialMinPrice: e.target.value })}
          />
          <TextField
            label="Initial Max Price"
            value={initialMaxPrice}
            onChange={e => updateReClammParam({ initialMaxPrice: e.target.value })}
          />
          <TextField
            label="Price Shift Daily Rate"
            value={priceShiftDailyRate}
            onChange={e => updateReClammParam({ priceShiftDailyRate: e.target.value })}
          />
          <TextField
            label="Centeredness Margin"
            value={centerednessMargin}
            onChange={e => updateReClammParam({ centerednessMargin: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};
