#!/usr/bin/env bash
# Install pinned Solidity dependencies (not vendored in git).
set -euo pipefail
cd "$(dirname "$0")"
forge install OpenZeppelin/openzeppelin-contracts@v5.1.0 --no-git
forge install foundry-rs/forge-std --no-git
