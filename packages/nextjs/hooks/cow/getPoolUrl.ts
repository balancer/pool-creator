export function getPoolUrl(chainId: number, poolAddress: string) {
  switch (chainId) {
    case 1:
      return `https://balancer.fi/pools/ethereum/cow/${poolAddress}`;
    case 100:
      return `https://balancer.fi/pools/gnosis/cow/${poolAddress}`;
    case 11155111:
      return `https://test.balancer.fi/pools/sepolia/cow/${poolAddress}`;
    case 42161:
      return `https://balancer.fi/pools/arbitrum/cow/${poolAddress}`;
    case 8453:
      return `https://balancer.fi/pools/base/cow/${poolAddress}`;
    default:
      return "unknown";
  }
}
