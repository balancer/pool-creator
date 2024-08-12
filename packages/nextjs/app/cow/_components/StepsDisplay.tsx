export const StepsDisplay = ({ state }: { state: any }) => {
  return (
    <div className="bg-base-200 px-5 pt-5 rounded-xl shadow-md">
      <h5 className="text-xl font-bold text-center">Steps</h5>
      <ul className="steps steps-vertical">
        <li className="step step-accent">Create </li>
        <li className={`step ${state.step > 1 && "step-accent"}`}>Approve {state.token1.symbol}</li>
        <li className={`step ${state.step > 2 && "step-accent"}`}>Approve {state.token2.symbol}</li>
        <li className={`step ${state.step > 3 && "step-accent"}`}>Add {state.token1.symbol}</li>
        <li className={`step ${state.step > 4 && "step-accent"}`}>Add {state.token2.symbol}</li>
        <li className={`step ${state.step > 5 && "step-accent"}`}>Set Fee</li>
        <li className={`step ${state.step > 6 && "step-accent"}`}>Finalize</li>
      </ul>
    </div>
  );
};
