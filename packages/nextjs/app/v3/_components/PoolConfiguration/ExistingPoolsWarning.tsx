import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Alert } from "~~/components/common";
import { type ExistingPool } from "~~/hooks/v3";

export function ExistingPoolsWarning({ existingPools }: { existingPools: ExistingPool[] }) {
  return (
    <div>
      <Alert type="warning">Warning: Pools with a similar configuration have already been created</Alert>
      <div className="overflow-x-auto mt-5">
        <table className="table w-full text-lg">
          <thead>
            <tr className="text-lg">
              <th className="border border-neutral-500 px-2 py-1">Name</th>
              <th className="border border-neutral-500 px-2 py-1">Type</th>
              <th className="border border-neutral-500 px-2 py-1">Link</th>
            </tr>
          </thead>
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
                      className="hover:underline text-info flex items-center gap-2"
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
  );
}
