import { Dispatch, SetStateAction, useState } from "react";
import { PoolType, TokenConfig } from "../types";
import { ChoosePoolInfo, ChoosePoolParams, ChoosePoolTokens, ChoosePoolType } from "./";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { bgBeigeGradient, bgBeigeGradientHover } from "~~/utils";

const TABS = ["Type", "Tokens", "Parameters", "Info"] as const;
type TabType = (typeof TABS)[number];

function getAdjacentTabs(currentTab: TabType): { prev: TabType | null; next: TabType | null } {
  const currentIndex = TABS.indexOf(currentTab);
  return {
    prev: currentIndex > 0 ? TABS[currentIndex - 1] : null,
    next: currentIndex < TABS.length - 1 ? TABS[currentIndex + 1] : null,
  };
}

export function PoolConfiguration({
  poolType,
  setPoolType,
  poolTokens,
  setPoolTokens,
}: {
  poolType: PoolType;
  setPoolType: Dispatch<SetStateAction<PoolType>>;
  poolTokens: TokenConfig[];
  setPoolTokens: Dispatch<SetStateAction<TokenConfig[]>>;
}) {
  const [selectedTab, setSelectedTab] = useState<TabType>("Type");
  const { prev, next } = getAdjacentTabs(selectedTab);

  function handleTabChange(direction: "prev" | "next") {
    if (direction === "prev" && prev) setSelectedTab(prev);
    if (direction === "next" && next) setSelectedTab(next);
  }

  function isNextDisabled() {
    if (selectedTab === "Type") return !poolType;
    if (selectedTab === "Tokens") return poolTokens.some(token => token.address === undefined);
    if (selectedTab === "Parameters") return true;
    if (selectedTab === "Info") return true;
    return false;
  }

  return (
    <div className="w-full max-w-[700px]">
      <div className="bg-base-200 rounded-xl p-7 shadow-lg">
        <div className="font-bold text-2xl mb-7">Pool Configuration</div>
        <div className="relative grid grid-cols-4 text-center text-xl rounded-xl">
          <div className={`absolute inset-x-0 top-0 bottom-0 ${bgBeigeGradient} opacity-60 rounded-xl shadow-lg`}></div>
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
        <div className="py-7 min-h-[500px] text-lg">
          {selectedTab === "Type" && <ChoosePoolType poolType={poolType} setPoolType={setPoolType} />}
          {selectedTab === "Tokens" && <ChoosePoolTokens poolTokens={poolTokens} setPoolTokens={setPoolTokens} />}
          {selectedTab === "Parameters" && <ChoosePoolParams />}
          {selectedTab === "Info" && <ChoosePoolInfo />}
        </div>
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
        </div>
      </div>
    </div>
  );
}
