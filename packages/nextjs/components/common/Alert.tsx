import { CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface AlertProps {
  type: "error" | "warning" | "success"; // `type` is required
  showIcon?: boolean;
  children?: React.ReactNode; // `children` can be optional
}

export const Alert: React.FC<AlertProps> = ({ children, type, showIcon = true }) => {
  let bgColor;
  let borderColor;
  let textColor;
  let icon;

  if (type === "error") {
    bgColor = "bg-error-tint";
    borderColor = "border-error";
    textColor = "text-error";
    icon = <ExclamationCircleIcon className="w-6 h-6" />;
  } else if (type === "warning") {
    bgColor = "bg-warning-tint";
    borderColor = "border-warning";
    textColor = "text-warning";
    icon = <ExclamationTriangleIcon className="w-6 h-6" />;
  } else if (type === "success") {
    bgColor = "bg-success-tint";
    borderColor = "border-success";
    textColor = "text-success";
    icon = <CheckCircleIcon className="w-6 h-6" />;
  }
  return (
    <div
      className={`${textColor} ${bgColor} border ${borderColor} flex items-center gap-2 rounded-lg p-3 overflow-auto w-full`}
    >
      {showIcon && <div>{icon}</div>}
      <div>{children}</div>
    </div>
  );
};
