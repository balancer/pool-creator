export const abis = {
  CoW: {
    BCoWPool: [
      {
        type: "constructor",
        inputs: [{ name: "cowSwap", type: "address", internalType: "address" }],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "BONE",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "BPOW_PRECISION",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "COMMITMENT_SLOT",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "EMPTY_COMMITMENT",
        inputs: [],
        outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "EXIT_FEE",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "INIT_POOL_SUPPLY",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "MAX_BOUND_TOKENS",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "MAX_BPOW_BASE",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "MAX_FEE",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "MAX_IN_RATIO",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "MAX_ORDER_DURATION",
        inputs: [],
        outputs: [{ name: "", type: "uint32", internalType: "uint32" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "MAX_OUT_RATIO",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "MAX_TOTAL_WEIGHT",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "MAX_WEIGHT",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "MIN_BALANCE",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "MIN_BOUND_TOKENS",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "MIN_BPOW_BASE",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "MIN_FEE",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "MIN_WEIGHT",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "NO_TRADING",
        inputs: [],
        outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "allowance",
        inputs: [
          { name: "src", type: "address", internalType: "address" },
          { name: "dst", type: "address", internalType: "address" },
        ],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "approve",
        inputs: [
          { name: "dst", type: "address", internalType: "address" },
          { name: "amt", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "balanceOf",
        inputs: [{ name: "whom", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "bind",
        inputs: [
          { name: "token", type: "address", internalType: "address" },
          { name: "balance", type: "uint256", internalType: "uint256" },
          { name: "denorm", type: "uint256", internalType: "uint256" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "calcInGivenOut",
        inputs: [
          {
            name: "tokenBalanceIn",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "tokenWeightIn", type: "uint256", internalType: "uint256" },
          {
            name: "tokenBalanceOut",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "tokenWeightOut",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "tokenAmountOut",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "swapFee", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "tokenAmountIn", type: "uint256", internalType: "uint256" }],
        stateMutability: "pure",
      },
      {
        type: "function",
        name: "calcOutGivenIn",
        inputs: [
          {
            name: "tokenBalanceIn",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "tokenWeightIn", type: "uint256", internalType: "uint256" },
          {
            name: "tokenBalanceOut",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "tokenWeightOut",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "tokenAmountIn", type: "uint256", internalType: "uint256" },
          { name: "swapFee", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "tokenAmountOut", type: "uint256", internalType: "uint256" }],
        stateMutability: "pure",
      },
      {
        type: "function",
        name: "calcPoolInGivenSingleOut",
        inputs: [
          {
            name: "tokenBalanceOut",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "tokenWeightOut",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "poolSupply", type: "uint256", internalType: "uint256" },
          { name: "totalWeight", type: "uint256", internalType: "uint256" },
          {
            name: "tokenAmountOut",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "swapFee", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "poolAmountIn", type: "uint256", internalType: "uint256" }],
        stateMutability: "pure",
      },
      {
        type: "function",
        name: "calcPoolOutGivenSingleIn",
        inputs: [
          {
            name: "tokenBalanceIn",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "tokenWeightIn", type: "uint256", internalType: "uint256" },
          { name: "poolSupply", type: "uint256", internalType: "uint256" },
          { name: "totalWeight", type: "uint256", internalType: "uint256" },
          { name: "tokenAmountIn", type: "uint256", internalType: "uint256" },
          { name: "swapFee", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "poolAmountOut", type: "uint256", internalType: "uint256" }],
        stateMutability: "pure",
      },
      {
        type: "function",
        name: "calcSingleInGivenPoolOut",
        inputs: [
          {
            name: "tokenBalanceIn",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "tokenWeightIn", type: "uint256", internalType: "uint256" },
          { name: "poolSupply", type: "uint256", internalType: "uint256" },
          { name: "totalWeight", type: "uint256", internalType: "uint256" },
          { name: "poolAmountOut", type: "uint256", internalType: "uint256" },
          { name: "swapFee", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "tokenAmountIn", type: "uint256", internalType: "uint256" }],
        stateMutability: "pure",
      },
      {
        type: "function",
        name: "calcSingleOutGivenPoolIn",
        inputs: [
          {
            name: "tokenBalanceOut",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "tokenWeightOut",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "poolSupply", type: "uint256", internalType: "uint256" },
          { name: "totalWeight", type: "uint256", internalType: "uint256" },
          { name: "poolAmountIn", type: "uint256", internalType: "uint256" },
          { name: "swapFee", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "tokenAmountOut", type: "uint256", internalType: "uint256" }],
        stateMutability: "pure",
      },
      {
        type: "function",
        name: "calcSpotPrice",
        inputs: [
          {
            name: "tokenBalanceIn",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "tokenWeightIn", type: "uint256", internalType: "uint256" },
          {
            name: "tokenBalanceOut",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "tokenWeightOut",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "swapFee", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "spotPrice", type: "uint256", internalType: "uint256" }],
        stateMutability: "pure",
      },
      {
        type: "function",
        name: "commit",
        inputs: [{ name: "orderHash", type: "bytes32", internalType: "bytes32" }],
        outputs: [],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "commitment",
        inputs: [],
        outputs: [{ name: "value", type: "bytes32", internalType: "bytes32" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "decimals",
        inputs: [],
        outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "decreaseApproval",
        inputs: [
          { name: "dst", type: "address", internalType: "address" },
          { name: "amt", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "disableTrading",
        inputs: [],
        outputs: [],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "disableTrading",
        inputs: [
          {
            name: "tradingParams",
            type: "tuple",
            internalType: "struct BaseBCoWPool.TradingParams",
            components: [
              {
                name: "buyToken",
                type: "address",
                internalType: "contract IERC20",
              },
              {
                name: "sellToken",
                type: "address",
                internalType: "contract IERC20",
              },
              { name: "appData", type: "bytes32", internalType: "bytes32" },
            ],
          },
        ],
        outputs: [],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "enableTrading",
        inputs: [
          {
            name: "tradingParams",
            type: "tuple",
            internalType: "struct BaseBCoWPool.TradingParams",
            components: [
              {
                name: "buyToken",
                type: "address",
                internalType: "contract IERC20",
              },
              {
                name: "sellToken",
                type: "address",
                internalType: "contract IERC20",
              },
              { name: "appData", type: "bytes32", internalType: "bytes32" },
            ],
          },
        ],
        outputs: [],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "exitPool",
        inputs: [
          { name: "poolAmountIn", type: "uint256", internalType: "uint256" },
          {
            name: "minAmountsOut",
            type: "uint256[]",
            internalType: "uint256[]",
          },
        ],
        outputs: [],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "exitswapExternAmountOut",
        inputs: [
          { name: "tokenOut", type: "address", internalType: "address" },
          {
            name: "tokenAmountOut",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "maxPoolAmountIn",
            type: "uint256",
            internalType: "uint256",
          },
        ],
        outputs: [{ name: "poolAmountIn", type: "uint256", internalType: "uint256" }],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "exitswapPoolAmountIn",
        inputs: [
          { name: "tokenOut", type: "address", internalType: "address" },
          { name: "poolAmountIn", type: "uint256", internalType: "uint256" },
          { name: "minAmountOut", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "tokenAmountOut", type: "uint256", internalType: "uint256" }],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "finalize",
        inputs: [],
        outputs: [],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "getBalance",
        inputs: [{ name: "token", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "getColor",
        inputs: [],
        outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "getController",
        inputs: [],
        outputs: [{ name: "", type: "address", internalType: "address" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "getCurrentTokens",
        inputs: [],
        outputs: [{ name: "tokens", type: "address[]", internalType: "address[]" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "getDenormalizedWeight",
        inputs: [{ name: "token", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "getFinalTokens",
        inputs: [],
        outputs: [{ name: "tokens", type: "address[]", internalType: "address[]" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "getNormalizedWeight",
        inputs: [{ name: "token", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "getNumTokens",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "getSpotPrice",
        inputs: [
          { name: "tokenIn", type: "address", internalType: "address" },
          { name: "tokenOut", type: "address", internalType: "address" },
        ],
        outputs: [{ name: "spotPrice", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "getSpotPriceSansFee",
        inputs: [
          { name: "tokenIn", type: "address", internalType: "address" },
          { name: "tokenOut", type: "address", internalType: "address" },
        ],
        outputs: [{ name: "spotPrice", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "getSwapFee",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "getTotalDenormalizedWeight",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "gulp",
        inputs: [{ name: "token", type: "address", internalType: "address" }],
        outputs: [],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "hash",
        inputs: [
          {
            name: "tradingParams",
            type: "tuple",
            internalType: "struct BaseBCoWPool.TradingParams",
            components: [
              {
                name: "buyToken",
                type: "address",
                internalType: "contract IERC20",
              },
              {
                name: "sellToken",
                type: "address",
                internalType: "contract IERC20",
              },
              { name: "appData", type: "bytes32", internalType: "bytes32" },
            ],
          },
        ],
        outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
        stateMutability: "pure",
      },
      {
        type: "function",
        name: "increaseApproval",
        inputs: [
          { name: "dst", type: "address", internalType: "address" },
          { name: "amt", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "isBound",
        inputs: [{ name: "t", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "isFinalized",
        inputs: [],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "isPublicSwap",
        inputs: [],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "isValidSignature",
        inputs: [
          { name: "_hash", type: "bytes32", internalType: "bytes32" },
          { name: "signature", type: "bytes", internalType: "bytes" },
        ],
        outputs: [{ name: "", type: "bytes4", internalType: "bytes4" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "joinPool",
        inputs: [
          { name: "poolAmountOut", type: "uint256", internalType: "uint256" },
          {
            name: "maxAmountsIn",
            type: "uint256[]",
            internalType: "uint256[]",
          },
        ],
        outputs: [],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "joinswapExternAmountIn",
        inputs: [
          { name: "tokenIn", type: "address", internalType: "address" },
          { name: "tokenAmountIn", type: "uint256", internalType: "uint256" },
          {
            name: "minPoolAmountOut",
            type: "uint256",
            internalType: "uint256",
          },
        ],
        outputs: [{ name: "poolAmountOut", type: "uint256", internalType: "uint256" }],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "joinswapPoolAmountOut",
        inputs: [
          { name: "tokenIn", type: "address", internalType: "address" },
          { name: "poolAmountOut", type: "uint256", internalType: "uint256" },
          { name: "maxAmountIn", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "tokenAmountIn", type: "uint256", internalType: "uint256" }],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "manager",
        inputs: [],
        outputs: [{ name: "", type: "address", internalType: "address" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "name",
        inputs: [],
        outputs: [{ name: "", type: "string", internalType: "string" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "rebind",
        inputs: [
          { name: "token", type: "address", internalType: "address" },
          { name: "balance", type: "uint256", internalType: "uint256" },
          { name: "denorm", type: "uint256", internalType: "uint256" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "setController",
        inputs: [{ name: "manager", type: "address", internalType: "address" }],
        outputs: [],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "setPublicSwap",
        inputs: [{ name: "public_", type: "bool", internalType: "bool" }],
        outputs: [],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "setSwapFee",
        inputs: [{ name: "swapFee", type: "uint256", internalType: "uint256" }],
        outputs: [],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "solutionSettler",
        inputs: [],
        outputs: [{ name: "", type: "address", internalType: "contract ISettlement" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "solutionSettlerDomainSeparator",
        inputs: [],
        outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "swapExactAmountIn",
        inputs: [
          { name: "tokenIn", type: "address", internalType: "address" },
          { name: "tokenAmountIn", type: "uint256", internalType: "uint256" },
          { name: "tokenOut", type: "address", internalType: "address" },
          { name: "minAmountOut", type: "uint256", internalType: "uint256" },
          { name: "maxPrice", type: "uint256", internalType: "uint256" },
        ],
        outputs: [
          {
            name: "tokenAmountOut",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "spotPriceAfter", type: "uint256", internalType: "uint256" },
        ],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "swapExactAmountOut",
        inputs: [
          { name: "tokenIn", type: "address", internalType: "address" },
          { name: "maxAmountIn", type: "uint256", internalType: "uint256" },
          { name: "tokenOut", type: "address", internalType: "address" },
          {
            name: "tokenAmountOut",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "maxPrice", type: "uint256", internalType: "uint256" },
        ],
        outputs: [
          { name: "tokenAmountIn", type: "uint256", internalType: "uint256" },
          { name: "spotPriceAfter", type: "uint256", internalType: "uint256" },
        ],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "symbol",
        inputs: [],
        outputs: [{ name: "", type: "string", internalType: "string" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "totalSupply",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "tradingParamsHash",
        inputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "transfer",
        inputs: [
          { name: "dst", type: "address", internalType: "address" },
          { name: "amt", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "transferFrom",
        inputs: [
          { name: "src", type: "address", internalType: "address" },
          { name: "dst", type: "address", internalType: "address" },
          { name: "amt", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "unbind",
        inputs: [{ name: "token", type: "address", internalType: "address" }],
        outputs: [],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "vaultRelayer",
        inputs: [],
        outputs: [{ name: "", type: "address", internalType: "address" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "verify",
        inputs: [
          {
            name: "tradingParams",
            type: "tuple",
            internalType: "struct BaseBCoWPool.TradingParams",
            components: [
              {
                name: "buyToken",
                type: "address",
                internalType: "contract IERC20",
              },
              {
                name: "sellToken",
                type: "address",
                internalType: "contract IERC20",
              },
              { name: "appData", type: "bytes32", internalType: "bytes32" },
            ],
          },
          {
            name: "order",
            type: "tuple",
            internalType: "struct GPv2Order.Data",
            components: [
              {
                name: "sellToken",
                type: "address",
                internalType: "contract IERC20",
              },
              {
                name: "buyToken",
                type: "address",
                internalType: "contract IERC20",
              },
              { name: "receiver", type: "address", internalType: "address" },
              {
                name: "sellAmount",
                type: "uint256",
                internalType: "uint256",
              },
              { name: "buyAmount", type: "uint256", internalType: "uint256" },
              { name: "validTo", type: "uint32", internalType: "uint32" },
              { name: "appData", type: "bytes32", internalType: "bytes32" },
              { name: "feeAmount", type: "uint256", internalType: "uint256" },
              { name: "kind", type: "bytes32", internalType: "bytes32" },
              {
                name: "partiallyFillable",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "sellTokenBalance",
                type: "bytes32",
                internalType: "bytes32",
              },
              {
                name: "buyTokenBalance",
                type: "bytes32",
                internalType: "bytes32",
              },
            ],
          },
        ],
        outputs: [],
        stateMutability: "view",
      },
      {
        type: "event",
        name: "Approval",
        inputs: [
          {
            name: "owner",
            type: "address",
            indexed: true,
            internalType: "address",
          },
          {
            name: "spender",
            type: "address",
            indexed: true,
            internalType: "address",
          },
          {
            name: "value",
            type: "uint256",
            indexed: false,
            internalType: "uint256",
          },
        ],
        anonymous: false,
      },
      {
        type: "event",
        name: "LOG_CALL",
        inputs: [
          {
            name: "sig",
            type: "bytes4",
            indexed: true,
            internalType: "bytes4",
          },
          {
            name: "caller",
            type: "address",
            indexed: true,
            internalType: "address",
          },
          {
            name: "data",
            type: "bytes",
            indexed: false,
            internalType: "bytes",
          },
        ],
        anonymous: true,
      },
      {
        type: "event",
        name: "LOG_EXIT",
        inputs: [
          {
            name: "caller",
            type: "address",
            indexed: true,
            internalType: "address",
          },
          {
            name: "tokenOut",
            type: "address",
            indexed: true,
            internalType: "address",
          },
          {
            name: "tokenAmountOut",
            type: "uint256",
            indexed: false,
            internalType: "uint256",
          },
        ],
        anonymous: false,
      },
      {
        type: "event",
        name: "LOG_JOIN",
        inputs: [
          {
            name: "caller",
            type: "address",
            indexed: true,
            internalType: "address",
          },
          {
            name: "tokenIn",
            type: "address",
            indexed: true,
            internalType: "address",
          },
          {
            name: "tokenAmountIn",
            type: "uint256",
            indexed: false,
            internalType: "uint256",
          },
        ],
        anonymous: false,
      },
      {
        type: "event",
        name: "LOG_SWAP",
        inputs: [
          {
            name: "caller",
            type: "address",
            indexed: true,
            internalType: "address",
          },
          {
            name: "tokenIn",
            type: "address",
            indexed: true,
            internalType: "address",
          },
          {
            name: "tokenOut",
            type: "address",
            indexed: true,
            internalType: "address",
          },
          {
            name: "tokenAmountIn",
            type: "uint256",
            indexed: false,
            internalType: "uint256",
          },
          {
            name: "tokenAmountOut",
            type: "uint256",
            indexed: false,
            internalType: "uint256",
          },
        ],
        anonymous: false,
      },
      {
        type: "event",
        name: "TradingDisabled",
        inputs: [],
        anonymous: false,
      },
      {
        type: "event",
        name: "TradingDisabled",
        inputs: [
          {
            name: "hash",
            type: "bytes32",
            indexed: true,
            internalType: "bytes32",
          },
          {
            name: "params",
            type: "tuple",
            indexed: false,
            internalType: "struct BaseBCoWPool.TradingParams",
            components: [
              {
                name: "buyToken",
                type: "address",
                internalType: "contract IERC20",
              },
              {
                name: "sellToken",
                type: "address",
                internalType: "contract IERC20",
              },
              { name: "appData", type: "bytes32", internalType: "bytes32" },
            ],
          },
        ],
        anonymous: false,
      },
      {
        type: "event",
        name: "TradingEnabled",
        inputs: [
          {
            name: "hash",
            type: "bytes32",
            indexed: true,
            internalType: "bytes32",
          },
          {
            name: "params",
            type: "tuple",
            indexed: false,
            internalType: "struct BaseBCoWPool.TradingParams",
            components: [
              {
                name: "buyToken",
                type: "address",
                internalType: "contract IERC20",
              },
              {
                name: "sellToken",
                type: "address",
                internalType: "contract IERC20",
              },
              { name: "appData", type: "bytes32", internalType: "bytes32" },
            ],
          },
        ],
        anonymous: false,
      },
      {
        type: "event",
        name: "Transfer",
        inputs: [
          {
            name: "from",
            type: "address",
            indexed: true,
            internalType: "address",
          },
          {
            name: "to",
            type: "address",
            indexed: true,
            internalType: "address",
          },
          {
            name: "value",
            type: "uint256",
            indexed: false,
            internalType: "uint256",
          },
        ],
        anonymous: false,
      },
      { type: "error", name: "CommitOutsideOfSettlement", inputs: [] },
      { type: "error", name: "OnlyManagerCanCall", inputs: [] },
      { type: "error", name: "OrderDoesNotMatchCommitmentHash", inputs: [] },
      {
        type: "error",
        name: "OrderDoesNotMatchDefaultTradeableOrder",
        inputs: [],
      },
      { type: "error", name: "OrderDoesNotMatchMessageHash", inputs: [] },
      { type: "error", name: "TradingParamsDoNotMatchHash", inputs: [] },
    ],
    BCoWFactory: [
      {
        inputs: [
          { internalType: "address", name: "solutionSettler", type: "address" },
          { internalType: "bytes32", name: "appData", type: "bytes32" },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        inputs: [{ internalType: "address", name: "target", type: "address" }],
        name: "AddressEmptyCode",
        type: "error",
      },
      {
        inputs: [{ internalType: "address", name: "account", type: "address" }],
        name: "AddressInsufficientBalance",
        type: "error",
      },
      { inputs: [], name: "BCoWFactory_NotValidBCoWPool", type: "error" },
      { inputs: [], name: "BFactory_AddressZero", type: "error" },
      { inputs: [], name: "BFactory_NotBDao", type: "error" },
      { inputs: [], name: "FailedInnerCall", type: "error" },
      {
        inputs: [{ internalType: "address", name: "token", type: "address" }],
        name: "SafeERC20FailedOperation",
        type: "error",
      },
      {
        anonymous: false,
        inputs: [{ indexed: true, internalType: "address", name: "bCoWPool", type: "address" }],
        name: "COWAMMPoolCreated",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, internalType: "address", name: "caller", type: "address" },
          { indexed: true, internalType: "address", name: "bDao", type: "address" },
        ],
        name: "LOG_BDAO",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, internalType: "address", name: "caller", type: "address" },
          { indexed: true, internalType: "address", name: "bPool", type: "address" },
        ],
        name: "LOG_NEW_POOL",
        type: "event",
      },
      {
        inputs: [],
        name: "APP_DATA",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "SOLUTION_SETTLER",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "contract IBPool", name: "bPool", type: "address" }],
        name: "collect",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "getBDao",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "bPool", type: "address" }],
        name: "isBPool",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      { inputs: [], name: "logBCoWPool", outputs: [], stateMutability: "nonpayable", type: "function" },
      {
        inputs: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "symbol", type: "string" },
        ],
        name: "newBPool",
        outputs: [{ internalType: "contract IBPool", name: "bPool", type: "address" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "bDao", type: "address" }],
        name: "setBDao",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
  },
  Balancer: {},
} as const;
