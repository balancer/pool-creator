import ReactECharts from "echarts-for-react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { Alert, NumberInput, TextField } from "~~/components/common";
import { useSortedTokenConfigs } from "~~/hooks/balancer";
import { useReclAmmChart } from "~~/hooks/reclamm/useReclammChart";
import { usePoolCreationStore } from "~~/hooks/v3";

export const ReClammParams = () => {
  const { reClammParams, updateReClammParam } = usePoolCreationStore();
  const sortedTokenConfigs = useSortedTokenConfigs();

  const {
    initialTargetPrice,
    initialMinPrice,
    initialMaxPrice,
    priceShiftDailyRate,
    centerednessMargin,
    initialBalanceA,
    usdPerTokenInputA,
    usdPerTokenInputB,
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

      <div className="flex flex-col gap-4">
        <Alert type="info">USD per token inputs are used to calculate the initial prices</Alert>

        <div className="grid grid-cols-2 gap-4">
          <TextField
            label={`${sortedTokenConfigs[0].tokenInfo?.symbol} / USD`}
            value={usdPerTokenInputA}
            isDollarValue={true}
            onChange={e => {
              updateReClammParam({ usdPerTokenInputA: sanitizeNumberInput(e.target.value) });
            }}
          />
          <TextField
            label={`${sortedTokenConfigs[1].tokenInfo?.symbol} / USD`}
            value={usdPerTokenInputB}
            isDollarValue={true}
            onChange={e => {
              updateReClammParam({ usdPerTokenInputB: sanitizeNumberInput(e.target.value) });
            }}
          />
        </div>
        <Alert type="info">
          Initial prices represent the value of {sortedTokenConfigs[0].tokenInfo?.symbol} denominated in{" "}
          {sortedTokenConfigs[1].tokenInfo?.symbol}
        </Alert>

        <div className="grid grid-cols-3 gap-4">
          <TextField
            label="Initial Min Price"
            value={initialMinPrice}
            onChange={e => updateReClammParam({ initialMinPrice: sanitizeNumberInput(e.target.value) })}
          />
          <TextField
            label="Initial Target Price"
            value={initialTargetPrice}
            onChange={e => updateReClammParam({ initialTargetPrice: sanitizeNumberInput(e.target.value) })}
          />
          <TextField
            label="Initial Max Price"
            value={initialMaxPrice}
            onChange={e => updateReClammParam({ initialMaxPrice: sanitizeNumberInput(e.target.value) })}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <NumberInput
            label="Centeredness Margin"
            min={0}
            max={100}
            isPercentage={true}
            value={centerednessMargin}
            placeholder="0 - 100"
            onChange={e => updateReClammParam({ centerednessMargin: sanitizeNumberInput(e.target.value) })}
          />
          <NumberInput
            label="Price Shift Daily Rate"
            min={0}
            max={300}
            isPercentage={true}
            value={priceShiftDailyRate}
            placeholder="0 - 300"
            onChange={e => updateReClammParam({ priceShiftDailyRate: sanitizeNumberInput(e.target.value) })}
          />
          <TextField
            label={`Initial Balance of ${sortedTokenConfigs[0].tokenInfo?.symbol}`}
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
