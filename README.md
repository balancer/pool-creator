# Pool Creator

A frontend tool for creating and initializing various pool types on Balancer

### Notes

- Cannot create pools with same token pairs, weight, and swap fee
  - except on testnets its allowed for convenience

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
