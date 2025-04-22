import { useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { ArrowTopRightOnSquareIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { Alert, TextField } from "~~/components/common";
import { useEclpParamValidations, useEclpPoolChart } from "~~/hooks/gyro";
import { useTokenUsdValue } from "~~/hooks/token";
import { usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";
import { calculateRotationComponents } from "~~/utils/gryo";

export function EclpParams() {
  const { eclpParams, updateEclpParam } = usePoolCreationStore();
  const { alpha, beta, c, s, lambda, isTokenOrderInverted } = eclpParams;
  const { options } = useEclpPoolChart();
  const { updateUserData } = useUserDataStore();

  const handleTokenOrderInversion = () => {
    updateEclpParam({ isTokenOrderInverted: !isTokenOrderInverted });
    // reset both edit flags on price inversion to recalculate suggested eclp param values
    updateUserData({ hasEditedEclpParams: false, hasEditedEclpTokenUsdValues: false });
  };

  const { baseParamsError, derivedParamsError } = useEclpParamValidations({ alpha, beta, c, s, lambda });

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

      <div className="bg-base-300 p-5 rounded-lg mb-5 relative">
        <div className="bg-base-300 w-full h-72 rounded-lg">
          <ReactECharts option={options} style={{ height: "100%", width: "100%" }} />
          <div
            className="btn btn-sm rounded-lg absolute bottom-3 right-3 btn-primary px-2 py-0.5 text-neutral-700 bg-gradient-to-r from-violet-300 via-violet-200 to-orange-300  [box-shadow:0_0_10px_5px_rgba(139,92,246,0.5)] border-none"
            onClick={handleTokenOrderInversion}
          >
            <ArrowsRightLeftIcon className="w-[18px] h-[18px]" />
          </div>
        </div>
      </div>

      <ParamInputs />

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

function ParamInputs() {
  const { eclpParams, updateEclpParam, tokenConfigs } = usePoolCreationStore();
  const { alpha, beta, lambda, peakPrice, isTokenOrderInverted, usdValueToken0, usdValueToken1 } = eclpParams;
  const { updateUserData, hasEditedEclpTokenUsdValues } = useUserDataStore();

  const sanitizeNumberInput = (input: string) => {
    // Remove non-numeric characters except decimal point
    const sanitized = input.replace(/[^0-9.]/g, "");
    // Prevent multiple decimal points
    const parts = sanitized.split(".");
    return parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitized;
  };

  const sortedTokens = tokenConfigs
    .map(token => ({ address: token.address, symbol: token.tokenInfo?.symbol }))
    .sort((a, b) => a.address.localeCompare(b.address));

  if (isTokenOrderInverted) sortedTokens.reverse();

  const { tokenUsdValue: usdValueFromApiToken0 } = useTokenUsdValue(sortedTokens[0].address, "1");
  const { tokenUsdValue: usdValueFromApiToken1 } = useTokenUsdValue(sortedTokens[1].address, "1");

  useEffect(() => {
    if (!hasEditedEclpTokenUsdValues) {
      updateEclpParam({
        usdValueToken0: usdValueFromApiToken0?.toString() || "",
        usdValueToken1: usdValueFromApiToken1?.toString() || "",
      });
    }
  }, [usdValueFromApiToken0, usdValueFromApiToken1, updateEclpParam, hasEditedEclpTokenUsdValues]);

  return (
    <>
      <div className="flex flex-col gap-4 mt-3">
        <Alert type="eureka">Stretching factor controls concentration of liquidity around peak price</Alert>
        {(!usdValueToken0 || !usdValueToken1) && (
          <Alert type="warning">Enter USD values for both tokens to begin parameter configuration</Alert>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5 mt-5 mb-2">
        <TextField
          label={`${sortedTokens[0].symbol} Value`}
          value={usdValueToken0}
          isDollarValue={true}
          onChange={e => {
            updateEclpParam({ usdValueToken0: sanitizeNumberInput(e.target.value) });
            // hasEditedEclpParams flag controls re-calculation of suggested eclp param values
            // hasEditedEclpTokenUsdValues flag prevents price from being reset to API values after user edits it
            updateUserData({ hasEditedEclpParams: false, hasEditedEclpTokenUsdValues: true });
          }}
        />
        <TextField
          label={`${sortedTokens[1].symbol} Value`}
          value={usdValueToken1}
          isDollarValue={true}
          onChange={e => {
            updateEclpParam({ usdValueToken1: sanitizeNumberInput(e.target.value) });
            // hasEditedEclpParams flag controls re-calculation of suggested eclp param values
            // hasEditedEclpTokenUsdValues flag prevents price from being reset to API values after user edits it
            updateUserData({ hasEditedEclpParams: false, hasEditedEclpTokenUsdValues: true });
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
            const { c, s } = calculateRotationComponents(peakPrice);
            updateEclpParam({ c: c.toString(), s: s.toString() });
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
