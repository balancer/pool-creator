import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

interface StepsDisplayProps {
  currentStepNumber: number;
  steps: Step[];
}
export type Step = { number: number; label: string; blockExplorerUrl?: string; actionComponent?: React.ReactNode };

export function StepsDisplay({ currentStepNumber, steps }: StepsDisplayProps) {
  return (
    <div className="bg-base-200 px-5 pt-7 rounded-xl shadow-xl">
      <h5 className="text-xl font-bold text-center">Steps</h5>
      <ul className="steps steps-vertical">
        {steps.map((step, idx) => (
          <li
            key={idx}
            data-content={currentStepNumber > step.number ? "✓" : step.number}
            className={`step ${currentStepNumber > step.number && "step-success"} ${
              currentStepNumber == step.number && "step-primary"
            }`}
          >
            <div className="flex items-center gap-2">
              {step.label}
              {step.blockExplorerUrl && (
                <a href={step.blockExplorerUrl} target="_blank" rel="noopener noreferrer">
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
