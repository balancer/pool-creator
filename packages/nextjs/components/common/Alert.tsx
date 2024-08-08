interface AlertProps {
  type: "error" | "warning" | "success"; // `type` is required
  children?: React.ReactNode; // `children` can be optional
}

export const Alert: React.FC<AlertProps> = ({ children, type }) => {
  let bgColor;
  let borderColor;
  // let textColor;

  if (type === "error") {
    bgColor = "bg-[#d64e4e2b]";
    borderColor = "border-red-500";
    // textColor = "text-red-500";
  } else if (type === "warning") {
    bgColor = "bg-[#fb923c40]";
    borderColor = "border-orange-400";
    // textColor = "text-orange-400";
  } else if (type === "success") {
    bgColor = "bg-[#15803d33]";
    borderColor = "border-green-500";
    // textColor = "text-green-400";
  }
  return (
    <div className={`${bgColor} border ${borderColor}  rounded-lg p-3 overflow-auto w-full`}>
      <div>{children}</div>
    </div>
  );
};
