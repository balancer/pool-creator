"use client";

import { UserFlowManager } from "../v3/_components/UserFlowManager";
import type { NextPage } from "next";
import { BeetsLogo } from "~~/components/assets/BeetsLogo";

const Beets: NextPage = () => {
  return (
    <div className="flex justify-center">
      <div className="flex justify-center py-10 px-5 lg:px-10 w-full max-w-screen-2xl">
        <div className="flex flex-col justify-center gap-5 w-full">
          <div className="flex gap-4 justify-center">
            <BeetsLogo width="40px" />
            <h1 className="text-3xl md:text-5xl font-bold text-center mb-0">Beets</h1>
          </div>

          <UserFlowManager />
        </div>
      </div>
    </div>
  );
};

export default Beets;
