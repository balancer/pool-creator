// import { formatUnits } from "viem";
// import { useTokenUsdValue } from "~~/hooks/token";
import { usePoolCreationStore } from "~~/hooks/v3";

// import { sortTokenConfigs } from "~~/utils/helpers";

export const useEclpSpotPrice = () => {
  const { eclpParams } = usePoolCreationStore();
  const { usdValueToken0, usdValueToken1 } = eclpParams;

  if (Number(usdValueToken0) && Number(usdValueToken1)) {
    return Number(usdValueToken0) / Number(usdValueToken1);
  } else {
    return null;
  }

  // OPTION TO SCALE UNDERLYING USD VALUES TO ERC4626 VALUES FOR ECLP CALCULATIONS:

  // const sortedTokens = useEclpTokenOrder();

  //   // Fetch token prices from API to auto-fill USD values for tokens (always boosted token usd price)
  //   const { tokenUsdValue: usdValueFromApiToken0 } = useTokenUsdValue(sortedTokens[0].address, "1");
  //   const { tokenUsdValue: usdValueFromApiToken1 } = useTokenUsdValue(sortedTokens[1].address, "1");

  // if (Number(usdValueToken0) && Number(usdValueToken1)) {
  //   let valueToken0 = Number(usdValueToken0);
  //   let valueToken1 = Number(usdValueToken1);

  //   // If input has been converted to underlying usd value
  //   // Use rate toconvert back to boosted usd value before calculating spot price
  //   // so that ECLP params are calculated correctly
  //   if (isUnderlyingUsdValueToken0 && usdValueFromApiToken0 && sortedTokens[0].currentRate) {
  //     const rateInDecimalsToken0 = Number(formatUnits(sortedTokens[0].currentRate, 18));
  //     valueToken0 = Number(usdValueToken0) * rateInDecimalsToken0;
  //   }
  //   if (isUnderlyingUsdValueToken1 && usdValueFromApiToken1 && sortedTokens[1].currentRate) {
  //     const rateInDecimalsToken1 = Number(formatUnits(sortedTokens[1].currentRate, 18));
  //     valueToken1 = Number(usdValueToken1) * rateInDecimalsToken1;
  //   }

  //   return valueToken0 / valueToken1;
  // } else {
  //   return null;
  // }
};
