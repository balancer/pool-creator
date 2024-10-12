interface StepsDisplayProps {
  currentStepNumber: number;
  steps: { number: number; label: string }[];
}

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
            {step.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
