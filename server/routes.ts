// server/routes.ts
import type { Express } from "express";

export function attachRoutes(app: Express) {
  // GET /api/price/current
  app.get("/api/price/current", async (_req, res) => {
    const contractAddress =
      "0xefde5ddb743bd93e68a75e410e985980457b5e8837c7f4afa36ecc12bb91022b";

    // Try CoinGecko on-chain token endpoint first
    try {
      const r = await fetch(
        `https://api.coingecko.com/api/v3/onchain/networks/sui-network/tokens/${contractAddress}`,
        {
          headers: {
            Accept: "application/json",
            "x-cg-pro-api-key": process.env.COINGECKO_API_KEY || "",
          },
        }
      );

      if (r.ok) {
        const data = await r.json();
        const d = data?.data;
        if (d?.price_usd) {
          return res.json({
            price: Number(d.price_usd),
            change24h: d.price_change_percentage_24h ?? 0,
            volume24h: d.volume_24h_usd ?? 0,
            marketCap: d.market_cap_usd ?? 0,
            lastUpdated: new Date().toISOString(),
            source: "CoinGecko onchain",
          });
        }
      }
    } catch (e) {
      console.log("onchain fetch failed:", e);
    }

    // Fallback: try search + simple price
    try {
      const sr = await fetch(
        `https://api.coingecko.com/api/v3/search?query=MNM+sui`,
        {
          headers: {
            Accept: "application/json",
            "x-cg-pro-api-key": process.env.COINGECKO_API_KEY || "",
          },
        }
      );
      if (sr.ok) {
        const s = await sr.json();
        const mnm = (s?.coins || []).find(
          (c: any) =>
            c?.symbol?.toLowerCase() === "mnm" ||
            c?.name?.toLowerCase().includes("little man")
        );
        if (mnm?.id) {
          const pr = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
              mnm.id
            )}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
            {
              headers: {
                Accept: "application/json",
                "x-cg-pro-api-key": process.env.COINGECKO_API_KEY || "",
              },
            }
          );
          if (pr.ok) {
            const p = await pr.json();
            const t = p?.[mnm.id];
            if (t?.usd != null) {
              return res.json({
                price: t.usd,
                change24h: t.usd_24h_change ?? 0,
                volume24h: t.usd_24h_vol ?? 0,
                marketCap: t.usd_market_cap ?? 0,
                lastUpdated: new Date().toISOString(),
                source: "CoinGecko simple/price",
                tokenId: mnm.id,
              });
            }
          }
        }
      }
    } catch (e) {
      console.log("search/simple price failed:", e);
    }

    // Last resort: informative nulls
    return res.json({
      price: null,
      change24h: null,
      volume24h: null,
      marketCap: null,
      lastUpdated: new Date().toISOString(),
      error: "Token not yet listed on major price tracking services",
      message:
        "This token may be newly launched and not yet indexed. Data will appear once it’s listed.",
      contractAddress,
    });
  });

  // GET /api/price/history
  app.get("/api/price/history", async (req, res) => {
    const days = Number(req.query.days) || 7;

    try {
      // (Optional) do the same search flow as above to resolve a CoinGecko token id
      // Then call market_chart
      // If not available, fall through to empty payload with message.
      return res.json({
        error: "Historical data not available",
        message:
          "This token isn’t indexed yet. History will be available once listed.",
        data: [],
      });
    } catch (e) {
      console.error("history failed:", e);
      return res.status(500).json({ error: "Failed to fetch price history" });
    }
  });
}
