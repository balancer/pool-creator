import ReactECharts from "echarts-for-react";
import { ArrowTopRightOnSquareIcon, ArrowsRightLeftIcon } from "@heroicons/react/20/solid";
import { NumberInput, TextField } from "~~/components/common";
import { useReclAmmChart } from "~~/hooks/reclamm/useReclammChart";
import { usePoolCreationStore } from "~~/hooks/v3";

export const ReClammParams = () => {
  const { reClammParams, updateReClammParam, tokenConfigs } = usePoolCreationStore();

  const {
    initialTargetPrice,
    initialMinPrice,
    initialMaxPrice,
    dailyPriceShiftExponent,
    centerednessMargin,
    // initialBalanceA,
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

      <ReClammChart />

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label={`${tokenConfigs[0].tokenInfo?.symbol} / USD`}
            value={usdPerTokenInputA}
            isDollarValue={true}
            onChange={e => {
              updateReClammParam({ usdPerTokenInputA: sanitizeNumberInput(e.target.value) });
            }}
          />
          <TextField
            label={`${tokenConfigs[1].tokenInfo?.symbol} / USD`}
            value={usdPerTokenInputB}
            isDollarValue={true}
            onChange={e => {
              updateReClammParam({ usdPerTokenInputB: sanitizeNumberInput(e.target.value) });
            }}
          />
        </div>

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
        <div className="grid grid-cols-2 gap-4">
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
            label="Daily Price Shift Exponent"
            min={0}
            max={300}
            isPercentage={true}
            value={dailyPriceShiftExponent}
            placeholder="0 - 300"
            onChange={e => updateReClammParam({ dailyPriceShiftExponent: sanitizeNumberInput(e.target.value) })}
          />
          {/* <TextField
            label={`Initial Balance of ${tokenConfigs[0].tokenInfo?.symbol}`}
            value={initialBalanceA}
            onChange={e => updateReClammParam({ initialBalanceA: sanitizeNumberInput(e.target.value) })}
          /> */}
        </div>
      </div>
    </div>
  );
};

function ReClammChart() {
  const { options } = useReclAmmChart();

  const { tokenConfigs, updatePool, updateReClammParam, reClammParams } = usePoolCreationStore();

  const handleInvertReClammParams = () => {
    const { initialTargetPrice, initialMinPrice, initialMaxPrice, usdPerTokenInputA, usdPerTokenInputB } =
      reClammParams;

    updateReClammParam({
      initialTargetPrice: (1 / Number(initialTargetPrice)).toString(),
      initialMinPrice: (1 / Number(initialMaxPrice)).toString(),
      initialMaxPrice: (1 / Number(initialMinPrice)).toString(),
      usdPerTokenInputA: usdPerTokenInputB,
      usdPerTokenInputB: usdPerTokenInputA,
    });
    updatePool({ tokenConfigs: [...tokenConfigs].reverse() });
  };

  return (
    <div className="bg-base-300 rounded-lg relative">
      <div className="bg-base-200 w-full h-72 rounded-xl mb-4">
        <ReactECharts option={options} style={{ height: "100%", width: "100%" }} />
        <div
          className="btn btn-sm rounded-lg absolute bottom-3 right-3 btn-primary px-2 py-0.5 text-neutral-700 bg-gradient-to-r from-violet-300 via-violet-200 to-orange-300  [box-shadow:0_0_10px_5px_rgba(139,92,246,0.5)] border-none"
          onClick={handleInvertReClammParams}
        >
          <ArrowsRightLeftIcon className="w-[15px] h-[15px]" />
        </div>
      </div>
    </div>
  );
}
