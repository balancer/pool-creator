import { useEffect, useMemo } from "react";
import { useGetECLPLiquidityProfile } from "./useGetECLPLiquidityProfile";
import { usePoolCreationStore, useUserDataStore } from "~~/hooks/v3/";
import { calculateRotationComponents } from "~~/utils/gryo";
import { formatEclpParamValues } from "~~/utils/helpers";
import { bn, fNum } from "~~/utils/numbers";

export function useEclpPoolChart() {
  const { tokenConfigs, updateEclpParam, eclpParams } = usePoolCreationStore();
  const { isTokenOrderInverted, usdValueToken0, usdValueToken1 } = eclpParams;
  const { hasEditedEclpParams } = useUserDataStore();

  let poolSpotPrice = null;
  if (usdValueToken0 && usdValueToken1) poolSpotPrice = Number(usdValueToken0) / Number(usdValueToken1);

  const { data, xMin, xMax, yMax } = useGetECLPLiquidityProfile();
  const markPointMargin = 0.005;

  const isSpotPriceNearLowerBound = useMemo(() => {
    return bn(poolSpotPrice || 0).lt(xMin * (1 + markPointMargin));
  }, [poolSpotPrice, xMin]);

  const isSpotPriceNearUpperBound = useMemo(() => {
    return bn(poolSpotPrice || 0).gt(xMax * (1 - markPointMargin));
  }, [poolSpotPrice, xMax]);

  const poolIsInRange = useMemo(() => {
    const margin = 0.000001; // if spot price is within the margin on both sides it's considered out of range
    return bn(poolSpotPrice || 0).gt(xMin * (1 + margin)) && bn(poolSpotPrice || 0).lt(xMax * (1 - margin));
  }, [xMin, xMax, poolSpotPrice]);

  useEffect(() => {
    if (poolSpotPrice) {
      // auto-fill "starter" values if user has not edited eclp params yet
      if (!hasEditedEclpParams && Number(usdValueToken1) && Number(usdValueToken1)) {
        const { c, s } = calculateRotationComponents(poolSpotPrice.toString());
        const lowestPrice = poolSpotPrice - poolSpotPrice * 0.075;
        const highestPrice = poolSpotPrice + poolSpotPrice * 0.075;

        updateEclpParam({
          alpha: formatEclpParamValues(lowestPrice),
          beta: formatEclpParamValues(highestPrice),
          c,
          s,
          lambda: "1000", // TODO: how to calculate stretching factor that makes pretty curve given values for alpha, beta, c, s?
          peakPrice: formatEclpParamValues(poolSpotPrice),
        });
      }
    } else {
      // without pool spot price, can't calculate "starter" rotation component values
      updateEclpParam({ alpha: "", beta: "", c: "", s: "", peakPrice: "", lambda: "" });
    }
  }, [poolSpotPrice, updateEclpParam, hasEditedEclpParams, usdValueToken0, usdValueToken1]);

  // Gross but only for "Price ( token0 / token1 )" label on chart
  const sortedTokens = tokenConfigs
    .map(token => ({ address: token.address, symbol: token.tokenInfo?.symbol }))
    .sort((a, b) => (a.address > b.address ? 1 : -1));
  if (isTokenOrderInverted) sortedTokens.reverse();

  const options = useMemo(() => {
    if (!data) return;

    return {
      ...defaultChartOptions,
      grid: {
        left: "1.5%",
        right: "1.5%",
        top: "10%",
        bottom: "18%",
      },
      tooltip: {
        show: true,
        showContent: true,
        trigger: "axis",
        confine: true,
        extraCssText: "padding-right:2rem;border: none;background: #1A202C;",
        formatter: (params: any) => {
          const data = Array.isArray(params) ? params[0] : params;
          return `
            <div style="padding: none; display: flex; flex-direction: column; justify-content: center;background: #1A202C;">
              <div style="font-size: 14px; font-weight: 500; color: #A0AEC0;">
                ${fNum("gyroPrice", data.data[0])}
              </div>
            </div>
          `;
        },
      },
      xAxis: {
        type: "value",
        name: `Price ( ${sortedTokens.map(token => token.symbol).join(" / ")} )`,
        nameLocation: "end",
        nameGap: 5,
        nameTextStyle: {
          align: "right",
          verticalAlign: "bottom",
          padding: [0, 35, -52, 0],
          color: "#A0AEC0",
        },
        min: xMin - 0.1 * (xMax - xMin),
        max: xMax + 0.1 * (xMax - xMin),
        axisLabel: {
          formatter: (value: number) => {
            const total = xMax - xMin;
            const margin = total * 0.1;

            if (value >= xMax - margin) return "";
            if (value <= xMin + margin) return "";

            return fNum("gyroPrice", value);
          },
          color: "#718096",
        },
        splitLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLine: {
          show: true,
          lineStyle: {
            type: "dashed",
            color: "#718096",
          },
        },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: yMax * 1.25,
        axisLabel: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
      },
      series: [
        // lower bound
        {
          type: "line",
          data: [],
          symbol: "none",
          markLine: {
            symbol: ["none", "triangle"],
            symbolSize: 6,
            symbolRotate: 180,
            silent: true,
            label: {
              show: true,
              fontSize: 12,
              color: "#1A202C",
              backgroundColor: "#A0AEC0",
              padding: [2, 3, 2, 3],
              borderRadius: 2,
              fontWeight: "bold",
            },
            lineStyle: {
              color: "#A0AEC0",
              padding: [2, 0, 0, 0],
            },
            data: [
              [
                {
                  coord: [xMin, 0],
                  label: {
                    formatter: () => fNum("gyroPrice", xMin || "0"),
                    position: "start",
                    distance: 5,
                    backgroundColor: "rgb(179, 174, 245)",
                  },
                },
                {
                  coord: [xMin, yMax * 1.1],
                },
              ],
            ],
          },
        },
        // upper bound
        {
          type: "line",
          data: [],
          symbol: "none",
          markLine: {
            symbol: ["none", "triangle"],
            symbolSize: 6,
            symbolRotate: 180,
            silent: true,
            label: {
              show: true,
              fontSize: 12,
              color: "#1A202C",
              backgroundColor: "#A0AEC0",
              padding: [2, 3, 2, 3],
              borderRadius: 2,
              fontWeight: "bold",
            },
            lineStyle: {
              color: "#A0AEC0",
            },
            data: [
              [
                {
                  coord: [xMax, 0],
                  label: {
                    formatter: () => fNum("gyroPrice", xMax || "0"),
                    position: "start",
                    distance: 5,
                    backgroundColor: "rgb(234, 168, 121)",
                  },
                },
                {
                  coord: [xMax, yMax * 1.1],
                },
              ],
            ],
          },
        },

        // spot price
        {
          type: "line",
          data: [],
          symbol: "none",
          markPoint: {
            silent: true,
            symbol: "rect",
            symbolSize: [60, 36],
            itemStyle: {
              color: "transparent",
              borderWidth: 0,
            },
            // but markpoints for all 3 lines are here
            data: [
              {
                coord: [xMin, yMax * 1.22],
                value: "Lower\nbound",
                label: {
                  show: !isSpotPriceNearLowerBound || !poolIsInRange,
                  fontSize: 12,
                  color: "#718096",
                  padding: 4,
                  borderRadius: 4,
                },
              },
              {
                coord: [xMax, yMax * 1.22],
                value: "Upper\nbound",
                label: {
                  show: !isSpotPriceNearUpperBound || !poolIsInRange,
                  fontSize: 12,
                  color: "#718096",
                  padding: 4,
                  borderRadius: 4,
                },
              },
              {
                coord: [poolSpotPrice, yMax * 1.22],
                value: "Current\nprice",
                label: {
                  show: poolIsInRange,
                  fontSize: 12,
                  color: "#63f2be",
                },
              },
            ],
          },
          markLine: poolIsInRange
            ? {
                symbol: ["none", "circle"],
                symbolSize: 6,
                symbolRotate: 0,
                silent: true,
                label: {
                  show: true,
                  fontSize: 12,
                  color: "#2D3748",
                  backgroundColor: "#63f2be",
                  padding: [2, 3, 2, 3],
                  borderRadius: 2,
                  fontWeight: "bold",
                },
                lineStyle: {
                  color: "#63f2be",
                },
                data: [
                  [
                    {
                      coord: [poolSpotPrice, 0],
                      label: {
                        formatter: () => fNum("gyroPrice", poolSpotPrice || "0"),
                        position: "start",
                        distance: 6,
                        backgroundColor: "#63f2be",
                      },
                    },
                    {
                      coord: [poolSpotPrice, yMax * 1.1],
                    },
                  ],
                ],
              }
            : undefined,
        },
        // main chart
        {
          type: "line",
          data,
          smooth: false,
          symbol: "none",
          sampling: "lttb",
          silent: true,
          lineStyle: {
            width: 2,
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                {
                  offset: 0,
                  color: "rgb(179, 174, 245)",
                },
                {
                  offset: 0.2,
                  color: "rgb(197, 189, 238)",
                },
                {
                  offset: 0.4,
                  color: "rgb(215, 203, 231)",
                },
                {
                  offset: 0.6,
                  color: "rgb(222, 202, 216)",
                },
                {
                  offset: 0.8,
                  color: "rgb(229, 185, 169)",
                },
                {
                  offset: 1,
                  color: "rgb(234, 168, 121)",
                },
              ],
            },
          },
          z: 1000,
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                {
                  offset: 0,
                  color: "rgba(179, 174, 245, 0.8)",
                },
                {
                  offset: 0.2,
                  color: "rgba(197, 189, 238, 0.6)",
                },
                {
                  offset: 0.4,
                  color: "rgba(215, 203, 231, 0.4)",
                },
                {
                  offset: 0.6,
                  color: "rgba(222, 202, 216, 0.25)",
                },
                {
                  offset: 0.8,
                  color: "rgba(229, 185, 169, 0.15)",
                },
                {
                  offset: 1,
                  color: "rgba(234, 168, 121, 0)",
                },
              ],
            },
          },
          markLine: {
            silent: true,
            z: 1000,
            symbol: ["none", "none"],
            data: [
              // left enclosing line for area
              [
                {
                  coord: [xMin, 0],
                  lineStyle: {
                    color: "rgb(179, 174, 245)",
                    width: 2,
                    type: "solid",
                  },
                },
                { coord: [xMin, data?.[0]?.[1] || 0] },
              ],
              // right enclosing line for area
              [
                {
                  coord: [xMax, 0],
                  lineStyle: {
                    color: "rgb(234, 168, 121)",
                    width: 2,
                    type: "solid",
                  },
                },
                { coord: [xMax, data?.[data.length - 1]?.[1] || 0] },
              ],
            ],
          },
        },
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return {
    options,
    hasChartData: !!data,
  };
}

