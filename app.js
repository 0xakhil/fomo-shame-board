const FEE_WALLET = "R4rNJHaffSUotNmqSKNEfDcJE8A7zJUkaoM5Jkd7cYX";
const FEE_ATA = "HrTf9CzXR1dRH4Sof5QrpmGWwpwAf3qZzwCsEjQpXcSq";
const USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

const money = (n) =>
  n == null
    ? "—"
    : Number(n).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const short = (a) => (a ? `${a.slice(0, 4)}…${a.slice(-4)}` : "");

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`failed ${path}`);
  return res.json();
}

function renderProtocol(p) {
  const c = p.combined;
  document.getElementById("stats").innerHTML = [
    ["24h fees", money(c.fees24hUsd), "Llama combined"],
    ["7d fees", money(c.fees7dUsd), "Llama combined"],
    ["30d fees", money(c.fees30dUsd), "Llama combined"],
    ["all-time fees", money(c.feesAllTimeUsd), "Llama combined"],
    ["Solana 30d", money(p.breakdown.fomoWallet.fees30dUsd), "fomo Wallet"],
    ["Perps 30d", money(p.breakdown.fomoPerps.fees30dUsd), "builder codes"],
  ]
    .map(
      ([k, v, s]) =>
        `<div class="stat"><span>${k}</span><b>${v}</b><span>${s}</span></div>`
    )
    .join("");
  document.getElementById("snap").textContent = `snapshot ${p.snapshotAt}`;
}

function renderBands(sched) {
  document.getElementById("bands").innerHTML = sched.solanaBands
    .map((b) => {
      const range = b.maxUsd == null ? `$${b.minUsd}+` : `$${b.minUsd}–$${b.maxUsd}`;
      return `<div class="band"><div>${range}</div><strong>${b.fee}</strong><div>ex $${b.example.size} → $${b.example.fee} (${b.example.effectivePct}%)</div></div>`;
    })
    .join("");
}

function renderBoard(list) {
  document.getElementById("window-note").textContent = `${list.window}. Distinct senders: ${list.totals.distinctSenders.toLocaleString()}. Sum in window: ${money(list.totals.totalUsdc30d)}.`;
  const body = list.rows
    .map((r) => {
      const sol = `https://solscan.io/account/${r.sender}`;
      const xfer = `https://solscan.io/account/${r.sender}#transfers`;
      return `<tr>
        <td>#${r.rank}</td>
        <td class="addr"><a href="${sol}">${r.sender}</a></td>
        <td>${money(r.usdc)}</td>
        <td>${r.transfers.toLocaleString()}</td>
        <td>${r.pctOfTotal}%</td>
        <td><a href="${xfer}">transfers</a></td>
      </tr>`;
    })
    .join("");
  document.getElementById("board-body").innerHTML = body;
}

function lookup() {
  const raw = document.getElementById("wallet").value.trim();
  const out = document.getElementById("receipt");
  if (!raw) {
    out.textContent = "paste a Solana address";
    return;
  }
  const url = `https://solscan.io/account/${raw}#transfers`;
  const fee = `https://solscan.io/account/${FEE_WALLET}`;
  out.textContent = `FOMO SHAME SLIP
wallet     ${raw}
short      ${short(raw)}
look for   USDC (${USDC})
paid to    ${FEE_WALLET}
ata        ${FEE_ATA}

Open your transfers and filter destination = fee wallet.
This page does not scrape private FOMO profiles.

${url}
fee wallet ${fee}`;
}

async function main() {
  const [protocol, schedule, senders] = await Promise.all([
    loadJSON("data/protocol.json"),
    loadJSON("data/fee-schedule.json"),
    loadJSON("data/top-senders-30d.json"),
  ]);
  renderProtocol(protocol);
  renderBands(schedule);
  renderBoard(senders);
  document.getElementById("go").addEventListener("click", lookup);
  document.getElementById("wallet").addEventListener("keydown", (e) => {
    if (e.key === "Enter") lookup();
  });
}

main().catch((err) => {
  document.getElementById("stats").textContent = String(err);
});
