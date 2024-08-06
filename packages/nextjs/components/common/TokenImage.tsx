import { type Token } from "~~/hooks/token";

export const TokenImage = ({ token }: { token: Token }) => {
  if (!token.logoURI || token.logoURI === "") {
    return (
      <div className="flex flex-col items-center justify-center w-7 h-7 rounded-full bg-base-100 text-neutral-400">
        ?
      </div>
    );
  } else {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={token.logoURI} alt={token.symbol} className="w-7 h-7 rounded-full" />
    );
  }
};
