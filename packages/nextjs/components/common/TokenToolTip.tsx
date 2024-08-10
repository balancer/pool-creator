"use client";

import Link from "next/link";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { type Token } from "~~/hooks/token";
import scaffoldConfig from "~~/scaffold.config";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

interface TokenToolTipProps {
  token: Token;
}

export const TokenToolTip: React.FC<TokenToolTipProps> = ({ token }) => {
  const { targetNetwork } = useTargetNetwork();
  let network = targetNetwork;

  if (targetNetwork.id === 31337) {
    network = scaffoldConfig.targetFork;
  }
  const blockExplorerLink = getBlockExplorerAddressLink(network, token.address);

  return (
    <>
      <Link
        onClick={e => e.stopPropagation()}
        rel="noopener noreferrer"
        target="_blank"
        href={blockExplorerLink}
        className="flex gap-2 items-center"
      >
        <InformationCircleIcon className="w-5 h-5 text-neutral-500 hover:text-base-content" />
      </Link>
    </>
  );
};
