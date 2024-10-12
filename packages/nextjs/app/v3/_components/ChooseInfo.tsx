import React, { useEffect } from "react";
import { TextField } from "~~/components/common";
import { usePoolCreationStore } from "~~/hooks/v3";
import { TokenConfig } from "~~/hooks/v3/usePoolCreationStore";

function buildPoolName(poolType: string, tokenConfigs: TokenConfig[]): string {
  const tokenParts = tokenConfigs.map(token => `${token.weight}${token.tokenInfo?.symbol}`).join(" ");
  return `Balancer ${poolType} ${tokenParts}`;
}

function buildPoolSymbol(tokenConfigs: TokenConfig[]): string {
  return tokenConfigs.map(token => `${token.weight}${token.tokenInfo?.symbol}`).join("-");
}

export const ChooseInfo = () => {
  const { name, setName, symbol, setSymbol, tokenConfigs, poolType } = usePoolCreationStore();

  useEffect(() => {
    if (poolType) {
      setName(buildPoolName(poolType, tokenConfigs));
      setSymbol(buildPoolSymbol(tokenConfigs));
    }
  }, [tokenConfigs, poolType, setName, setSymbol]);

  return (
    <div>
      <div className="mb-5">
        <TextField
          label="Pool name"
          placeholder="Enter pool name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Pool symbol"
          placeholder="Enter pool symbol"
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
        />
      </div>
    </div>
  );
};
