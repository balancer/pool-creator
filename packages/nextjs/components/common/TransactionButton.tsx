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
  const gradient =
    "bg-gradient-to-r from-violet-400 via-orange-100 to-orange-300 hover:from-violet-300 hover:via-orange-100 hover:to-orange-400";

  return (
    <button
      disabled={isDisabled}
      onClick={onClick}
      className={`flex flex-col items-center justify-center text-lg w-full rounded-xl h-[50px] font-bold text-neutral-700 ${isDisabled ? "bg-neutral-500" : gradient}`}
    >
      {isPending ? <span className="loading loading-bars loading-sm"></span> : title}
    </button>
  );
};
