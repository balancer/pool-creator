import { useFetchTokenPrices } from "~~/hooks/token";
import { usePoolCreationStore } from "~~/hooks/v3";

export const useVerifyProportionalInit = () => {
  const { tokenConfigs } = usePoolCreationStore();
  const { data: tokenPrices } = useFetchTokenPrices();

  console.log("TODO: verify if token usd values match weights from tokenConfig");
  console.log("tokenConfigs", tokenConfigs);
  console.log("tokenPrices", tokenPrices);
  return true;
};
