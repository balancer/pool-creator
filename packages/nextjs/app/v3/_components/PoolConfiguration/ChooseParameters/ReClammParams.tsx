import ReactECharts from "echarts-for-react";
import { formatUnits } from "viem";
import { ArrowTopRightOnSquareIcon, ArrowsRightLeftIcon } from "@heroicons/react/20/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { NumberInput, TextField } from "~~/components/common";
import { useReclAmmChart } from "~~/hooks/reclamm/useReclammChart";
// import { useTokenUsdValue } from "~~/hooks/token";
import { useFetchTokenRate, usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";

export const ReClammParams = () => {
  const { reClammParams, updateReClammParam, tokenConfigs } = usePoolCreationStore();

  const { updateUserData } = useUserDataStore();
  const {
    initialTargetPrice,
    initialMinPrice,
    initialMaxPrice,
    dailyPriceShiftExponent,
    centerednessMargin,
    // initialBalanceA,
    usdPerTokenInputA,
    usdPerTokenInputB,
    // tokenAPriceIncludesRate,
    // tokenBPriceIncludesRate,
  } = reClammParams;

  const { data: currentRateTokenA } = useFetchTokenRate(tokenConfigs[0].rateProvider);
  const { data: currentRateTokenB } = useFetchTokenRate(tokenConfigs[1].rateProvider);
  // const { tokenUsdValue: usdPerTokenA } = useTokenUsdValue(tokenConfigs[0].address, "1");
  // const { tokenUsdValue: usdPerTokenB } = useTokenUsdValue(tokenConfigs[1].address, "1");

  const sanitizeNumberInput = (input: string) => {
    // Remove non-numeric characters except decimal point
    const sanitized = input.replace(/[^0-9.]/g, "");
    // Prevent decimal points
    const parts = sanitized.split(".");
    return parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitized;
  };

  const humanRateA = currentRateTokenA && Number(formatUnits(currentRateTokenA, 18));
  const humanRateB = currentRateTokenB && Number(formatUnits(currentRateTokenB, 18));

  const isBoostedA = !!currentRateTokenA;
  const isBoostedB = !!currentRateTokenB;

  const boostedLabelA = isBoostedA ? `without rate` : "";
  const boostedLabelB = currentRateTokenB ? `without rate` : "";

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
          <div className="relative">
            <TextField
              label={`${tokenConfigs[0].tokenInfo?.symbol} price ${boostedLabelA}`}
              tooltip={
                isBoostedA && (
                  <div
                    className="tooltip hover:cursor-pointer tooltip-primary"
                    data-tip={`${tokenConfigs[0].tokenInfo?.symbol} rate is ${humanRateA}`}
                  >
                    <InformationCircleIcon className="w-5 h-5" />
                  </div>
                )
              }
              value={usdPerTokenInputA}
              isDollarValue={true}
              onChange={e => {
                updateReClammParam({ usdPerTokenInputA: sanitizeNumberInput(e.target.value) });
                // if user changes usd price per token, this triggers useInitialPricingParams hook to move price params to surround new "current price" of pool
                if (usdPerTokenInputA !== e.target.value) updateUserData({ hasEditedReclammParams: false });
              }}
            />
            {/* {!!currentRateTokenA && (
              <TogglePriceIncludesRate
                tokenPriceIncludesRate={tokenAPriceIncludesRate}
                onChange={() => {
                  const updatedTokenAPriceIncludesRate = !tokenAPriceIncludesRate;
                  const updatedUsdPerTokenA = usdPerTokenA
                    ? updatedTokenAPriceIncludesRate
                      ? (usdPerTokenA / Number(formatUnits(currentRateTokenA, 18))).toString()
                      : usdPerTokenA.toString()
                    : usdPerTokenInputA;

                  updateReClammParam({
                    tokenAPriceIncludesRate: updatedTokenAPriceIncludesRate,
                    usdPerTokenInputA: updatedUsdPerTokenA,
                  });
                }}
              />
            )} */}
          </div>
          <div className="relative">
            <TextField
              label={`${tokenConfigs[1].tokenInfo?.symbol} price ${boostedLabelB}`}
              value={usdPerTokenInputB}
              isDollarValue={true}
              tooltip={
                isBoostedB && (
                  <div
                    className="tooltip hover:cursor-pointer tooltip-primary"
                    data-tip={`${tokenConfigs[1].tokenInfo?.symbol} rate is ${humanRateB}`}
                  >
                    <InformationCircleIcon className="w-5 h-5" />
                  </div>
                )
              }
              onChange={e => {
                updateReClammParam({ usdPerTokenInputB: sanitizeNumberInput(e.target.value) });
                // if user changes usd price per token, this triggers useInitialPricingParams hook to move price params to surround new "current price" of pool
                if (usdPerTokenInputB !== e.target.value) updateUserData({ hasEditedReclammParams: false });
              }}
            />
            {/* {!!currentRateTokenB && (
              <TogglePriceIncludesRate
                tokenPriceIncludesRate={tokenBPriceIncludesRate}
                onChange={() => {
                  const updatedTokenBPriceIncludesRate = !tokenBPriceIncludesRate;
                  const updatedUsdPerTokenB = usdPerTokenB
                    ? updatedTokenBPriceIncludesRate
                      ? (usdPerTokenB / Number(formatUnits(currentRateTokenB, 18))).toString()
                      : usdPerTokenB.toString()
                    : usdPerTokenInputB;

                  updateReClammParam({
                    tokenBPriceIncludesRate: updatedTokenBPriceIncludesRate,
                    usdPerTokenInputB: updatedUsdPerTokenB,
                  });
                }}
              />
            )} */}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <TextField
            label="Initial Min Price"
            value={initialMinPrice}
            onChange={e => {
              updateReClammParam({ initialMinPrice: sanitizeNumberInput(e.target.value) });
              updateUserData({ hasEditedReclammParams: true });
            }}
          />
          <TextField
            label="Initial Target Price"
            value={initialTargetPrice}
            onChange={e => {
              updateReClammParam({ initialTargetPrice: sanitizeNumberInput(e.target.value) });
              updateUserData({ hasEditedReclammParams: true });
            }}
          />
          <TextField
            label="Initial Max Price"
            value={initialMaxPrice}
            onChange={e => {
              updateReClammParam({ initialMaxPrice: sanitizeNumberInput(e.target.value) });
              updateUserData({ hasEditedReclammParams: true });
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            label="Centeredness Margin"
            min={0}
            max={90}
            isPercentage={true}
            value={centerednessMargin}
            placeholder="0 - 90"
            onChange={e => {
              updateReClammParam({ centerednessMargin: sanitizeNumberInput(e.target.value) });
            }}
          />
          <NumberInput
            label="Daily Price Shift Exponent"
            min={0}
            max={100}
            isPercentage={true}
            value={dailyPriceShiftExponent}
            placeholder="0 - 100"
            onChange={e => {
              updateReClammParam({ dailyPriceShiftExponent: sanitizeNumberInput(e.target.value) });
            }}
          />
        </div>
      </div>
    </div>
  );
};

function ReClammChart() {
  const { options } = useReclAmmChart();

  const { tokenConfigs, updatePool, updateReClammParam, reClammParams } = usePoolCreationStore();

  // TODO: make re-usable invert function to share with usePoolTypeSpecificParams
  const handleInvertReClammParams = () => {
    const {
      initialTargetPrice,
      initialMinPrice,
      initialMaxPrice,
      usdPerTokenInputA,
      usdPerTokenInputB,
      tokenAPriceIncludesRate,
      tokenBPriceIncludesRate,
    } = reClammParams;

    updateReClammParam({
      initialTargetPrice: (1 / Number(initialTargetPrice)).toString(),
      initialMinPrice: (1 / Number(initialMaxPrice)).toString(),
      initialMaxPrice: (1 / Number(initialMinPrice)).toString(),
      usdPerTokenInputA: usdPerTokenInputB,
      usdPerTokenInputB: usdPerTokenInputA,
      tokenAPriceIncludesRate: tokenBPriceIncludesRate,
      tokenBPriceIncludesRate: tokenAPriceIncludesRate,
    });
    updatePool({ tokenConfigs: [...tokenConfigs].reverse() });
  };

  return (
    <div className="bg-base-300 rounded-xl relative">
      <div className="bg-base-200 w-full h-72 rounded-xl mb-4">
        <ReactECharts option={options} style={{ height: "100%", width: "100%" }} />
        <div
          className="btn btn-sm rounded-lg absolute top-2 right-3 btn-primary px-2 py-0.5 text-neutral-700 bg-gradient-to-r from-violet-300 via-violet-200 to-orange-300  [box-shadow:0_0_10px_5px_rgba(139,92,246,0.5)] border-none"
          onClick={handleInvertReClammParams}
        >
          <ArrowsRightLeftIcon className="w-[15px] h-[15px]" />
        </div>
      </div>
    </div>
  );
}

// function TogglePriceIncludesRate({
//   tokenPriceIncludesRate,
//   onChange,
// }: {
//   tokenPriceIncludesRate: boolean;
//   onChange: () => void;
// }) {
//   return (
//     <div className="absolute -top-2 right-0">
//       <fieldset className="fieldset ">
//         <label className="label cursor-pointer gap-2">
//           <span className={`label-text ${tokenPriceIncludesRate ? "text-success" : "text-stone-400"}`}>
//             {tokenPriceIncludesRate ? "price includes rate" : "price without rate"}
//           </span>
//           <input
//             type="checkbox"
//             checked={tokenPriceIncludesRate}
//             onChange={onChange}
//             className={`toggle toggle-sm ${tokenPriceIncludesRate ? "toggle-success" : "toggle-error"}`}
//           />
//         </label>
//       </fieldset>
//     </div>
//   );
// }
