import React from "react";
import { TextField } from "~~/components/common";
import { Checkbox } from "~~/components/common";

export const ChooseParameters = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5">
        <TextField label="Swap fee (0.001% - 10%)" placeholder="Enter swap fee %" value="" />
        <TextField label="Swap fee manager" placeholder="Enter address" value="" />
      </div>
      <TextField label="Pause manager" placeholder="Enter address" value="" />
      <TextField label="Pool hooks contract" placeholder="Enter address (optional)" value="" />
      <div className="grid grid-cols-2 gap-5">
        <Checkbox label="Disable Unbalanced Liquidity" checked={false} onChange={() => console.log("checked")} />
        <Checkbox label="Enable Donations" checked={false} onChange={() => console.log("checked")} />
      </div>
    </div>
  );
};
