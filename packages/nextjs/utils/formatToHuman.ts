import { formatUnits } from "viem";

/**
 * Formats the token amount with the specified number of decimals and returns it
 * as a string with four decimal places.
 */
export const formatToHuman = (amount: bigint, decimals: number): string => {
  // Format the amount to a floating-point number
  const formattedAmount = Number(formatUnits(amount || 0n, decimals));

  // Check if the formatted amount has non-zero decimal places
  if (formattedAmount % 1 !== 0) {
    // Return the formatted amount with up to four decimal places
    return formattedAmount.toFixed(4);
  } else {
    // Return the formatted amount as an integer string
    return formattedAmount.toFixed(0);
  }
};
