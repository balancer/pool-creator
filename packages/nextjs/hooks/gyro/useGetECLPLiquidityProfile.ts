import { useMemo } from "react";
import { drawLiquidityECLP } from "./drawLiquidityECLP";
import { usePoolCreationStore } from "~~/hooks/v3";

export function useGetECLPLiquidityProfile() {
  const { eclpParams } = usePoolCreationStore();
  const { alpha, beta, s, c, lambda } = eclpParams;

  const data: [number, number][] | null = drawLiquidityECLP({
    alphaString: alpha || "0",
    betaString: beta || "0",
    sString: s || "0",
    cString: c || "0",
    lambdaString: lambda || "0",
    tokenRateScalingFactorString: "1", // I think this is okay because current price calculation done in USD terms?
  });

  const xMin = useMemo(() => (data ? Math.min(...data.map(([x]) => x)) : 0), [data]);
  const xMax = useMemo(() => (data ? Math.max(...data.map(([x]) => x)) : 0), [data]);
  const yMax = useMemo(() => (data ? Math.max(...data.map(([, y]) => y)) : 0), [data]);

  return {
    data,
    xMin,
    xMax,
    yMax,
  };
}
