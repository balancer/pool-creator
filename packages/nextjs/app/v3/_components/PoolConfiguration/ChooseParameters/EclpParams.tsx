import ReactECharts from "echarts-for-react";
import { ArrowTopRightOnSquareIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { Alert, TextField } from "~~/components/common";
import { useAutofillStarterParams, useEclpParamValidations, useEclpPoolChart, useEclpTokenOrder } from "~~/hooks/gyro";
import { usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";
import { calculateRotationComponents, invertEclpParams } from "~~/utils/gryo";

export function EclpParams() {
  const { eclpParams } = usePoolCreationStore();
  const { baseParamsError, derivedParamsError } = useEclpParamValidations(eclpParams);

  return (
    <div className="bg-base-100 p-5 rounded-xl">
      <a
        className="flex items-center gap-2 link no-underline hover:underline text-lg font-bold mb-3"
        href={"https://docs.gyro.finance/pools/e-clps#reading-e-clp-parameters"}
        target="_blank"
        rel="noreferrer"
      >
        E-CLP Parameters
        <ArrowTopRightOnSquareIcon className="w-5 h-5 mt-0.5" />
      </a>

      <EclpChartDisplay size="full" />
      <EclpParamInputs />

      {baseParamsError && (
        <div className="mt-3">
          <Alert type="error">
            <b>Base Params Invalid:</b> {baseParamsError}
          </Alert>
        </div>
      )}
      {derivedParamsError && (
        <div className="mt-3">
          <Alert type="error">
            <b>Derived Params Invalid:</b> {derivedParamsError}
          </Alert>
        </div>
      )}
    </div>
  );
}

export function EclpChartDisplay({ size }: { size: "full" | "mini" }) {
  const { options } = useEclpPoolChart();
  const { eclpParams, updateEclpParam } = usePoolCreationStore();

  const handleInvertEclpParams = () => {
    const { usdPerTokenInput0, usdPerTokenInput1, isEclpParamsInverted } = eclpParams;
    const invertedParams = invertEclpParams(eclpParams);

    // invert eclp params, flip inputs, and keep track of inverted state
    updateEclpParam({
      ...invertedParams,
      usdPerTokenInput0: usdPerTokenInput1,
      usdPerTokenInput1: usdPerTokenInput0,
      isEclpParamsInverted: !isEclpParamsInverted,
    });
  };

  return (
    <div className="bg-base-300 p-5 rounded-lg relative">
      <div className={`bg-base-300 w-full ${size === "full" && "h-72"} ${size === "mini" && "h-48"} rounded-lg`}>
        <ReactECharts option={options} style={{ height: "100%", width: "100%" }} />
        {size === "full" && (
          <div
            className="btn btn-sm rounded-lg absolute bottom-3 right-3 btn-primary px-2 py-0.5 text-neutral-700 bg-gradient-to-r from-violet-300 via-violet-200 to-orange-300  [box-shadow:0_0_10px_5px_rgba(139,92,246,0.5)] border-none"
            onClick={handleInvertEclpParams}
          >
            <ArrowsRightLeftIcon className="w-[18px] h-[18px]" />
          </div>
        )}
      </div>
    </div>
  );
}

function EclpParamInputs() {
  const { eclpParams, updateEclpParam } = usePoolCreationStore();
  const { alpha, beta, lambda, peakPrice, usdPerTokenInput0, usdPerTokenInput1 } = eclpParams;
  const { updateUserData } = useUserDataStore();
  const sortedTokens = useEclpTokenOrder();
  const tokenHasRateProvider = sortedTokens.some(token => token.underlyingTokenAddress);

  useAutofillStarterParams();

  const sanitizeNumberInput = (input: string) => {
    // Remove non-numeric characters except decimal point
    const sanitized = input.replace(/[^0-9.]/g, "");
    // Prevent decimal points
    const parts = sanitized.split(".");
    return parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitized;
  };

  return (
    <>
      <div className="flex flex-col gap-4 mt-3">
        {tokenHasRateProvider ? (
          <Alert type="warning">For yield bearing assets, you set the USD value for the underlying token</Alert>
        ) : (
          <Alert type="eureka">Stretching factor controls depth of liquidity around peak price</Alert>
        )}
        {(!usdPerTokenInput0 || !usdPerTokenInput1) && (
          <Alert type="warning">Enter USD values for both tokens to begin parameter configuration</Alert>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5 mt-5 mb-2">
        <TextField
          label={`${sortedTokens[0].symbol} / USD`}
          value={usdPerTokenInput0}
          isDollarValue={true}
          onChange={e => {
            updateEclpParam({ usdPerTokenInput0: sanitizeNumberInput(e.target.value) });
            // if user changes usd price per token, this triggers useAutofillStarterParams hook to move params to surround new "current price" of pool
            if (usdPerTokenInput0 !== e.target.value) updateUserData({ hasEditedEclpParams: false });
          }}
        />
        <TextField
          label={`${sortedTokens[1].symbol} / USD`}
          value={usdPerTokenInput1}
          isDollarValue={true}
          onChange={e => {
            updateEclpParam({ usdPerTokenInput1: sanitizeNumberInput(e.target.value) });
            // if user changes usd price per token, this triggers useAutofillStarterParams hook to move params to surround new "current price" of pool
            if (usdPerTokenInput1 !== e.target.value) updateUserData({ hasEditedEclpParams: false });
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-5 mb-2">
        <TextField
          label="Lowest Price"
          value={alpha.toString()}
          onChange={e => {
            updateEclpParam({ alpha: sanitizeNumberInput(e.target.value) });
            updateUserData({ hasEditedEclpParams: true });
          }}
        />
        <TextField
          label="Highest Price"
          value={beta.toString()}
          onChange={e => {
            updateEclpParam({ beta: sanitizeNumberInput(e.target.value) });
            updateUserData({ hasEditedEclpParams: true });
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <TextField
          label="Peak Price"
          value={peakPrice}
          onChange={e => {
            updateEclpParam({ peakPrice: sanitizeNumberInput(e.target.value) });
            const { c, s } = calculateRotationComponents(sanitizeNumberInput(e.target.value));
            updateEclpParam({ c, s });
            updateUserData({ hasEditedEclpParams: true });
          }}
        />
        <TextField
          label="Stretching Factor"
          value={lambda.toString()}
          onChange={e => {
            updateEclpParam({ lambda: sanitizeNumberInput(e.target.value) });
            updateUserData({ hasEditedEclpParams: true });
          }}
        />
      </div>
    </>
  );
}
