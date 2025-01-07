import Link from "next/link";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface AlertProps {
  type: "error" | "warning" | "success" | "info"; // `type` is required
  showIcon?: boolean;
  children?: React.ReactNode; // `children` can be optional
  classNames?: string;
}

const alertTypeMap = {
  error: { styles: "bg-error", icon: <ExclamationCircleIcon className="w-6 h-6" /> },
  warning: {
    styles: "bg-warning",
    icon: <ExclamationTriangleIcon className="w-6 h-6" />,
  },
  success: { styles: "bg-success", icon: <CheckCircleIcon className="w-6 h-6" /> },
  info: { styles: "bg-[#93c6ff]", icon: <InformationCircleIcon className="w-6 h-6" /> },
};

export const Alert: React.FC<AlertProps> = ({ children, type, classNames, showIcon = true }) => {
  const { styles, icon } = alertTypeMap[type];
  return (
    <div
      className={`${styles} ${classNames} text-neutral-800 flex items-start gap-2 rounded-lg p-3 overflow-auto w-full`}
    >
      {showIcon && <div>{icon}</div>}
      <div>{children}</div>
    </div>
  );
};

export const SafeWalletAlert: React.FC = () => {
  return (
    <div className="flex justify-center">
      <Alert type="warning" classNames="max-w-[550px]">
        Safe wallets are not yet supported for pool creation. However, you can create a pool using an externally owned
        account, and then use a safe wallet to add more liquidity on{" "}
        <Link className="link" href="https://balancer.fi">
          balancer.fi
        </Link>
      </Alert>
    </div>
  );
};
