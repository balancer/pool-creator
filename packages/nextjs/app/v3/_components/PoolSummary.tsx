import { PoolType, TokenConfig } from "../types";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export function PoolSummary({ poolType, poolTokens }: { poolType: PoolType; poolTokens: TokenConfig[] }) {
  return (
    <div className="bg-base-200 w-full max-w-[400px] rounded-xl p-7 shadow-lg">
      <div className="font-bold text-2xl mb-7">Pool Summary</div>

      <div className="text-lg">
        <div className="flex justify-between mb-3">
          <div className="font-bold">1. Type: </div>
          <div className={`h-7 w-7 rounded-full ${poolType === "Weighted" ? "" : ""}`}>
            {!poolType ? <QuestionMarkCircleIcon className="w-7 h-7" /> : <CheckCircleIcon className="w-7 h-7" />}
          </div>
        </div>
        <div>{!poolType ? <i>No type selected</i> : `${poolType} Pool`}</div>
      </div>
      <hr className="border-base-content opacity-30 my-5" />
      <div className="text-lg">
        <div className="flex justify-between mb-3">
          <div className="font-bold">2. Tokens: </div>
          <div className={`h-7 w-7 rounded-full ${poolType === "Weighted" ? "" : ""}`}>
            {poolTokens.length === 0 ? (
              <QuestionMarkCircleIcon className="w-7 h-7" />
            ) : (
              <CheckCircleIcon className="w-7 h-7" />
            )}
          </div>
        </div>
        <div>
          {poolTokens.every(token => token.address === undefined) ? (
            <i>No tokens selected</i>
          ) : (
            <div>
              {poolTokens.map((poolToken, index) => (
                <div key={index}>{poolToken?.address}</div>
              ))}
            </div>
          )}
        </div>
      </div>
      <hr className="border-base-content opacity-30 my-5" />
    </div>
  );
}
