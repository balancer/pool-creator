import { useEffect, useState } from "react";
import { GyroECLPMath } from "@balancer-labs/balancer-maths";
import { calcDerivedParams } from "@balancer/sdk";
import { parseUnits } from "viem";

export function useEclpParamValidations(params: { alpha: string; beta: string; c: string; s: string; lambda: string }) {
  const { alpha, beta, c, s, lambda } = params;
  const [baseParamsError, setBaseParamsError] = useState<string | null>(null);
  const [derivedParamsError, setDerivedParamsError] = useState<string | null>(null);

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
      setBaseParamsError(null);
    } catch (error) {
      if (error instanceof Error) {
        setBaseParamsError(error.message);
      } else {
        setBaseParamsError("An unknown error occurred");
      }
    }

    try {
      const derivedParams = calcDerivedParams(rawEclpParams);
      GyroECLPMath.validateDerivedParams(rawEclpParams, derivedParams);
      setDerivedParamsError(null);
    } catch (error) {
      if (error instanceof Error) {
        setDerivedParamsError(error.message);
      } else {
        setDerivedParamsError("An unknown error occurred");
      }
    }
  }, [alpha, beta, c, s, lambda]);

  return {
    baseParamsError,
    derivedParamsError,
  };
}
