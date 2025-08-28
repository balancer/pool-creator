"use client";

import { useEffect, useState } from "react";
import { PoolCreation } from "../PoolCreation";
import { ChooseInfo } from "./ChooseInfo";
import { ChooseParameters } from "./ChooseParameters";
import { ChooseTokens } from "./ChooseTokens";
import { ChooseType } from "./ChooseType";
import { ExistingPoolsWarning } from "./ExistingPoolsWarning";
import { TokenType } from "@balancer/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { TransactionButton } from "~~/components/common";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useCheckIfV3PoolExists, usePoolCreationStore, useValidateCreationInputs } from "~~/hooks/v3";
import { bgBeigeGradient } from "~~/utils";

export const TABS = ["Type", "Tokens", "Parameters", "Information"] as const;
export type TabType = (typeof TABS)[number];

export function PoolConfiguration() {
  const [isPoolCreationModalOpen, setIsPoolCreationModalOpen] = useState(false);

  const { selectedTab, updatePool, createPoolTx, poolType, tokenConfigs, poolAddress } = usePoolCreationStore();
  const { targetNetwork } = useTargetNetwork();
  const { prev, next } = getAdjacentTabs(selectedTab);
  const { isParametersValid, isTypeValid, isTokensValid, isPoolCreationInputValid } = useValidateCreationInputs();

  const queryClient = useQueryClient();
  const { existingPools } = useCheckIfV3PoolExists(
    poolType,
    tokenConfigs.map(token => token.address),
  );

  const TAB_CONTENT: Record<TabType, JSX.Element> = {
    Type: <ChooseType />,
    Tokens: <ChooseTokens />,
    Parameters: <ChooseParameters />,
    Information: <ChooseInfo />,
  };

  const isRateProvidersValid = tokenConfigs.every(token => {
    // Check tanstack query cache for rate provider validity
    if (token.tokenType === TokenType.TOKEN_WITH_RATE) {
      const cachedRate = queryClient.getQueryData(["fetchTokenRate", token.rateProvider]);
      if (!cachedRate) return false;
    }
    return true;
  });

  function isNextDisabled() {
    if (selectedTab === "Type") return !isTypeValid;
    if (selectedTab === "Tokens") return !isTokensValid || !isRateProvidersValid;
    if (selectedTab === "Parameters") return !isParametersValid;
    return false;
  }

  function handleTabChange(direction: "prev" | "next") {
    if (direction === "prev" && prev) updatePool({ selectedTab: prev });
    if (direction === "next" && next) updatePool({ selectedTab: next });
  }

  function getAdjacentTabs(currentTab: TabType): { prev: TabType | null; next: TabType | null } {
    const currentIndex = TABS.indexOf(currentTab);
    return {
      prev: currentIndex > 0 ? TABS[currentIndex - 1] : null,
      next: currentIndex < TABS.length - 1 ? TABS[currentIndex + 1] : null,
    };
  }

  // Force modal to open if user has already sent "init pool" transaction so they dont attempt init twice and are forced to view on balancer or start new pool creation
  useEffect(() => {
    if (createPoolTx.wagmiHash || createPoolTx.safeHash || poolAddress) setIsPoolCreationModalOpen(true);
  }, [createPoolTx.wagmiHash, createPoolTx.safeHash, poolAddress]);

  return (
    <>
      <div className="w-full max-w-[700px] flex flex-col gap-5">
        <div className="bg-base-200 rounded-xl p-7 shadow-lg">
          <div className="font-bold text-2xl mb-7">Pool Configuration</div>
          <div className="relative grid grid-cols-4 text-center text-xl rounded-xl">
            <div
              className={`absolute inset-x-0 top-0 bottom-0 ${bgBeigeGradient} opacity-60 rounded-xl shadow-lg`}
            ></div>
            {TABS.map(tab => (
              <div
                key={tab}
                className={`relative z-10 rounded-xl text-neutral-700 flex-1 py-3 text-lg  ${
                  selectedTab === tab && `${bgBeigeGradient} font-bold`
                }`}
              >
                {tab}
              </div>
            ))}
          </div>
          <div className="py-7 min-h-[398px] flex flex-col">{TAB_CONTENT[selectedTab]}</div>

          <div className="grid grid-cols-2 gap-7">
            <button
              onClick={() => handleTabChange("prev")}
              disabled={!prev}
              className={`btn ${bgBeigeGradient} text-neutral-700 text-lg border-none rounded-xl ${
                !prev ? "invisible" : ""
              }`}
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Previous
            </button>
            {selectedTab === "Information" ? (
              <TransactionButton
                onClick={() => setIsPoolCreationModalOpen(true)}
                title="Create Pool"
                isDisabled={!isPoolCreationInputValid}
                isPending={false}
              />
            ) : (
              <button
                onClick={() => {
                  if (selectedTab === "Type") updatePool({ chain: targetNetwork });
                  handleTabChange("next");
                }}
                disabled={isNextDisabled()}
                className={`btn ${bgBeigeGradient} text-neutral-700 text-lg border-none rounded-xl ${
                  isNextDisabled() ? "invisible" : ""
                }`}
              >
                Next
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        {selectedTab === "Information" && existingPools && existingPools.length > 0 && (
          <ExistingPoolsWarning existingPools={existingPools} />
        )}
      </div>

      {isPoolCreationModalOpen && <PoolCreation setIsModalOpen={setIsPoolCreationModalOpen} />}
    </>
  );
}
