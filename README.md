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

1. Choose `targetFork` network in `scaffold.config.ts`

```
  targetFork: chains.sepolia,
```

2. Start the Fork using a matching RPC_URL

```
anvil --fork-url <RPC_URL>
```

3. Start the frontend

```
yarn start
```
