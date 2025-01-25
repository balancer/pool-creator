export const COW_MIN_AMOUNT = BigInt(1e6);

/**
 * @dev Gauge creation reverts if the name is longer than 32 characters
 * @dev Gauge creation reverts if the symbol is longer than 26 characters (Franz said so)
 * https://github.com/balancer/pool-creator/issues/17#issuecomment-2430158673
 */
export const MAX_POOL_NAME_LENGTH = 32;
export const MAX_POOL_SYMBOL_LENGTH = 26;
