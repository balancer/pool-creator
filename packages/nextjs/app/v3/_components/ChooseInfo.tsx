import React, { Dispatch, SetStateAction } from "react";
import { TextField } from "~~/components/common";

export const ChooseInfo = ({
  poolName,
  setPoolName,
  poolSymbol,
  setPoolSymbol,
}: {
  poolName: string;
  setPoolName: Dispatch<SetStateAction<string>>;
  poolSymbol: string;
  setPoolSymbol: Dispatch<SetStateAction<string>>;
}) => {
  return (
    <div className="flex flex-col gap-5">
      <TextField
        label="Pool name"
        placeholder="Enter pool name"
        value={poolName}
        onChange={e => setPoolName(e.target.value)}
      />
      <TextField
        label="Pool symbol"
        placeholder="Enter pool symbol"
        value={poolSymbol}
        onChange={e => setPoolSymbol(e.target.value)}
      />
    </div>
  );
};
