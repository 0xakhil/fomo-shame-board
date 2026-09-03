# Data sources

## Protocol totals
- GET https://api.llama.fi/summary/fees/fomo
- GET https://api.llama.fi/summary/fees/fomo-wallet
- GET https://api.llama.fi/summary/fees/fomo-perps
- Adapter: https://github.com/DefiLlama/dimension-adapters/blob/master/fees/fomo/index.ts

## Fee wallet
- RPC `getTokenAccountsByOwner` on `R4rNJHaffSUotNmqSKNEfDcJE8A7zJUkaoM5Jkd7cYX` for USDC mint
- ATA `HrTf9CzXR1dRH4Sof5QrpmGWwpwAf3qZzwCsEjQpXcSq` held ~228,845 USDC at 2026-09-04 03:50 UTC-ish (sweep account, not lifetime)

## Concentration
- https://dune.com/queries/7900900
- Filter: USDC transfers where `to_owner` is the fee wallet

## Schedule
- Independent compilation of help.fomo.family as of 2026-08-20 (FomoAppGuide)
