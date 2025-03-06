import { useMemo } from "react";
import { drawLiquidityECLP } from "./drawLiquidityECLP";
import { formatUnits } from "viem";

export function useGetECLPLiquidityProfile() {
  const data: [number, number][] | null = drawLiquidityECLP({
    alphaString: formatUnits(BigInt("998502246630054917"), 18),
    betaString: formatUnits(BigInt("1000200040008001600"), 18),
    sString: formatUnits(BigInt("707106781186547524"), 18),
    cString: formatUnits(BigInt("707106781186547524"), 18),
    lambdaString: formatUnits(BigInt("4000000000000000000000"), 18), // why 18? contract says 26?!
    tokenRateScalingFactorString: "1", // TODO: fetch getRate() from each token's rate provider?
  });

  const xMin = useMemo(() => (data ? Math.min(...data.map(([x]) => x)) : 0), [data]);
  const xMax = useMemo(() => (data ? Math.max(...data.map(([x]) => x)) : 0), [data]);
  //const yMin = useMemo(() => (data ? Math.min(...data.map(([, y]) => y)) : 0), [data])
  const yMax = useMemo(() => (data ? Math.max(...data.map(([, y]) => y)) : 0), [data]);

  console.log("data", data);

  return {
    data,
    xMin,
    xMax,
    yMax,
  };
}
