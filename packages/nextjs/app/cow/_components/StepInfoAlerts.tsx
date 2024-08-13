import { Alert } from "~~/components/common";

export const StepInfoAlerts = ({ state }: { state: any }) => {
  const alertMap: { [key: number]: JSX.Element } = {
    1: <Alert type="info">Deploy a pool contract using the official CoW factory</Alert>,
    2: <Alert type="info">Approve the pool to spend your {state.token1.symbol} tokens</Alert>,
    3: <Alert type="info">Approve the pool to spend your {state.token2.symbol} tokens</Alert>,
    4: <Alert type="info">Send your {state.token1.symbol} tokens to the pool</Alert>,
    5: <Alert type="info">Send your {state.token2.symbol} tokens to the pool</Alert>,
    6: <Alert type="info">All CoW AMMs must set the swap fee to the maximum</Alert>,
    7: <Alert type="info">The final step which enables normal liquidity operations</Alert>,
  };

  return alertMap[state.step] || null;
};
