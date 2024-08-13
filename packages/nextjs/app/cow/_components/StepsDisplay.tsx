export const StepsDisplay = ({ state }: { state: any }) => {
  const steps = [
    { number: 1, label: "Create Pool" },
    { number: 2, label: `Approve ${state.token1.symbol}` },
    { number: 3, label: `Approve ${state.token2.symbol}` },
    { number: 4, label: `Add ${state.token1.symbol}` },
    { number: 5, label: `Add ${state.token2.symbol}` },
    { number: 6, label: "Set Swap Fee" },
    { number: 7, label: "Finalize Pool" },
  ];

  return (
    <div className="bg-base-200 px-5 pt-7 rounded-xl shadow-xl">
      <h5 className="text-xl font-bold text-center">Steps</h5>
      <ul className="steps steps-vertical">
        {steps.map(step => (
          <li
            key={step.number}
            data-content={state.step > step.number ? "✓" : step.number}
            className={`step ${state.step > step.number && "step-accent"} ${
              state.step == step.number && "step-primary"
            }`}
          >
            {step.label}
          </li>
        ))}
      </ul>
    </div>
  );
};
