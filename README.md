# FOMO shame board

Public board for **fomo.family** trading fees. Search by **FOMO username**, profile URL, or Solana address.

Repo: https://github.com/0xakhil/fomo-shame-board

## What this is

- Search `orangie`, `@Quanterty`, or `https://fomo.family/profile/cryptolyxe`
- `/api/lookup` resolves the handle to Solana + EVM wallets via the public FomoScan `get-user` index
- Protocol fee totals from [DefiLlama](https://defillama.com/fees/fomo)
- Solana ticket-size fee bands
- Largest USDC senders into the fee wallet (Dune snapshot)

Handles that were never indexed return 404. We do not log into FOMO.

## On-chain constants (verified 2026-09-04)

| thing | address |
| --- | --- |
| Solana fee wallet | `R4rNJHaffSUotNmqSKNEfDcJE8A7zJUkaoM5Jkd7cYX` |
| USDC fee ATA | `HrTf9CzXR1dRH4Sof5QrpmGWwpwAf3qZzwCsEjQpXcSq` |
| USDC mint | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| app co-signer (seen on routed swaps) | `AgmLJBMDCqWynYnQiPCuj9ewsNNsBJXyzoUhD9LJzN51` |

DefiLlama's Solana adapter sums USDC received by the fee wallet, then adds off-chain Relay fees from a Dune table. Perps are Hyperliquid builder codes and live in a child protocol.

## Snapshot in `/data`

Pulled 2026-09-04 from Llama:

| | 24h | 7d | 30d | all-time |
| --- | --- | --- | --- | --- |
| combined | $603,501 | $6,479,730 | $17,846,373 | $47,003,909 |
| fomo Wallet (mostly Solana) | $582,965 | $6,272,442 | $17,253,645 | $46,082,189 |
| fomo Perps | $20,536 | $207,288 | $592,728 | $921,720 |

## Run it

Vercel picks up `api/lookup.js` as a serverless function. After deploy:

`https://YOUR-APP.vercel.app/?q=orangie`

Local static preview will load the board but handle search needs the API route.

## License

MIT. Unofficial. Not affiliated with FOMO Labs, Inc.
