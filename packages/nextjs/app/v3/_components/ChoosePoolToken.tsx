import React from "react";

export const ChoosePoolToken = () => {
  return (
    <div className="flex gap-3">
      <button className="btn btn-primary flex-grow rounded-xl text-lg">Select a token</button>
      <div className="relative w-full max-w-[100px]">
        <input type="text" placeholder="0" className="input text-lg shadow-inner bg-base-300 rounded-xl w-full pr-6" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
      </div>
    </div>
  );
};
