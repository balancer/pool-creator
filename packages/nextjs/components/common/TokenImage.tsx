import { type Token } from "~~/hooks/token";

export const TokenImage = ({ token }: { token: Token }) => {
  if (!token.logoURI || token.logoURI === "") {
    return (
      <div className="flex flex-col items-center justify-center w-6 h-6 rounded-full bg-white text-neutral-400">?</div>
    );
  } else {
    {
      /* eslint-disable-next-line @next/next/no-img-element */
    }
    return <img src={token.logoURI} alt={token.symbol} className="w-6 h-6 rounded-full" />;
  }
};
