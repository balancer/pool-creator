export type HandleNumberInputChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  field: "swapFeePercentage" | "amplificationParameter",
  min: number,
  max: number,
) => void;
