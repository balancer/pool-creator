import ReactECharts from "echarts-for-react";
import { formatUnits, parseUnits } from "viem";
import { ArrowTopRightOnSquareIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { Alert, TextField } from "~~/components/common";
import { useAutofillStarterParams, useEclpParamValidations, useEclpPoolChart } from "~~/hooks/gyro";
import { useFetchTokenRate, usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";
import { calculateRotationComponents, formatEclpParamValues } from "~~/utils/gryo";
import { truncateNumber } from "~~/utils/helpers";

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
  const { eclpParams, updateEclpParam, updatePool, tokenConfigs } = usePoolCreationStore();

  /**
   * SDK handles un-inversion for on chain call,
   * so we just want to:
   * 1. flip the tokenConfig order in pool creation store
   * 2. invert the eclp params
   * 3. make sure all parts of app rely on order of tokens in tokenConfigs
   */
  const handleInvertEclpParams = () => {
    const D18 = 10n ** 18n;

    const { alpha, beta, peakPrice, c, s, lambda, usdPerTokenInput0, usdPerTokenInput1 } = eclpParams;

    // take reciprocal and flip alpha to beta
    const invertedAlpha = Number(formatUnits((D18 * D18) / parseUnits(beta, 18), 18));
    // take reciprocal and flip beta to alpha
    const invertedBeta = Number(formatUnits((D18 * D18) / parseUnits(alpha, 18), 18));
    // take reciprocal of peakPrice
    const invertedPeakPrice = Number(formatUnits((D18 * D18) / parseUnits(peakPrice, 18), 18));

    const invertedParams = {
      alpha: formatEclpParamValues(invertedAlpha),
      beta: formatEclpParamValues(invertedBeta),
      peakPrice: formatEclpParamValues(invertedPeakPrice),
      c: s, // flip c and s
      s: c, // flip s and c
      usdPerTokenInput0: usdPerTokenInput1,
      usdPerTokenInput1: usdPerTokenInput0,
      lambda, // stays the same
    };

    updateEclpParam(invertedParams);
    updatePool({ tokenConfigs: [...tokenConfigs].reverse() });
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
  const { eclpParams, updateEclpParam, tokenConfigs } = usePoolCreationStore();
  const { alpha, beta, lambda, peakPrice, usdPerTokenInput0, usdPerTokenInput1 } = eclpParams;
  const { updateUserData } = useUserDataStore();
  const hasRateProvider = tokenConfigs.some(token => token.rateProvider);

  useAutofillStarterParams();

  const sanitizeNumberInput = (input: string) => {
    // Remove non-numeric characters except decimal point
    const sanitized = input.replace(/[^0-9.]/g, "");
    // Prevent decimal points
    const parts = sanitized.split(".");
    return parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitized;
  };

  const rateProviderToken0 = tokenConfigs[0].rateProvider;
  const rateProviderToken1 = tokenConfigs[1].rateProvider;
  const { data: rateProviderToken0Rate } = useFetchTokenRate(rateProviderToken0);
  const { data: rateProviderToken1Rate } = useFetchTokenRate(rateProviderToken1);

  const usdPerToken0 = rateProviderToken0Rate
    ? Number(usdPerTokenInput0) * Number(formatUnits(rateProviderToken0Rate, 18))
    : Number(usdPerTokenInput0);
  const usdPerToken1 = rateProviderToken1Rate
    ? Number(usdPerTokenInput1) * Number(formatUnits(rateProviderToken1Rate, 18))
    : Number(usdPerTokenInput1);

  return (
    <>
      <div className="flex flex-col gap-4 mt-3">
        {hasRateProvider ? (
          <Alert type="info">Price bound parameters are based on rate adjusted USD value inputs</Alert>
        ) : (
          <Alert type="eureka">Stretching factor controls depth of liquidity around peak price</Alert>
        )}
        {(!usdPerTokenInput0 || !usdPerTokenInput1) && (
          <Alert type="warning">Enter USD values for both tokens to begin parameter configuration</Alert>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5 mt-5 mb-2">
        <TextField
          label={`${tokenConfigs[0].tokenInfo?.symbol} / USD`}
          value={usdPerTokenInput0}
          isDollarValue={true}
          usdPerToken={rateProviderToken0Rate ? truncateNumber(usdPerToken0) : undefined}
          onChange={e => {
            updateEclpParam({ usdPerTokenInput0: sanitizeNumberInput(e.target.value) });
            // if user changes usd price per token, this triggers useAutofillStarterParams hook to move params to surround new "current price" of pool
            if (usdPerTokenInput0 !== e.target.value) updateUserData({ hasEditedEclpParams: false });
          }}
        />
        <TextField
          label={`${tokenConfigs[1].tokenInfo?.symbol} / USD`}
          value={usdPerTokenInput1}
          isDollarValue={true}
          usdPerToken={rateProviderToken1Rate ? truncateNumber(usdPerToken1) : undefined}
          onChange={e => {
            updateEclpParam({ usdPerTokenInput1: sanitizeNumberInput(e.target.value) });
            // if user changes usd price per token, this triggers useAutofillStarterParams hook to move params to surround new "current price" of pool
            if (usdPerTokenInput1 !== e.target.value) updateUserData({ hasEditedEclpParams: false });
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-5 mb-2">
        <TextField
          label="Lower Bound"
          value={alpha.toString()}
          onChange={e => {
            updateEclpParam({ alpha: sanitizeNumberInput(e.target.value) });
            updateUserData({ hasEditedEclpParams: true });
          }}
        />
        <TextField
          label="Upper Bound"
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
