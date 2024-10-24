import { bgPrimaryGradient } from "~~/utils";

export const TransactionButton = ({
  title,
  isDisabled,
  onClick,
  isPending,
}: {
  title: string;
  isDisabled: boolean;
  onClick: () => void;
  isPending: boolean;
}) => {
  return (
    <button
      disabled={isDisabled}
      onClick={onClick}
      className={`shadow-lg flex flex-col items-center justify-center text-lg w-full rounded-xl h-[50px] font-bold text-neutral-700 ${
        isDisabled ? "bg-neutral-500" : bgPrimaryGradient
      }`}
    >
      {isPending ? <span className="loading loading-bars loading-sm"></span> : title}
    </button>
  );
};
