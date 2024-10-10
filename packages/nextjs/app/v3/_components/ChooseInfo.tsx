import React from "react";
import { TextField } from "~~/components/common";
import { usePoolStore } from "~~/hooks/v3";

export const ChooseInfo = () => {
  const { name, setName, symbol, setSymbol } = usePoolStore();

  return (
    <div className="flex flex-col gap-5">
      <TextField label="Pool name" placeholder="Enter pool name" value={name} onChange={e => setName(e.target.value)} />
      <TextField
        label="Pool symbol"
        placeholder="Enter pool symbol"
        value={symbol}
        onChange={e => setSymbol(e.target.value)}
      />
    </div>
  );
};
