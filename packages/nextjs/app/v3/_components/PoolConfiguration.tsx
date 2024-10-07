import { Dispatch, SetStateAction, useState } from "react";
import { PoolType, TokenConfig } from "../types";
import { ChoosePoolTokens, ChoosePoolType } from "./";
import { bgBeigeGradient } from "~~/utils";

const TABS = ["Type", "Tokens", "Parameters", "Info"] as const;

// type TabType = (typeof TABS)[number];

// const TabComponents: Record<TabType, React.FC<any>> = {
//   Type: ChoosePoolType,
//   Tokens: ChoosePoolTokens,
//   Parameters: () => <div>Parameters Component</div>,
//   Info: () => <div>Info Component</div>,
// };

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
  const [selectedTab, setSelectedTab] = useState("Type");

  return (
    <div className="w-full max-w-[700px]">
      <div className="bg-base-200 rounded-xl p-7 shadow-lg">
        <div className="font-bold text-2xl mb-7">Pool Configuration</div>
        <div className="relative grid grid-cols-4 text-center text-xl rounded-xl">
          <div className={`absolute inset-x-0 top-0 bottom-0 ${bgBeigeGradient} opacity-50 rounded-xl shadow-lg`}></div>
          {TABS.map((tab, idx) => (
            <div
              key={tab}
              className={`relative z-10 rounded-xl hover:cursor-pointer text-neutral-700 flex-1 py-3 text-lg ${
                selectedTab === tab ? bgBeigeGradient + " font-bold" : ""
              }`}
              onClick={() => setSelectedTab(tab)}
            >
              {idx + 1}. {tab}
            </div>
          ))}
        </div>
        <div className="p-7 min-h-[500px] text-lg">
          {selectedTab === "Type" ? (
            <ChoosePoolType poolType={poolType} setPoolType={setPoolType} />
          ) : selectedTab === "Tokens" ? (
            <ChoosePoolTokens poolTokens={poolTokens} setPoolTokens={setPoolTokens} />
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-7">
          <button
            onClick={() => setSelectedTab("Type")}
            className={`btn ${bgBeigeGradient} text-neutral-700 text-lg border-none rounded-xl ${
              selectedTab === "Type" ? "invisible" : ""
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => setSelectedTab("Tokens")}
            disabled={!poolType}
            className={`btn ${bgBeigeGradient} text-neutral-700 disabled:hidden text-lg border-none rounded-xl `}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
