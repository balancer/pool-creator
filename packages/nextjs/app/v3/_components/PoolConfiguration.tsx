"use client";

import { useState } from "react";
import { ChooseInfo, ChooseParameters, ChooseTokens, ChooseType } from "./";
import { PoolCreationModal } from "./PoolCreationModal";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { TransactionButton } from "~~/components/common";
import { useValidatePoolCreationInput } from "~~/hooks/v3";
import { bgBeigeGradient, bgBeigeGradientHover } from "~~/utils";

const TABS = ["Type", "Tokens", "Parameters", "Information"] as const;
type TabType = (typeof TABS)[number];

export function PoolConfiguration() {
  const [isPoolCreationModalOpen, setIsPoolCreationModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabType>("Type");
  const { prev, next } = getAdjacentTabs(selectedTab);

  const { isParametersValid, isTypeValid, isInfoValid, isTokensValid, isPoolCreationInputValid } =
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
    if (direction === "prev" && prev) setSelectedTab(prev);
    if (direction === "next" && next) setSelectedTab(next);
  }

  function getAdjacentTabs(currentTab: TabType): { prev: TabType | null; next: TabType | null } {
    const currentIndex = TABS.indexOf(currentTab);
    return {
      prev: currentIndex > 0 ? TABS[currentIndex - 1] : null,
      next: currentIndex < TABS.length - 1 ? TABS[currentIndex + 1] : null,
    };
  }

  return (
    <>
      <div className="w-full max-w-[700px]">
        <div className="bg-base-200 rounded-xl p-7 shadow-lg">
          <div className="font-bold text-2xl mb-7">Pool Configuration</div>
          <div className="relative grid grid-cols-4 text-center text-xl rounded-xl">
            <div
              className={`absolute inset-x-0 top-0 bottom-0 ${bgBeigeGradient} opacity-60 rounded-xl shadow-lg`}
            ></div>
            {TABS.map((tab, idx) => (
              <div
                key={tab}
                className={`relative z-10 rounded-xl ${bgBeigeGradientHover} hover:opacity-80 hover:font-bold hover:cursor-pointer text-neutral-700 flex-1 py-3 text-lg ${
                  selectedTab === tab ? bgBeigeGradient + " font-bold" : ""
                }`}
                onClick={() => setSelectedTab(tab)}
              >
                {idx + 1}. {tab}
              </div>
            ))}
          </div>
          <div className="py-10 min-h-[500px] flex flex-col">{TAB_CONTENT[selectedTab]}</div>
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
                title="Preview Pool"
                isDisabled={false}
                isPending={false}
              />
            ) : selectedTab !== "Information" ? (
              <button
                onClick={() => handleTabChange("next")}
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
        </div>
      </div>
      {isPoolCreationModalOpen && <PoolCreationModal setIsModalOpen={setIsPoolCreationModalOpen} />}
    </>
  );
}
