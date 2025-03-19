import ReactECharts from "echarts-for-react";
import { ArrowTopRightOnSquareIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { Alert, TextField } from "~~/components/common";
import { useEclpParamValidations, useEclpPoolChart } from "~~/hooks/gyro";
import { usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";
import { calculateRotationComponents } from "~~/utils/gryo";

export function EclpParams() {
  const { eclpParams, updateEclpParam } = usePoolCreationStore();
  const { alpha, beta, c, s, lambda, isTokenOrderInverted } = eclpParams;
  const { options } = useEclpPoolChart();
  const { updateUserData } = useUserDataStore();

  const handleTokenOrderInversion = () => {
    updateEclpParam({ isTokenOrderInverted: !isTokenOrderInverted });
    updateUserData({ hasEditedEclpParams: false }); // reset edited flag so suggested eclp param values are recalculated
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
  const { eclpParams, updateEclpParam } = usePoolCreationStore();
  const { alpha, beta, lambda, peakPrice } = eclpParams;
  const { updateUserData } = useUserDataStore();

  const sanitizeNumberInput = (input: string) => {
    // Remove non-numeric characters except decimal point
    const sanitized = input.replace(/[^0-9.]/g, "");
    // Prevent multiple decimal points
    const parts = sanitized.split(".");
    return parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitized;
  };

  return (
    <>
      <Alert type="info">Stretching factor controls concentration of liquidity around peak price</Alert>
      <div className="grid grid-cols-2 gap-5 mt-5 mb-3">
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
          label="Stretching factor"
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
