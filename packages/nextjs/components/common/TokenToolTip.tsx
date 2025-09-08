"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowTopRightOnSquareIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { type Token } from "~~/hooks/token";
import { abbreviateAddress } from "~~/utils/helpers";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

interface TokenToolTipProps {
  token: Token;
}

export function TokenToolTip({ token }: TokenToolTipProps) {
  const [addressCopied, setAddressCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const { targetNetwork } = useTargetNetwork();
  const blockExplorerLink = getBlockExplorerAddressLink(targetNetwork, token.address);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(token.address);
      setAddressCopied(true);
      setTimeout(() => {
        setAddressCopied(false);
      }, 800);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={tooltipRef} className="relative">
      <div
        onClick={e => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex gap-2 items-center cursor-pointer"
      >
        <InformationCircleIcon className="w-5 h-5 text-neutral-500 hover:text-base-content" />
      </div>

      {isOpen && (
        <div className="absolute z-50 left-full ml-2 top-1/2 -translate-y-1/2">
          <div
            className="bg-base-100 text-base-content border border-neutral-500 px-3 py-1 rounded shadow-lg whitespace-nowrap text-base relative
            before:absolute before:w-0 before:h-0 
            before:border-t-[8px] before:border-t-transparent
            before:border-r-[8px] before:border-r-neutral-500
            before:border-b-[8px] before:border-b-transparent
            before:left-[-8px] before:top-1/2 before:-translate-y-1/2
            after:absolute after:w-0 after:h-0 
            after:border-t-[7px] after:border-t-transparent
            after:border-r-[7px] after:border-r-base-100
            after:border-b-[7px] after:border-b-transparent
            after:left-[-7px] after:top-1/2 after:-translate-y-1/2"
          >
            <div className="flex items-center gap-3">
              <div>{abbreviateAddress(token.address)}</div>
              <div>
                {addressCopied ? (
                  <div className="!rounded-xl flex">
                    <CheckCircleIcon
                      className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                      aria-hidden="true"
                    />
                  </div>
                ) : (
                  <div
                    className="!rounded-xl flex cursor-pointer"
                    onClick={e => {
                      e.stopPropagation();
                      handleCopyAddress();
                    }}
                  >
                    <DocumentDuplicateIcon
                      className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>
              <Link
                onClick={e => e.stopPropagation()}
                rel="noopener noreferrer"
                target="_blank"
                href={blockExplorerLink}
                className="flex gap-2 items-center"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
