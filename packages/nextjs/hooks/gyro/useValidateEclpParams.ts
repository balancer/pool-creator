import { useEffect, useState } from "react";
import { usePoolCreationStore } from "../v3";
import { GyroECLPMath } from "@balancer-labs/balancer-maths";
import { calcDerivedParams } from "@balancer/sdk";
import { PoolType } from "@balancer/sdk";
import { parseUnits } from "viem";

/**
 * Hacky solution that helps determine if base or derived params are invalid
 */
export function useEclpParamValidations(params: { alpha: string; beta: string; c: string; s: string; lambda: string }) {
  const { poolType } = usePoolCreationStore();
  const { alpha, beta, c, s, lambda } = params;
  const [baseParamsError, setBaseParamsError] = useState<string | null>(null);
  const [derivedParamsError, setDerivedParamsError] = useState<string | null>(null);

  useEffect(() => {
    if (poolType !== PoolType.GyroE) return;
    if (!alpha || !beta || !c || !s || !lambda) {
      console.error("useEclpParamValidations missing required ECLP params", params);
      setBaseParamsError("Missing required ECLP params for validations");
      return;
    }

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
  }, [alpha, beta, c, s, lambda, params, poolType]);

  return {
    baseParamsError,
    derivedParamsError,
  };
}
