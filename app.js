const FEE_WALLET = "R4rNJHaffSUotNmqSKNEfDcJE8A7zJUkaoM5Jkd7cYX";
const FEE_ATA = "HrTf9CzXR1dRH4Sof5QrpmGWwpwAf3qZzwCsEjQpXcSq";
const USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

const money = (n) =>
  n == null
    ? "—"
    : Number(n).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

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
    .map(([k, v, s]) => `<div class="stat"><span>${k}</span><b>${v}</b><span>${s}</span></div>`)
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
  document.getElementById("board-body").innerHTML = list.rows
    .map((r) => {
      const sol = `https://solscan.io/account/${r.sender}`;
      return `<tr>
        <td>#${r.rank}</td>
        <td class="addr"><a href="${sol}">${r.sender}</a></td>
        <td>${money(r.usdc)}</td>
        <td>${r.transfers.toLocaleString()}</td>
        <td>${r.pctOfTotal}%</td>
        <td><a href="${sol}#transfers">transfers</a></td>
      </tr>`;
    })
    .join("");
}

function slipText(info) {
  const wallet = info.solana || "not indexed";
  return `FOMO SHAME SLIP
handle     ${info.handle || "(wallet only)"}
name       ${info.displayName || "—"}
followers  ${info.followers != null ? info.followers.toLocaleString() : "—"}
fomo vol   ${info.totalVolume ? money(Number(info.totalVolume)) : "—"}
solana     ${wallet}
evm        ${info.evm || "—"}
look for   USDC → ${FEE_WALLET}
ata        ${FEE_ATA}

${wallet !== "not indexed" ? `https://solscan.io/account/${wallet}#transfers` : ""}
${info.profile || ""}`;
}

async function lookup() {
  const raw = document.getElementById("wallet").value.trim();
  const out = document.getElementById("receipt");
  const card = document.getElementById("who");
  if (!raw) {
    out.textContent = "paste a FOMO username, profile URL, or Solana address";
    return;
  }
  out.textContent = "resolving handle…";
  card.hidden = true;
  try {
    const r = await fetch(`/api/lookup?q=${encodeURIComponent(raw)}`);
    const data = await r.json();
    if (!r.ok) {
      out.textContent = `not found: ${data.detail || data.error || "unknown"}\ntry a Solana address instead, or a handle already in the public index.`;
      return;
    }
    out.textContent = slipText(data);
    if (data.handle) {
      card.hidden = false;
      document.getElementById("who-name").textContent = data.displayName || data.handle;
      document.getElementById("who-handle").textContent = `@${data.handle}`;
      document.getElementById("who-link").href = data.profile;
      const av = document.getElementById("who-av");
      if (data.avatar) {
        av.src = data.avatar;
        av.hidden = false;
      } else {
        av.hidden = true;
      }
    }
    const params = new URLSearchParams(location.search);
    params.set("q", data.handle || raw);
    history.replaceState(null, "", `?${params.toString()}`);
  } catch (err) {
    out.textContent = `lookup failed (${err.message}). Deploy on Vercel so /api/lookup exists.`;
  }
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
  const q = new URLSearchParams(location.search).get("q");
  if (q) {
    document.getElementById("wallet").value = q;
    lookup();
  }
}

main().catch((err) => {
  document.getElementById("stats").textContent = String(err);
});
