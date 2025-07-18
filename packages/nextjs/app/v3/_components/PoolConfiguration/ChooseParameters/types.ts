export type HandleNumberInputChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  field: "swapFeePercentage" | "amplificationParameter" | "centerednessMargin" | "dailyPriceShiftExponent",
  min: number,
  max: number,
) => void;
