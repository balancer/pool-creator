import { useState } from "react";

const TABS = ["Type", "Tokens", "Params", "Info"];

const bgColor = "bg-gradient-to-b from-custom-beige-start to-custom-beige-end to-100%";

export const PoolConfiguration = () => {
  const [selectedTab, setSelectedTab] = useState("Type");

  return (
    <div className="w-full max-w-[700px]">
      <div className="bg-base-200 rounded-xl">
        <div className="font-bold text-2xl p-7">Pool Configuration</div>

        <div className="relative grid grid-cols-4 text-center text-xl rounded-xl px-5">
          <div className={`absolute inset-x-7 top-0 bottom-0 ${bgColor} opacity-50 rounded-xl`}></div>
          {TABS.map(tab => (
            <div
              key={tab}
              className={`relative z-10 rounded-xl hover:cursor-pointer text-neutral-700 flex-1 py-3 text-lg ${
                selectedTab === tab ? bgColor + " font-bold" : ""
              }`}
              onClick={() => setSelectedTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
        <div className="p-7 min-h-[500px]"></div>
        <div className="p-7 grid grid-cols-2 gap-7">
          <div className="btn bg-secondary rounded-xl">Previous</div>
          <div className="btn btn-primary rounded-xl">Next</div>
        </div>
      </div>
    </div>
  );
};
