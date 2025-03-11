import React, { useState } from "react";
import { GyroECLPMath } from "@balancer-labs/balancer-maths";
import ReactECharts from "echarts-for-react";
import { formatUnits, parseUnits } from "viem";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { RadioInput, TextField } from "~~/components/common";
import { useEclpPoolChart } from "~~/hooks/gyro";
import { usePoolCreationStore } from "~~/hooks/v3";
import { bigIntSqrt } from "~~/utils/gyro/calcDerivedParams";

// TODO: figure out how to keep RotationVectorNormalized for slider and manual?
export function EclpParams() {
  const [useManualInputs, setUseManualInputs] = useState(true);

  const { options } = useEclpPoolChart();

  const test =
    (707106781186547524n * 707106781186547524n + 707106781186547524n * 707106781186547524n) / GyroECLPMath._ONE;

  console.log("test", GyroECLPMath._ONE - test);

  return (
    <div className="bg-base-100 p-5 rounded-xl">
      <div className="bg-base-300 p-5 rounded-lg mb-5">
        <a
          className="flex items-center gap-2 link no-underline hover:underline text-lg font-bold mb-3"
          href={"https://docs.gyro.finance/pools/e-clps#reading-e-clp-parameters"}
          target="_blank"
          rel="noreferrer"
        >
          E-CLP Parameters
          <ArrowTopRightOnSquareIcon className="w-5 h-5 mt-0.5" />
        </a>

        <div className="bg-base-300 w-full h-72 rounded-lg">
          <ReactECharts option={options} style={{ height: "100%", width: "100%" }} />
        </div>
      </div>

      <div className="mb-3 flex gap-2">
        <RadioInput
          name="eclp-params"
          label="Sliders"
          checked={!useManualInputs}
          onChange={() => setUseManualInputs(false)}
        />
        <RadioInput
          name="eclp-params"
          label="Manual"
          checked={useManualInputs}
          onChange={() => setUseManualInputs(true)}
        />
      </div>

      {useManualInputs ? <EclpManualInputs /> : <EclpRangeInputs />}
    </div>
  );
}

function EclpManualInputs() {
  const { eclpParams, updateEclpParam } = usePoolCreationStore();
  const { alpha, beta, s, c, lambda } = eclpParams;
  const enforceNumericValue = (value: string, param: keyof typeof eclpParams) => {
    if (value === "" || /^[0-9]+$/.test(value)) {
      updateEclpParam({ [param]: BigInt(value) });
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-5">
        <TextField
          label="alpha"
          value={alpha.toString()}
          onChange={e => enforceNumericValue(e.target.value, "alpha")}
        />
        <TextField label="beta" value={beta.toString()} onChange={e => enforceNumericValue(e.target.value, "beta")} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <TextField label="c" value={c.toString()} onChange={e => enforceNumericValue(e.target.value, "c")} />
          <TextField label="s" value={s.toString()} onChange={e => enforceNumericValue(e.target.value, "s")} />
        </div>
        <TextField
          label="lambda"
          value={lambda.toString()}
          onChange={e => enforceNumericValue(e.target.value, "lambda")}
        />
      </div>
    </>
  );
}

function EclpRangeInputs() {
  const { eclpParams, updateEclpParam } = usePoolCreationStore();
  const { alpha, beta, c, s, lambda } = eclpParams;

  // TODO: account for _ROTATION_VECTOR_NORM_ACCURACY range?
  // TODO: fix problem where RotationVectorNotNormalized() error always thrown after sliding c or s
  const enforceRotationVectorNormalized = (updatedParam: "c" | "s") => {
    // c^2 + s^2 = 1e18
    if (updatedParam === "c") {
      const cSquared = (c * c) / GyroECLPMath._ONE; // scale back down to 1e18
      const remainder = GyroECLPMath._ONE - cSquared;
      const normalizedS = bigIntSqrt(remainder) * parseUnits("1", 9); // scale back up to 18
      updateEclpParam({ s: normalizedS });
    } else if (updatedParam === "s") {
      const sSquared = (s * s) / GyroECLPMath._ONE; // scale back down to 1e18
      const remainder = GyroECLPMath._ONE - sSquared;
      const normalizedC = bigIntSqrt(remainder) * parseUnits("1", 9); // scale back up to 18
      updateEclpParam({ c: normalizedC });
    }
  };

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>, changedParam: "alpha" | "beta") => {
    if (changedParam === "alpha") {
      updateEclpParam({ alpha: BigInt(Number(e.target.value)) });
      if (alpha >= beta) {
        updateEclpParam({ beta: alpha + parseUnits("0.01", 18) });
      }
    } else if (changedParam === "beta") {
      updateEclpParam({ beta: BigInt(Number(e.target.value)) });
      if (beta <= alpha) {
        updateEclpParam({ alpha: beta - parseUnits("0.01", 18) });
      }
    }
  };

  return (
    <>
      <EclpRange
        label="alpha"
        value={alpha.toString()}
        min={parseUnits("0.9", 18).toString()}
        max={parseUnits("1.1", 18).toString()}
        step={parseUnits("0.001", 18).toString()}
        onChange={e => handlePriceRangeChange(e, "alpha")}
      />
      <EclpRange
        label="beta"
        value={beta.toString()}
        min={parseUnits("0.9", 18).toString()}
        max={parseUnits("1.1", 18).toString()}
        step={parseUnits("0.001", 18).toString()}
        onChange={e => handlePriceRangeChange(e, "beta")}
      />
      <EclpRange
        label="c"
        value={c.toString()}
        min="0"
        max={parseUnits("1", 18).toString()}
        step={parseUnits("0.001", 18).toString()} // 100 steps from 0 to 1e18
        onChange={e => {
          updateEclpParam({ c: BigInt(Number(e.target.value)) });
          enforceRotationVectorNormalized("c");
        }}
      />
      <EclpRange
        label="s"
        value={s.toString()}
        min="0"
        max={parseUnits("1", 18).toString()}
        step={parseUnits("0.001", 18).toString()} // 100 steps from 0 to 1e18
        onChange={e => {
          updateEclpParam({ s: BigInt(Number(e.target.value)) });
          enforceRotationVectorNormalized("s");
        }}
      />
      <EclpRange
        label="lambda"
        value={lambda.toString()}
        min="0"
        max={parseUnits("10000", 18).toString()} // max is actually _MAX_STRETCH_FACTOR but that is 1e26 which is too big for slider
        step={parseUnits("100", 18).toString()} // 10 steps from 0 to _MAX_STRETCH_FACTOR
        onChange={e => updateEclpParam({ lambda: BigInt(Number(e.target.value)) })}
      />
    </>
  );
}

function EclpRange({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: string;
  step: string;
  min: string;
  max: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="mb-2">
      <div className="flex justify-between">
        <div className="flex ml-2 mb-1 font-bold">{label}</div>
        <div>{formatUnits(BigInt(value), 18).toString()}</div>
      </div>
      <input type="range" step={step} min={min} max={max} value={value} onChange={onChange} className="range" />
    </div>
  );
}
