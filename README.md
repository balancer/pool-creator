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

> ⚠️ **Note:** Fork development is only supported for CoW AMMs

1. Add the following ENV vars to a `.env` file located in the root directory

```
SEPOLIA_RPC_URL=
MAINNET_RPC_URL=
GNOSIS_RPC_URL=
ARBITRUM_RPC_URL=
BASE_RPC_URL=
```

2. Add `chains.foundry` as the first item of `targetNetworks` in the `scaffold.config.ts` file

```
  targetNetworks: [chains.foundry, chains.sepolia, chains.mainnet, chains.gnosis],
```

3. Set a `targetFork` network in `scaffold.config.ts`

```
  targetFork: chains.sepolia,
```

4. Start the fork using the same network as `targetFork`

```
make fork-sepolia
make fork-mainnet
make fork-gnosis
make fork-arbitrum
make fork-base
```

5. Start the frontend

```
yarn start
```
