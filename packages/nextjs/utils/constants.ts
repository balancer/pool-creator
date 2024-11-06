export const COW_MIN_AMOUNT = BigInt(1e6);

/**
 * @dev Gauge creation reverts if the name is longer than 32 characters
 * https://github.com/balancer/pool-creator/issues/17#issuecomment-2430158673
 */
export const MAX_POOL_NAME_LENGTH = 32;
