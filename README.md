# FOMO shame board

Public, wallet-first board for **fomo.family** trading fees.

Repo: https://github.com/0xakhil/fomo-shame-board

## What this is

- Protocol fee totals from [DefiLlama](https://defillama.com/fees/fomo)
- Solana ticket-size fee bands (why a $10 trade is not 0.50%)
- Largest USDC senders into the known Solana fee wallet (Dune snapshot)
- A receipt slip that points any pasted wallet at Solscan transfers

It does **not** scrape private FOMO sessions or attach handles unless you do that yourself with community indexes.

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

Top senders in `data/top-senders-30d.json` are from [Dune 7900900](https://dune.com/queries/7900900) (30d window around mid-2026, ~100,879 distinct senders, ~$3.14M USDC in that query's window). The #1–5 wallets each have 30k+ transfers — treat them as flow hubs, not "one guy."

## Run it

Static files. Open `index.html` or serve the folder:

```bash
python3 -m http.server 4173
```

## How to score one wallet

Sum USDC transfers from that wallet (or its USDC ATA) to `R4rNJH…` / `HrTf9C…`.

Production lookup wants an indexer (Helius `getTransfersByAddress`, Bitquery, Solscan Pro, or Dune). Public RPC pagination will choke on copy-traders.

## Not included (yet)

- Live per-wallet summation
- FOMO handle resolution
- EVM / Relay / perps personal receipts
- Token-tax and AMM fees that are not FOMO's cut

## License

MIT. Unofficial. Not affiliated with FOMO Labs, Inc.
