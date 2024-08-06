export function getPoolUrl(chainId: number, poolAddress: string) {
  switch (chainId) {
    case 1:
      return `https://balancer.fi/pools/ethereum/cow/${poolAddress}`;
    case 100:
      return `https://balancer.fi/pools/gnosis/cow/${poolAddress}`;
    case 11155111:
      return `https://test.balancer.fi/pools/sepolia/cow/${poolAddress}`;
    default:
      return "unknown";
  }
}
