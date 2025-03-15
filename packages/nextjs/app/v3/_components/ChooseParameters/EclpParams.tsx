import React, { useEffect, useState } from "react";
import { GyroECLPMath } from "@balancer-labs/balancer-maths";
import { calcDerivedParams } from "@balancer/sdk";
import ReactECharts from "echarts-for-react";
import { parseUnits } from "viem";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Alert, TextField } from "~~/components/common";
import { useEclpPoolChart } from "~~/hooks/gyro";
import { usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";
import { calculateRotationComponents } from "~~/utils/gryo";

export function EclpParams() {
  const [baseParamsErrorMessage, setBaseParamsErrorMessage] = useState<string | null>(null);
  const [derivedParamsErrorMessage, setDerivedParamsErrorMessage] = useState<string | null>(null);
  const { eclpParams } = usePoolCreationStore();
  const { alpha, beta, c, s, lambda } = eclpParams;
  const { options } = useEclpPoolChart();

  useEffect(() => {
    const rawEclpParams = {
      alpha: parseUnits(alpha, 18),
      beta: parseUnits(beta, 18),
      c: parseUnits(c, 18),
      s: parseUnits(s, 18),
      lambda: parseUnits(lambda, 18),
    };

    try {
      GyroECLPMath.validateParams(rawEclpParams);
      setBaseParamsErrorMessage(null);
    } catch (error) {
      if (error instanceof Error) {
        setBaseParamsErrorMessage(error.message);
      } else {
        setBaseParamsErrorMessage("An unknown error occurred");
      }
    }

    try {
      const derivedParams = calcDerivedParams(rawEclpParams);
      GyroECLPMath.validateDerivedParams(rawEclpParams, derivedParams);
      setDerivedParamsErrorMessage(null);
    } catch (error) {
      if (error instanceof Error) {
        setDerivedParamsErrorMessage(error.message);
      } else {
        setDerivedParamsErrorMessage("An unknown error occurred");
      }
    }
  }, [alpha, beta, c, s, lambda]);

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

      <div className="bg-base-300 p-5 rounded-lg mb-5">
        <div className="bg-base-300 w-full h-72 rounded-lg">
          <ReactECharts option={options} style={{ height: "100%", width: "100%" }} />
        </div>
      </div>

      <ParamInputs />

      {baseParamsErrorMessage && (
        <div className="mt-3">
          <Alert type="error">
            <b>Base Params Invalid:</b> {baseParamsErrorMessage}
          </Alert>
        </div>
      )}
      {derivedParamsErrorMessage && (
        <div className="mt-3">
          <Alert type="error">
            <b>Derived Params Invalid:</b> {derivedParamsErrorMessage}
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
