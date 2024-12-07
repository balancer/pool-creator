import { blo } from "blo";
import { type Token } from "~~/hooks/token";

type TokenImageProps = {
  token: Token;
  size: "sm" | "md" | "lg";
};

const imageSizeMap = {
  sm: "w-5 h-5",
  md: "w-7 h-7",
  lg: "w-10 h-10",
};

export const TokenImage = ({ token, size }: TokenImageProps) => {
  if (!token.logoURI || token.logoURI === "") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={blo(token.address as `0x${string}`)}
        alt={token.symbol}
        className={`${imageSizeMap[size]} rounded-full`}
      />
    );
  } else {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={token.logoURI} alt={token.symbol} className={`${imageSizeMap[size]} rounded-full`} />
    );
  }
};
