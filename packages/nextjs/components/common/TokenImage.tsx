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
      <div className={`flex flex-col items-center justify-center ${imageSizeMap[size]} rounded-full bg-base-300`}></div>
    );
  } else {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={token.logoURI} alt={token.symbol} className={`${imageSizeMap[size]} rounded-full`} />
    );
  }
};
