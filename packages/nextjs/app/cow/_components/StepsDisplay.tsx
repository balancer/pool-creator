/**
 * Accepts pool configuration as props
 */
export const StepsDisplay = ({ currentStep }: { currentStep: number }) => {
  return (
    <ul className="steps steps-vertical md:steps-horizontal  w-full sm:w-[555px] bg-base-200 py-4 rounded-xl">
      <li className="step step-accent">Create </li>
      <li className={`step ${currentStep > 1 && "step-accent"}`}>Approve </li>
      <li className={`step ${currentStep > 2 && "step-accent"}`}>Bind</li>
      <li className={`step ${currentStep > 3 && "step-accent"}`}>Set Fee</li>
      <li className={`step ${currentStep > 4 && "step-accent"}`}>Finalize</li>
    </ul>
  );
};
