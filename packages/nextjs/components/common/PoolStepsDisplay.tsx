import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

interface PoolStepsDisplayProps {
  currentStepNumber: number;
  steps: Step[];
}
export type Step = { label: string; blockExplorerUrl?: string };

export function PoolStepsDisplay({ currentStepNumber, steps }: PoolStepsDisplayProps) {
  return (
    <div className="bg-base-200 border border-neutral px-5 pt-7 rounded-xl shadow-xl">
      <h5 className="text-2xl font-bold text-center">Steps</h5>
      <ul className="steps steps-vertical text-lg pb-3">
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
              <div>
                {step.blockExplorerUrl ? (
                  <div>
                    <a
                      href={step.blockExplorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-info hover:underline"
                    >
                      {step.label}
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <div>{step.label}</div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
