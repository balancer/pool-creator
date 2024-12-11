"use client";

import { useEffect, useState } from "react";
import { ChooseInfo, ChooseParameters, ChooseTokens, ChooseType, PoolCreationManager } from "./";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Alert, TransactionButton } from "~~/components/common";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { TABS, type TabType, usePoolCreationStore, useValidatePoolCreationInput } from "~~/hooks/v3";
import { bgBeigeGradient } from "~~/utils";

export function PoolConfiguration() {
  const { selectedTab, updatePool, step } = usePoolCreationStore();
  const { targetNetwork } = useTargetNetwork();
  const [isPoolCreationModalOpen, setIsPoolCreationModalOpen] = useState(false);
  const { prev, next } = getAdjacentTabs(selectedTab);
  const { isParametersValid, isTypeValid, isInfoValid, isTokensValid, isPoolCreationInputValid, isValidTokenWeights } =
    useValidatePoolCreationInput();

  const TAB_CONTENT: Record<TabType, JSX.Element> = {
    Type: <ChooseType />,
    Tokens: <ChooseTokens />,
    Parameters: <ChooseParameters />,
    Information: <ChooseInfo />,
  };

  function isNextDisabled() {
    if (selectedTab === "Type") return !isTypeValid;
    if (selectedTab === "Tokens") return !isTokensValid;
    if (selectedTab === "Parameters") return !isParametersValid;
    if (selectedTab === "Information") return !isInfoValid;
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

  useEffect(() => {
    if (step > 1) setIsPoolCreationModalOpen(true);
  }, [step]);

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
          <div className="py-7 min-h-[500px] flex flex-col">{TAB_CONTENT[selectedTab]}</div>

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
            {isPoolCreationInputValid && selectedTab === "Information" ? (
              <TransactionButton
                onClick={() => setIsPoolCreationModalOpen(true)}
                title="Create Pool"
                isDisabled={false}
                isPending={false}
              />
            ) : selectedTab !== "Information" ? (
              <button
                onClick={() => {
                  if (selectedTab === "Type") {
                    updatePool({ chain: targetNetwork });
                  }
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
            ) : null}
          </div>
          {selectedTab === "Tokens" && !isValidTokenWeights && (
            <div className="mt-5">
              <Alert type="error">Each token weight must be at least 1% and sum of all weights must be 100%</Alert>
            </div>
          )}
          {selectedTab === "Information" && !isTokensValid && (
            <div className="mt-5">
              <Alert type="error">Tokens configuration is invalid. Please go back to check wallet balances</Alert>
            </div>
          )}
        </div>
      </div>

      {isPoolCreationModalOpen && <PoolCreationManager setIsModalOpen={setIsPoolCreationModalOpen} />}
    </>
  );
}
