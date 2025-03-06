import { useMemo } from "react";
import { drawLiquidityECLP } from "./drawLiquidityECLP";
import { formatUnits } from "viem";
import { usePoolCreationStore } from "~~/hooks/v3";

export function useGetECLPLiquidityProfile() {
  const { eclpParams } = usePoolCreationStore();
  const { alpha, beta, s, c, lambda } = eclpParams;

  const data: [number, number][] | null = drawLiquidityECLP({
    alphaString: formatUnits(BigInt(alpha), 18),
    betaString: formatUnits(BigInt(beta), 18),
    sString: formatUnits(BigInt(s), 18),
    cString: formatUnits(BigInt(c), 18),
    lambdaString: formatUnits(BigInt(lambda), 18),
    tokenRateScalingFactorString: "1", // TODO: fetch getRate() from each token's rate provider?
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
