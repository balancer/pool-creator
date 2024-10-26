import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

interface StepsDisplayProps {
  currentStepNumber: number;
  steps: Step[];
}
export type Step = { label: string; blockExplorerUrl?: string };

export function StepsDisplay({ currentStepNumber, steps }: StepsDisplayProps) {
  return (
    <div className="bg-base-200 px-5 pt-7 rounded-xl shadow-xl">
      <h5 className="text-xl font-bold text-center">Steps</h5>
      <ul className="steps steps-vertical">
        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          return (
            <li
              key={idx}
              data-content={currentStepNumber > stepNumber ? "✓" : stepNumber}
              className={`step ${currentStepNumber > stepNumber && "step-success"} ${
                currentStepNumber == stepNumber && "step-primary"
              }`}
            >
              <div className="flex items-center gap-2">
                {step.label}
                {step.blockExplorerUrl && (
                  <a href={step.blockExplorerUrl} target="_blank" rel="noopener noreferrer">
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 text-accent" />
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
