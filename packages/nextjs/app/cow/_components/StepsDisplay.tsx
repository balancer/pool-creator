/**
 * Accepts pool configuration as props
 */
export const StepsDisplay = ({ currentStep }: { currentStep: number }) => {
  return (
    <ul className="steps steps-vertical sm:steps-horizontal sm:w-[555px] bg-base-200 py-4 rounded-xl shadow-md">
      <li className="px-5 sm:px-0 step step-accent">Create </li>
      <li className={`px-5 sm:px-0 step ${currentStep > 1 && "step-accent"}`}>Approve </li>
      <li className={`px-5 sm:px-0 step ${currentStep > 2 && "step-accent"}`}>Add Liquidity</li>
      <li className={`px-5 sm:px-0 step ${currentStep > 3 && "step-accent"}`}>Set Fee</li>
      <li className={`px-5 sm:px-0 step ${currentStep > 4 && "step-accent"}`}>Finalize</li>
    </ul>
  );
};