const defaultChartOptions = {
  grid: {
    left: "1.5%",
    right: "2.5%",
    top: "7.5%",
    bottom: "0",
    containLabel: true,
  },
  xAxis: {
    show: true,
    type: "time",
    minorSplitLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    splitNumber: 3,
    axisLabel: {
      color: "#E5D3BE",
      opacity: 0.5,
      interval: 0,
      showMaxLabel: false,
      showMinLabel: false,
    },
    axisPointer: {
      type: "line",
      label: {},
    },
    axisLine: {
      show: false,
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ["rgba(250,250,250,0.3)", "rgba(200,200,200,0.3)"],
      },
    },
  },
  yAxis: {
    show: true,
    type: "value",
    axisLine: {
      show: false,
    },
    minorSplitLine: {
      show: false,
    },
    splitLine: {
      show: false,
    },
    splitNumber: 3,
    axisLabel: {
      color: "#E5D3BE",
      opacity: 0.5,
      interval: "auto",
      showMaxLabel: false,
      showMinLabel: false,
    },
  },
  tooltip: {
    show: true,
    showContent: true,
    trigger: "axis",
    confine: true,
    axisPointer: {
      animation: false,
      type: "shadow",
      label: {
        show: false,
      },
    },
    extraCssText: "padding-right:2rem;border: none;background: #1A202C;",
  },
};
