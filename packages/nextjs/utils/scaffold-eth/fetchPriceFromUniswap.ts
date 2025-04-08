import { ChainWithAttributes } from "./networks";

export const fetchPriceFromUniswap = async (targetNetwork: ChainWithAttributes): Promise<number> => {
  try {
    return 0;
  } catch (error) {
    console.log("Error with targetNetwork", targetNetwork);
    console.error(`useNativeCurrencyPrice - Error fetching price from Uniswap: `, error);
    return 0;
  }
};
