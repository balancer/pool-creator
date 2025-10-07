import React, { useEffect, useRef, useState } from "react";
// import Link from "next/link";
import { ChooseTokenAmount } from "./ChooseTokenAmount";
import { PoolType } from "@balancer/sdk";
import { Alert } from "~~/components/common";
import { useInvertEclpParams } from "~~/hooks/gyro";
import { usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";

export function ChooseTokenAmounts() {
  const { tokenConfigs, poolType } = usePoolCreationStore();
  const { updateUserData, hasAgreedToWarning } = useUserDataStore();
  const [autofillAmount, setAutofillAmount] = useState(true);

  const isGyroEclp = poolType === PoolType.GyroE;
  const isWeightedPool = poolType === PoolType.Weighted;

  const isTokenConfigsSorted = tokenConfigs.every((token, index) => {
    if (index === 0) return true;
    return token.address.toLowerCase() >= tokenConfigs[index - 1].address.toLowerCase();
  });

  const shouldInvertEclpParams = !isTokenConfigsSorted && poolType === PoolType.GyroE;

  const { invertEclpParams } = useInvertEclpParams();
  const hasInvertedRef = useRef(false);

  // force token configs to be sorted in order before user enters amounts
  useEffect(() => {
    if (shouldInvertEclpParams && !hasInvertedRef.current) {
      invertEclpParams();
      hasInvertedRef.current = true;
    }
  }, [shouldInvertEclpParams, invertEclpParams]);

  return (
    <div className="rounded-xl flex flex-col gap-4">
      <div className="text-xl">Choose initialization amounts:</div>
      {isGyroEclp && (
        <div className="form-control">
          <label className="label cursor-pointer w-44 ">
            <span className="label-text text-lg">Toggle autofill</span>
            <input
              type="checkbox"
              className="toggle toggle-success"
              checked={autofillAmount}
              onChange={e => setAutofillAmount(e.target.checked)}
            />
          </label>
        </div>
      )}

      <div className="flex flex-col gap-5 rounded-xl l bg-base-100 p-4">
        {tokenConfigs.map((tokenConfig, index) => (
          <ChooseTokenAmount
            key={tokenConfig.address}
            index={index}
            tokenConfig={tokenConfig}
            autofillAmount={autofillAmount}
          />
        ))}
      </div>

      {isWeightedPool && (
        <Alert type="warning">
          <label className="label cursor-pointer py-0 gap-3">
            <span className="font-bold">Please Confirm:</span> USD values are proportional to token weights?
            <input
              type="checkbox"
              className="checkbox rounded-lg border-neutral-700"
              onChange={() => {
                updateUserData({ hasAgreedToWarning: !hasAgreedToWarning });
              }}
              checked={hasAgreedToWarning}
            />
          </label>
        </Alert>
      )}
    </div>
  );
}
