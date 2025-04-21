"use client";

import { useEffect, useState } from "react";
import { ChooseInfo, ChooseParameters, ChooseTokens, ChooseType, PoolCreationManager } from "./";
import { ArrowLeftIcon, ArrowRightIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Alert, TransactionButton } from "~~/components/common";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import {
  TABS,
  type TabType,
  useCheckIfV3PoolExists,
  usePoolCreationStore,
  useValidatePoolCreationInput,
} from "~~/hooks/v3";
import { bgBeigeGradient } from "~~/utils";

export function PoolConfiguration() {
  const { selectedTab, updatePool, createPoolTx, poolType, tokenConfigs } = usePoolCreationStore();
  const { targetNetwork } = useTargetNetwork();
  const [isPoolCreationModalOpen, setIsPoolCreationModalOpen] = useState(false);
  const { prev, next } = getAdjacentTabs(selectedTab);
  const { isParametersValid, isTypeValid, isInfoValid, isTokensValid, isPoolCreationInputValid } =
    useValidatePoolCreationInput();

  const { existingPools } = useCheckIfV3PoolExists(
    poolType,
    tokenConfigs.map(token => token.address),
  );

  const TAB_CONTENT: Record<TabType, JSX.Element> = {
    Type: <ChooseType />,
    Tokens: <ChooseTokens />,
    Parameters: <ChooseParameters />,
    Information: <ChooseInfo />,
  };

  function isNextDisabled() {
    if (selectedTab === "Type") return !isTypeValid;
    if (selectedTab === "Tokens") return !isTokensValid;
    if (selectedTab === "Parameters") return !isParametersValid;
    if (selectedTab === "Information") return !isInfoValid;
    return false;
  }

  function handleTabChange(direction: "prev" | "next") {
    if (direction === "prev" && prev) updatePool({ selectedTab: prev });
    if (direction === "next" && next) updatePool({ selectedTab: next });
  }

  function getAdjacentTabs(currentTab: TabType): { prev: TabType | null; next: TabType | null } {
    const currentIndex = TABS.indexOf(currentTab);
    return {
      prev: currentIndex > 0 ? TABS[currentIndex - 1] : null,
      next: currentIndex < TABS.length - 1 ? TABS[currentIndex + 1] : null,
    };
  }

  // Force modal to open if user has already sent "Deploy Pool" transaction (which is step 1)
  useEffect(() => {
    if (createPoolTx.wagmiHash || createPoolTx.safeHash) setIsPoolCreationModalOpen(true);
  }, [createPoolTx.wagmiHash, createPoolTx.safeHash]);

  return (
    <>
      <div className="w-full max-w-[700px] flex flex-col gap-5">
        <div className="bg-base-200 rounded-xl p-7 shadow-lg">
          <div className="font-bold text-2xl mb-7">Pool Configuration</div>
          <div className="relative grid grid-cols-4 text-center text-xl rounded-xl">
            <div
              className={`absolute inset-x-0 top-0 bottom-0 ${bgBeigeGradient} opacity-60 rounded-xl shadow-lg`}
            ></div>
            {TABS.map(tab => (
              <div
                key={tab}
                className={`relative z-10 rounded-xl text-neutral-700 flex-1 py-3 text-lg  ${
                  selectedTab === tab && `${bgBeigeGradient} font-bold`
                }`}
              >
                {tab}
              </div>
            ))}
          </div>
          <div className="py-7 min-h-[398px] flex flex-col">{TAB_CONTENT[selectedTab]}</div>

          <div className="grid grid-cols-2 gap-7">
            <button
              onClick={() => handleTabChange("prev")}
              disabled={!prev}
              className={`btn ${bgBeigeGradient} text-neutral-700 text-lg border-none rounded-xl ${
                !prev ? "invisible" : ""
              }`}
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Previous
            </button>
            {isPoolCreationInputValid && selectedTab === "Information" ? (
              <TransactionButton
                onClick={() => setIsPoolCreationModalOpen(true)}
                title="Create Pool"
                isDisabled={false}
                isPending={false}
              />
            ) : selectedTab !== "Information" ? (
              <button
                onClick={() => {
                  if (selectedTab === "Type") {
                    updatePool({ chain: targetNetwork });
                  }
                  handleTabChange("next");
                }}
                disabled={isNextDisabled()}
                className={`btn ${bgBeigeGradient} text-neutral-700 text-lg border-none rounded-xl ${
                  isNextDisabled() ? "invisible" : ""
                }`}
              >
                Next
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            ) : null}
          </div>
          {selectedTab === "Information" && existingPools && existingPools.length > 0 && (
            <div className="mt-5">
              <Alert type="warning">Warning: Pools with a similar configuration have already been created</Alert>
              <div className="overflow-x-auto mt-5">
                <table className="table w-full text-lg border border-neutral-500">
                  <tbody>
                    {existingPools.map(pool => {
                      const chainName = pool.chain.toLowerCase();
                      const baseURL = chainName === "sepolia" ? "https://test.balancer.fi" : "https://balancer.fi";
                      const poolURL = `${baseURL}/pools/${chainName}/v3/${pool.address}`;
                      return (
                        <tr key={pool.address}>
                          <td className="border border-neutral-500 px-2 py-1">{pool.name.slice(0, 20)}</td>
                          <td className="border border-neutral-500 px-2 py-1">{pool.type}</td>
                          <td className="text-right border border-neutral-500 px-2 py-1">
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline text-info flex items-center gap-2 justify-end"
                              href={poolURL}
                            >
                              See Details
                              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {isPoolCreationModalOpen && <PoolCreationManager setIsModalOpen={setIsPoolCreationModalOpen} />}
    </>
  );
}
