interface AlertProps {
  type: "error" | "warning" | "success"; // `type` is required
  children?: React.ReactNode; // `children` can be optional
}

export const Alert: React.FC<AlertProps> = ({ children, type }) => {
  let bgColor;
  let borderColor;

  if (type === "error") {
    bgColor = "bg-[#d64e4e2b]";
    borderColor = "border-red-500";
  } else if (type === "warning") {
    bgColor = "bg-[#fb923c40]";
    borderColor = "border-orange-400";
  } else if (type === "success") {
    bgColor = "bg-green-800";
    borderColor = "border-green-400";
  }
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-3 overflow-auto  w-full sm:w-[555px] `}>
      <div>{children}</div>
    </div>
  );
};
