"use client";

import { PoolConfiguration, PoolSummary } from "./_components";
import type { NextPage } from "next";

/**
 * Keep all the pool creation state in this parent component
 * Feed details to PoolCreation & PoolSummary components
 */
const v3Pool: NextPage = () => {
  return (
    <div className="flex justify-center">
      <div className="flex justify-center py-10 px-5 lg:px-10 w-full max-w-screen-2xl">
        <div className="flex flex-col justify-center gap-5 w-full">
          <h1 className="text-5xl font-bold mb-10 text-center">Pool Creation</h1>
          <div className="flex gap-5 w-full justify-center">
            <PoolConfiguration />
            <PoolSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

export default v3Pool;
