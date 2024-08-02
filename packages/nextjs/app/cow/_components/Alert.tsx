interface AlertProps {
  bgColor: string;
  borderColor: string;
  children?: React.ReactNode; // `children` can be optional
}

export const Alert: React.FC<AlertProps> = ({ children, bgColor, borderColor }) => {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-3 overflow-auto  w-full sm:w-[555px] `}>
      <div>{children}</div>
    </div>
  );
};
