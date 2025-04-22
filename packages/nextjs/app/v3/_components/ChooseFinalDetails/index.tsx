import { ChooseInfo } from "./ChooseInfo";
import { ChooseTokenAmounts } from "./ChooseTokenAmounts";

export const ChooseFinalDetails = () => {
  return (
    <div className="flex flex-col gap-5">
      <ChooseTokenAmounts />
      <ChooseInfo />
    </div>
  );
};
