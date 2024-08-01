export const StepTracker = ({ currentStep }: { currentStep: number }) => {
  return (
    <ul className="steps steps-vertical md:steps-horizontal w-[750px] bg-base-200 py-4 rounded-xl">
      <li className="step step-accent">Create Pool</li>
      <li className={`step ${currentStep > 1 && "step-accent"}`}>Initialize Pool</li>
      <li className={`step ${currentStep > 2 && "step-accent"}`}>Set Swap Fee</li>
      <li className={`step ${currentStep > 3 && "step-accent"}`}>Finalize Pool</li>
    </ul>
  );
};
