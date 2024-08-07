# Pool Creator

A frontend tool for creating and initializing various pool types on Balancer

## Requirements

To run the code locally, the following tools are required:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

1. Clone this repo & install dependencies

```
git clone https://github.com/balancer/pool-creator.git
cd pool-creator
yarn install
```

2. Start the frontend

```
yarn start
```

## Run on Fork

1. Add `chains.foundry` as the first item of `targetNetworks` in the `scaffold.config.ts` file

```
  targetNetworks: [chains.foundry, chains.sepolia, chains.mainnet, chains.gnosis],
```

2. Choose a `targetFork` network in `scaffold.config.ts`

```
  targetFork: chains.sepolia,
```

3. Start the fork using `RPC_URL` that matches chain chosen for `targetFork`

```
anvil --fork-url <RPC_URL> --chain-id 31337
```

4. Start the frontend

```
yarn start
```
