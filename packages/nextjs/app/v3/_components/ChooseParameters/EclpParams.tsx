import React, { useEffect, useState } from "react";
import { GyroECLPMath } from "@balancer-labs/balancer-maths";
import { calcDerivedParams } from "@balancer/sdk";
import ReactECharts from "echarts-for-react";
import { parseUnits } from "viem";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Alert, TextField } from "~~/components/common";
import { useEclpPoolChart } from "~~/hooks/gyro";
import { usePoolCreationStore } from "~~/hooks/v3";
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
  const [peakPrice, setPeakPrice] = useState("1");

  const { eclpParams, updateEclpParam } = usePoolCreationStore();
  const { alpha, beta, lambda } = eclpParams;

  const sanitizeNumberInput = (input: string) => {
    // Remove non-numeric characters except decimal point
    const sanitized = input.replace(/[^0-9.]/g, "");
    // Prevent multiple decimal points
    const parts = sanitized.split(".");
    return parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitized;
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-5 mb-3">
        <TextField
          label="Lowest Price"
          value={alpha.toString()}
          onChange={e => updateEclpParam({ alpha: sanitizeNumberInput(e.target.value) || "0" })}
        />
        <TextField
          label="Highest Price"
          value={beta.toString()}
          onChange={e => updateEclpParam({ beta: sanitizeNumberInput(e.target.value) || "0" })}
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <TextField
          label="Peak Price"
          value={peakPrice}
          onChange={e => {
            setPeakPrice(sanitizeNumberInput(e.target.value) || "0");
            const { c, s } = calculateRotationComponents(peakPrice);
            updateEclpParam({ c: c.toString(), s: s.toString() });
          }}
        />

        <TextField
          label="Stretching factor"
          value={lambda.toString()}
          onChange={e => updateEclpParam({ lambda: sanitizeNumberInput(e.target.value) || "0" })}
        />
      </div>
    </>
  );
}

// function EclpRangeInputs() {
//   const { eclpParams, updateEclpParam } = usePoolCreationStore();
//   const { c, s, lambda } = eclpParams;

//   // TODO: account for _ROTATION_VECTOR_NORM_ACCURACY range?
//   // TODO: fix problem where RotationVectorNotNormalized() error always thrown after sliding c or s
//   const enforceRotationVectorNormalized = (updatedParam: "c" | "s") => {
//     // c^2 + s^2 = 1e18

//     const rawC = parseUnits(c, 18);
//     const rawS = parseUnits(s, 18);

//     if (updatedParam === "c") {
//       const cSquared = (rawC * rawC) / GyroECLPMath._ONE; // scale back down to 1e18
//       const remainder = GyroECLPMath._ONE - cSquared;
//       const scaledRemainder = remainder * GyroECLPMath._ONE;
//       const normalizedS = new Big(scaledRemainder.toString()).sqrt().toFixed(0);
//       updateEclpParam({ s: formatUnits(BigInt(normalizedS), 18) });
//     } else if (updatedParam === "s") {
//       const sSquared = (rawS * rawS) / GyroECLPMath._ONE; // scale back down to 1e18
//       const remainder = GyroECLPMath._ONE - sSquared;
//       const scaledRemainder = remainder * GyroECLPMath._ONE;
//       const normalizedC = new Big(scaledRemainder.toString()).sqrt().toFixed(0);
//       updateEclpParam({ c: formatUnits(BigInt(normalizedC), 18) });
//     }
//   };

//   return (
//     <>
//       <EclpRange
//         label="c"
//         value={c}
//         min="0"
//         max="1"
//         step="0.001"
//         onChange={e => {
//           updateEclpParam({ c: e.target.value });
//           enforceRotationVectorNormalized("c");
//         }}
//       />
//       <EclpRange
//         label="s"
//         value={s}
//         min="0"
//         max="1"
//         step="0.001"
//         onChange={e => {
//           updateEclpParam({ s: e.target.value });
//           enforceRotationVectorNormalized("s");
//         }}
//       />
//       <EclpRange
//         label="lambda"
//         value={lambda}
//         min="0"
//         // max={formatUnits(GyroECLPMath._MAX_STRETCH_FACTOR, 18)} // actual max too big for slider
//         max={"100000"}
//         step="1000" // 10 steps from 0 to _MAX_STRETCH_FACTOR
//         onChange={e => {
//           updateEclpParam({ lambda: e.target.value });
//         }}
//       />
//     </>
//   );
// }

// function EclpRange({
//   label,
//   value,
//   min,
//   max,
//   step,
//   onChange,
// }: {
//   label: string;
//   value: string;
//   step: string;
//   min: string;
//   max: string;
//   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
// }) {
//   return (
//     <div className="mb-2">
//       <div className="flex justify-between">
//         <div className="flex ml-2 mb-1 font-bold">{label}</div>
//         <div>{value}</div>
//       </div>
//       <input type="range" step={step} min={min} max={max} value={value} onChange={onChange} className="range" />
//     </div>
//   );
// }
