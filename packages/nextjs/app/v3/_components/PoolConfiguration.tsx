import { Dispatch, SetStateAction, useState } from "react";
import { ChoosePoolType } from "./";
import { bgBeigeGradient } from "~~/utils";

const TABS = ["Type", "Tokens", "Params", "Info"];

export function PoolConfiguration({
  poolType,
  setPoolType,
}: {
  poolType: string | undefined;
  setPoolType: Dispatch<SetStateAction<string | undefined>>;
}) {
  const [selectedTab, setSelectedTab] = useState("Type");

  return (
    <div className="w-full max-w-[700px]">
      <div className="bg-base-200 rounded-xl p-7">
        <div className="font-bold text-2xl mb-7">Pool Configuration</div>
        <div className="relative grid grid-cols-4 text-center text-xl rounded-xl">
          <div className={`absolute inset-x-0 top-0 bottom-0 ${bgBeigeGradient} opacity-50 rounded-xl`}></div>
          {TABS.map(tab => (
            <div
              key={tab}
              className={`relative z-10 rounded-xl hover:cursor-pointer text-neutral-700 flex-1 py-3 text-lg ${
                selectedTab === tab ? bgBeigeGradient + " font-bold" : ""
              }`}
              onClick={() => setSelectedTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
        <div className="p-10 min-h-[500px] text-lg">
          {selectedTab === "Type" ? <ChoosePoolType poolType={poolType} setPoolType={setPoolType} /> : null}
        </div>
        <div className="grid grid-cols-2 gap-7">
          <button
            onClick={() => setSelectedTab("Type")}
            className={`btn btn-primary text-lg font-medium rounded-xl ${selectedTab === "Type" ? "invisible" : ""}`}
          >
            Previous
          </button>
          <button
            onClick={() => setSelectedTab("Tokens")}
            disabled={!poolType}
            className="btn text-lg font-medium btn-primary rounded-xl disabled"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
