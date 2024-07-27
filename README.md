# Scaffold CoW

### Pool Lifecycle

1. Create a pool by calling `newBPool()` at the factory contract
2. Approve each token to be spent by the pool
3. Bind each token using 50/50 weight
   - bind 2 tokens with 1e18 as the denormalized weight for each and that means the pool is 50/50
4. Set the swap fee with `pool.setSwapFee(fee)`
5. Initialize the pool to be ready for trading with `finalize` which mints bpt to sender

### Resources

#### Factory Addresses

- https://balancerecosystem.slack.com/archives/C070C8VLSNM/p1722012869691689

#### ABIs

- https://github.com/balancer/cow-amm-subgraph/tree/main/abis

#### Create Pool Tx

- https://sepolia.etherscan.io/tx/0x2ae8e9cf4a8e5d9df26140fc265d8c7679386239de3cdaf549be5ab6108b5035

#### Init Pool Txs

- https://sepolia.etherscan.io/address/0x60048091401F27117C3DFb8136c1ec550D949B12

#### Code Examples

- https://github.com/defi-wonderland/balancer-v1-amm/
- https://github.com/balancer/b-sdk/blob/7fc1a5d13b1d5408d23a8c4e856d671f40549c11/test/cowAmm/addLiquidity.integration.test.ts

#### Full Pool Lifecycle Script

- https://github.com/balancer/cow-amm/blob/main/script/Script.s.sol#L37

#### Balancer v2 Pool Creator

- https://www.youtube.com/watch?v=eCjQIMHWMNs
