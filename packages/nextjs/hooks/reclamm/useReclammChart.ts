import { useMemo } from "react";
import { usePoolCreationStore } from "../v3";
import {
  calculateInitialBalances,
  calculateLowerMargin,
  calculateUpperMargin,
  computeCenteredness,
} from "./reClammMath";
import { useInitialPricingParams } from "./useInitialPricingParams";
import { useReadToken } from "~~/hooks/token";
import { bn, fNum } from "~~/utils/numbers";

function getGradientColor(colorStops: string[]) {
  return {
    type: "linear",
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: colorStops.map((color, index) => ({ offset: index, color })),
  };
}

const isMobile = false;
const GREEN = "#93F6D2";
const ORANGE = "rgb(253, 186, 116)";

/**
 * Using math from reclamm simulator and chart from frontend monorepo
 */
export function useReclAmmChart() {
  useInitialPricingParams();

  const { tokenConfigs } = usePoolCreationStore();

  const { symbol: underlyingTokenASymbol } = useReadToken(tokenConfigs[0].tokenInfo?.underlyingTokenAddress);
  const { symbol: underlyingTokenBSymbol } = useReadToken(tokenConfigs[1].tokenInfo?.underlyingTokenAddress);

  const tokens = useMemo(() => {
    const tokenSymbols = tokenConfigs.map((token, idx) => {
      if (idx === 0 && underlyingTokenASymbol) {
        return underlyingTokenASymbol;
      }
      if (idx === 1 && underlyingTokenBSymbol) {
        return underlyingTokenBSymbol;
      }
      return token.tokenInfo?.symbol;
    });

    return tokenSymbols.join(" / ");
  }, [tokenConfigs, underlyingTokenASymbol, underlyingTokenBSymbol]);

  const { reClammParams } = usePoolCreationStore();
  const {
    centerednessMargin,
    initialBalanceA,
    initialMinPrice,
    initialMaxPrice,
    initialTargetPrice,
    usdPerTokenInputA,
    usdPerTokenInputB,
  } = reClammParams;

  const currentChartData = useMemo(() => {
    // TODO: review validation logic for reclamm params
    if (
      !Number(centerednessMargin) ||
      !Number(initialBalanceA) ||
      !Number(initialMinPrice) ||
      !Number(initialMaxPrice) ||
      !Number(initialTargetPrice) ||
      Number(initialMinPrice) >= Number(initialMaxPrice) ||
      Number(initialMinPrice) > Number(initialTargetPrice) ||
      Number(initialTargetPrice) > Number(initialMaxPrice)
    )
      return {};

    const { balanceA, balanceB, virtualBalanceA, virtualBalanceB } = calculateInitialBalances({
      minPrice: Number(initialMinPrice),
      maxPrice: Number(initialMaxPrice),
      targetPrice: Number(initialTargetPrice),
      initialBalanceA: Number(initialBalanceA),
    });
    const invariant = bn(bn(balanceA).plus(virtualBalanceA)).times(bn(balanceB).plus(virtualBalanceB));

    const rBalanceA = balanceA;
    const rBalanceB = balanceB;
    const vBalanceA = virtualBalanceA;
    const vBalanceB = virtualBalanceB;
    const marginValue = Number(centerednessMargin);

    const lowerMargin = calculateLowerMargin({
      margin: marginValue,
      invariant: invariant.toNumber(),
      virtualBalanceA: vBalanceA,
      virtualBalanceB: vBalanceB,
    });

    const upperMargin = calculateUpperMargin({
      margin: marginValue,
      invariant: invariant.toNumber(),
      virtualBalanceA: vBalanceA,
      virtualBalanceB: vBalanceB,
    });

    const minPriceValue = bn(virtualBalanceB).pow(2).div(invariant).toNumber();
    const maxPriceValue = bn(invariant).div(bn(virtualBalanceA).pow(2)).toNumber();

    const lowerMarginValue = bn(invariant).div(bn(lowerMargin).pow(2)).toNumber();
    const upperMarginValue = bn(invariant).div(bn(upperMargin).pow(2)).toNumber();

    // Using usd per token inputs populated by fetch (or user) to calc current price
    const currentPriceValue = Number(usdPerTokenInputA) / Number(usdPerTokenInputB);

    const isPoolWithinRange =
      (currentPriceValue > minPriceValue && currentPriceValue < lowerMarginValue) ||
      (currentPriceValue > upperMarginValue && currentPriceValue < maxPriceValue);

    const { poolCenteredness, isPoolAboveCenter } = computeCenteredness({
      balanceA: rBalanceA,
      balanceB: rBalanceB,
      virtualBalanceA: vBalanceA,
      virtualBalanceB: vBalanceB,
    });

    return {
      maxPriceValue,
      minPriceValue,
      lowerMarginValue,
      upperMarginValue,
      currentPriceValue,
      isPoolWithinRange,
      usdPerTokenInputA,
      usdPerTokenInputB,
      poolCenteredness,
      isPoolAboveCenter,
      marginValue,
    };
  }, [
    centerednessMargin,
    initialBalanceA,
    initialMinPrice,
    initialMaxPrice,
    initialTargetPrice,
    usdPerTokenInputA,
    usdPerTokenInputB,
  ]);

  const options = useMemo(() => {
    const {
      maxPriceValue,
      minPriceValue,
      lowerMarginValue,
      upperMarginValue,
      currentPriceValue,
      marginValue, // is a true percentage
      isPoolWithinRange,
    } = currentChartData;

    let showTargetValues = true;
    let showMinMaxValues = true;
    const totalGreenAndOrangeBars = 52;

    // always have a minimum of 1 orange bar
    const baseOrangeBarCount =
      marginValue && marginValue < 4 ? 1 : Math.floor((totalGreenAndOrangeBars * (marginValue || 0)) / 100 / 2);

    // if the margin is very small or very big, show only the target values or min/max values depending on the pool state
    if (marginValue && marginValue < 4) {
      if (isPoolWithinRange) {
        showTargetValues = true;
        showMinMaxValues = false;
      } else if (isPoolWithinRange) {
        showTargetValues = false;
        showMinMaxValues = true;
      }
    } else if (marginValue && marginValue > 92) {
      showTargetValues = false;
      showMinMaxValues = true;
    }

    const baseGreenBarCount = totalGreenAndOrangeBars - 2 * baseOrangeBarCount;
    const baseGreyBarCount = 9;
    const totalBars = 2 * baseGreyBarCount + 2 * baseOrangeBarCount + baseGreenBarCount;

    // for some reason the number of orange (or green) bars matters to echarts in the grid
    const gridBottomDesktop = baseOrangeBarCount % 2 === 0 ? "32%" : "15%";
    const gridBottomMobile = baseOrangeBarCount % 2 === 0 && !(showMinMaxValues && !showTargetValues) ? "30%" : "22%";

    const baseGreyBarConfig = {
      count: baseGreyBarCount,
      value: isMobile ? 1 : 3,
      gradientColors: ["rgba(160, 174, 192, 0.5)", "rgba(160, 174, 192, 0.1)"],
      borderRadius: 20,
    };

    const baseOrangeBarConfig = {
      count: baseOrangeBarCount,
      value: 100,
      gradientColors: ["rgb(253, 186, 116)", "rgba(151, 111, 69, 0.5)"],
      borderRadius: 20,
    };

    const greenBarConfig = {
      name: "Green",
      count: baseGreenBarCount,
      value: 100,
      gradientColors: ["rgb(99, 242, 190)", "rgba(57, 140, 110, 0.5)"],
      borderRadius: 20,
    };

    const barSegmentsConfig = [
      { ...baseGreyBarConfig, name: "Left Grey" },
      { ...baseOrangeBarConfig, name: "Left Orange" },
      greenBarConfig,
      { ...baseOrangeBarConfig, name: "Right Orange" },
      { ...baseGreyBarConfig, name: "Right Grey" },
    ];

    const allCategories: string[] = [];
    const seriesData: any[] = [];
    let categoryNumber = 1;

    // Calculate which bar the current price corresponds to
    const getCurrentPriceBarIndex = () => {
      const { minPriceValue, maxPriceValue, currentPriceValue } = currentChartData || {};

      if (!minPriceValue || !maxPriceValue || !currentPriceValue) {
        return baseGreyBarCount; // Default to first green bar
      }

      // Calculate position based on current price relative to min/max
      const priceRange = maxPriceValue - minPriceValue;
      const currentPricePosition = (currentPriceValue - minPriceValue) / priceRange;

      // Map to bar index
      const totalGreenAndOrangeBars = 2 * baseOrangeBarCount + baseGreenBarCount;
      const barIndex = Math.floor(currentPricePosition * totalGreenAndOrangeBars);

      return Math.max(0, Math.min(barIndex + baseGreyBarCount, totalBars - 1));
    };

    const currentPriceBarIndex = getCurrentPriceBarIndex();

    barSegmentsConfig.forEach(segment => {
      const segmentCategories: string[] = [];
      const segmentStartIndex = allCategories.length;

      for (let i = 0; i < segment.count; i++) {
        segmentCategories.push(String(categoryNumber++));
      }

      allCategories.push(...segmentCategories);

      const segmentSeriesData = Array(segment.count)
        .fill(null)
        .map((_, i) => {
          const isCurrentPriceBar = segmentStartIndex + i === currentPriceBarIndex;

          return {
            value: segment.value,
            itemStyle: {
              color: isCurrentPriceBar // Solid color for current price bar
                ? isPoolWithinRange
                  ? GREEN
                  : ORANGE
                : getGradientColor(segment.gradientColors),
              borderRadius: segment.borderRadius,
            },
          };
        });

      seriesData.push(...segmentSeriesData);
    });

    const baseRichProps = {
      fontSize: 12,
      lineHeight: 13,
      color: "#A0AEC0",
      align: "center",
    };

    const paddingRight = isMobile ? 5 : 10;

    const richStyles = {
      base: baseRichProps,
      triangle: {
        ...baseRichProps,
        fontSize: 10,
        lineHeight: 12,
        color: "#718096",
      },
      current: {
        ...baseRichProps,
        color: isPoolWithinRange ? GREEN : ORANGE,
      },
      currentTriangle: {
        ...baseRichProps,
        fontSize: 10,
        lineHeight: 12,
        color: isPoolWithinRange ? GREEN : ORANGE,
      },
      withRightPadding: {
        ...baseRichProps,
        padding: [0, paddingRight, 0, 0],
      },
      withRightBottomPadding: {
        ...baseRichProps,
        padding: [0, paddingRight, 10, 0],
      },
      withTopRightPadding: {
        ...baseRichProps,
        padding: [showMinMaxValues && !showTargetValues ? 0 : 100, paddingRight, 0, 0],
      },
    };

    return {
      tooltip: { show: false },
      grid: {
        left: isMobile ? "-7%" : "-3%",
        right: "1%",
        top: isMobile ? "80px" : "25%",
        bottom: isMobile ? gridBottomMobile : gridBottomDesktop,
        containLabel: true,
      },
      xAxis: {
        show: true,
        type: "category",
        data: allCategories,
        position: "bottom",
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          show: true,
          interval: 0,
          formatter: (value: string, index: number) => {
            if (showMinMaxValues && index === baseGreyBarCount) {
              return `{${isMobile ? "triangleMobile" : "triangle"}|▲}\n{${
                isMobile ? "labelTextMobile" : "labelText"
              }|Min price}\n{${isMobile ? "priceValueMobile" : "priceValue"}|${
                minPriceValue !== undefined ? fNum("clpPrice", minPriceValue) : "N/A"
              }}`;
            }

            if (showTargetValues && index === baseGreyBarCount + baseOrangeBarCount) {
              return `{triangle|▲}\n{labelText|Low target}\n{priceValue|${
                upperMarginValue !== undefined ? fNum("clpPrice", upperMarginValue) : "N/A"
              }}`;
            }

            if (showTargetValues && index === totalBars - baseGreyBarCount - baseOrangeBarCount) {
              return `{triangle|▲}\n{labelText|High target}\n{priceValue|${
                lowerMarginValue !== undefined ? fNum("clpPrice", lowerMarginValue) : "N/A"
              }}`;
            }

            if (showMinMaxValues && index === totalBars - baseGreyBarCount) {
              return `{${isMobile ? "triangleMobile" : "triangle"}|▲}\n{${
                isMobile ? "labelTextMobile" : "labelText"
              }|Max price}\n{${isMobile ? "priceValueMobile" : "priceValue"}|${
                maxPriceValue !== undefined ? fNum("clpPrice", maxPriceValue) : "N/A"
              }}`;
            }

            return "";
          },
          rich: {
            triangle: {
              ...richStyles.triangle,
              ...richStyles.withRightBottomPadding,
            },
            labelText: {
              ...richStyles.base,
              ...richStyles.withRightBottomPadding,
            },
            priceValue: {
              ...richStyles.base,
              ...richStyles.withRightPadding,
            },
            triangleMobile: {
              ...richStyles.triangle,
              ...richStyles.withTopRightPadding,
            },
            labelTextMobile: {
              ...richStyles.base,
              ...richStyles.withTopRightPadding,
            },
            priceValueMobile: {
              ...richStyles.base,
              padding: [showMinMaxValues && !showTargetValues ? 0 : 110, 10, 0, 0],
            },
          },
        },
        name: `Price: ${tokens}`,
        nameLocation: "end",
        nameGap: 5,
        nameTextStyle: {
          align: "right",
          verticalAlign: "bottom",
          padding: showMinMaxValues && !showTargetValues ? [0, 50, -85, 0] : [0, 50, -80, 0],
          color: "#A0AEC0",
        },
      },
      yAxis: {
        show: false,
        type: "value",
      },
      series: [
        {
          data: seriesData.map((value, index) => {
            if (index === currentPriceBarIndex) {
              return {
                ...value,
                label: {
                  show: true,
                  position: "top",
                  formatter: `{labelText|Current price}\n{priceValue|${
                    currentPriceValue !== undefined ? fNum("clpPrice", currentPriceValue) : "N/A"
                  }}\n{triangle|▼}`,
                  rich: {
                    triangle: {
                      ...richStyles.currentTriangle,
                    },
                    labelText: {
                      ...richStyles.current,
                      padding: [0, 0, 5, 0],
                    },
                    priceValue: {
                      ...richStyles.current,
                    },
                  },
                },
              };
            }

            return value;
          }),
          type: "bar",
          barWidth: "90%",
          barCategoryGap: "25%",
          silent: true,
        },
      ],
    };
  }, [currentChartData, tokens]);

  return { options };
}
