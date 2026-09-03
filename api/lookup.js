const UPSTREAM = "https://api-production-9541.up.railway.app";

function parseHandle(raw) {
  if (!raw) return null;
  let s = String(raw).trim();
  s = s.replace(/^@/, "");
  try {
    if (s.includes("fomo.family")) {
      const u = new URL(s.startsWith("http") ? s : `https://${s}`);
      const parts = u.pathname.split("/").filter(Boolean);
      const i = parts.findIndex((p) => p.toLowerCase() === "profile");
      if (i >= 0 && parts[i + 1]) s = parts[i + 1];
    }
  } catch (_) {
    /* bare handle */
  }
  s = s.split(/[/?#]/)[0];
  if (!/^[A-Za-z0-9_.-]{1,64}$/.test(s)) return null;
  return s;
}

function looksLikeSolana(s) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s) && !s.includes(".");
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "GET") {
    res.status(405).json({ error: "GET only" });
    return;
  }

  const q = String(req.query.q || req.query.handle || "").trim();
  if (!q) {
    res.status(400).json({ error: "missing q" });
    return;
  }

  if (looksLikeSolana(q) && !q.includes("fomo.family") && !q.startsWith("@")) {
    res.status(200).json({
      kind: "wallet",
      handle: null,
      solana: q,
      evm: null,
    });
    return;
  }

  const handle = parseHandle(q);
  if (!handle) {
    res.status(400).json({ error: "bad handle" });
    return;
  }

  try {
    const r = await fetch(`${UPSTREAM}/get-user/${encodeURIComponent(handle.toLowerCase())}`, {
      headers: { Accept: "application/json" },
    });
    const body = await r.json();
    if (!r.ok || body?.error) {
      res.status(404).json({
        error: "not found",
        handle,
        detail: body?.error?.message || "handle not indexed yet",
      });
      return;
    }
    const u = body.user || body;
    const sol = u.wallets?.solana?.address || u.solanaAddress || null;
    const evm = u.wallets?.evm?.address || u.evmAddress || null;
    res.status(200).json({
      kind: "handle",
      handle: u.username || handle,
      displayName: u.displayName || null,
      bio: u.bio || null,
      avatar: u.avatar || null,
      followers: u.social?.followers ?? null,
      swapCount: u.fomoStats?.swapCount ?? null,
      numTrades: u.fomoStats?.numTrades ?? null,
      totalVolume: u.fomoStats?.totalVolume ?? null,
      solana: sol,
      evm,
      profile: `https://fomo.family/profile/${u.username || handle}`,
      source: "fomoscan get-user index",
    });
  } catch (err) {
    res.status(502).json({ error: "upstream failed", detail: String(err.message || err) });
  }
}
