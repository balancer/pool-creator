-include .env

fork: fork-sepolia fork-mainnet fork-gnosis fork-arbitrum fork-base

fork-%:
	@echo "Forking the $* network..."
	anvil --fork-url $($(shell echo $* | tr a-z A-Z)_RPC_URL) --chain-id 31337
