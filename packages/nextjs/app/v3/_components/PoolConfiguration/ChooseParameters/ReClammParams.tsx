import ReactECharts from "echarts-for-react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { TextField } from "~~/components/common";
import { useReclAmmChart } from "~~/hooks/reclamm/useReclammChart";
import { usePoolCreationStore } from "~~/hooks/v3";

export const ReClammParams = () => {
  const { reClammParams, updateReClammParam } = usePoolCreationStore();

  const {
    initialTargetPrice,
    initialMinPrice,
    initialMaxPrice,
    priceShiftDailyRate,
    centerednessMargin,
    initialBalanceA,
  } = reClammParams;

  const sanitizeNumberInput = (input: string) => {
    // Remove non-numeric characters except decimal point
    const sanitized = input.replace(/[^0-9.]/g, "");
    // Prevent decimal points
    const parts = sanitized.split(".");
    return parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitized;
  };

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

      <div className="bg-base-200 w-full h-96 rounded-xl mb-3">
        <ReClammChart />
      </div>

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-4">
          <TextField
            label="Initial Min Price"
            value={initialMinPrice}
            isDollarValue={true}
            onChange={e => updateReClammParam({ initialMinPrice: sanitizeNumberInput(e.target.value) })}
          />
          <TextField
            label="Initial Max Price"
            value={initialMaxPrice}
            isDollarValue={true}
            onChange={e => updateReClammParam({ initialMaxPrice: sanitizeNumberInput(e.target.value) })}
          />
          <TextField
            label="Initial Target Price"
            value={initialTargetPrice}
            isDollarValue={true}
            onChange={e => updateReClammParam({ initialTargetPrice: sanitizeNumberInput(e.target.value) })}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <TextField
            label="Price Shift Daily Rate"
            value={priceShiftDailyRate}
            onChange={e => updateReClammParam({ priceShiftDailyRate: sanitizeNumberInput(e.target.value) })}
          />
          <TextField
            label="Centeredness Margin"
            value={centerednessMargin}
            onChange={e => updateReClammParam({ centerednessMargin: sanitizeNumberInput(e.target.value) })}
          />
          <TextField
            label="Initial Balance A"
            value={initialBalanceA}
            onChange={e => updateReClammParam({ initialBalanceA: sanitizeNumberInput(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
};

function ReClammChart() {
  const { option } = useReclAmmChart();

  return <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />;
}
