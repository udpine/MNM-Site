import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Price API endpoints
  app.get("/api/price/current", async (req, res) => {
    try {
      const contractAddress = "0xefde5ddb743bd93e68a75e410e985980457b5e8837c7f4afa36ecc12bb91022b";
      
      // Try to fetch real data from CoinGecko SUI network
      try {
        const coinGeckoResponse = await fetch(
          `https://api.coingecko.com/api/v3/onchain/networks/sui-network/tokens/${contractAddress}`,
          {
            headers: {
              'Accept': 'application/json',
            }
          }
        );
        
        if (coinGeckoResponse.ok) {
          const data = await coinGeckoResponse.json();
          if (data && data.data && data.data.price_usd) {
            res.json({
              price: parseFloat(data.data.price_usd),
              change24h: data.data.price_change_percentage_24h || 0,
              volume24h: data.data.volume_24h_usd || 0,
              marketCap: data.data.market_cap_usd || 0,
              lastUpdated: new Date().toISOString(),
              source: "CoinGecko"
            });
            return;
          }
        }
      } catch (apiError) {
        console.log("CoinGecko API not available for this token, trying alternative sources...");
      }

      // Try alternative: Check if it's listed on major exchanges via CoinGecko search
      try {
        const searchResponse = await fetch(
          `https://api.coingecko.com/api/v3/search?query=MNM+sui`,
          {
            headers: {
              'Accept': 'application/json',
            }
          }
        );
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.coins && searchData.coins.length > 0) {
            const mnmToken = searchData.coins.find((coin: any) => 
              coin.symbol.toLowerCase() === 'mnm' || coin.name.toLowerCase().includes('little man')
            );
            
            if (mnmToken) {
              const priceResponse = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${mnmToken.id}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
              );
              
              if (priceResponse.ok) {
                const priceData = await priceResponse.json();
                const tokenData = priceData[mnmToken.id];
                
                res.json({
                  price: tokenData.usd,
                  change24h: tokenData.usd_24h_change || 0,
                  volume24h: tokenData.usd_24h_vol || 0,
                  marketCap: tokenData.usd_market_cap || 0,
                  lastUpdated: new Date().toISOString(),
                  source: "CoinGecko",
                  tokenId: mnmToken.id
                });
                return;
              }
            }
          }
        }
      } catch (searchError) {
        console.log("CoinGecko search failed:", searchError);
      }
      
      // If no real data available, return a message indicating this
      res.json({
        price: null,
        change24h: null,
        volume24h: null,
        marketCap: null,
        lastUpdated: new Date().toISOString(),
        error: "Token not yet listed on major price tracking services",
        message: "This token may be newly launched and not yet indexed by price APIs. Real price data will appear once listed on exchanges.",
        contractAddress: contractAddress
      });
      
    } catch (error) {
      console.error("Error fetching price data:", error);
      res.status(500).json({ error: "Failed to fetch price data" });
    }
  });

  app.get("/api/price/history", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const contractAddress = "0xefde5ddb743bd93e68a75e410e985980457b5e8837c7f4afa36ecc12bb91022b";
      
      // Try to fetch real historical data
      try {
        // First try CoinGecko search to find the token
        const searchResponse = await fetch(
          `https://api.coingecko.com/api/v3/search?query=MNM+sui`,
          {
            headers: {
              'Accept': 'application/json',
            }
          }
        );
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.coins && searchData.coins.length > 0) {
            const mnmToken = searchData.coins.find((coin: any) => 
              coin.symbol.toLowerCase() === 'mnm' || coin.name.toLowerCase().includes('little man')
            );
            
            if (mnmToken) {
              const historyResponse = await fetch(
                `https://api.coingecko.com/api/v3/coins/${mnmToken.id}/market_chart?vs_currency=usd&days=${days}`
              );
              
              if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                const priceHistory = historyData.prices.map((item: [number, number], index: number) => ({
                  timestamp: new Date(item[0]).toISOString(),
                  price: item[1],
                  volume: historyData.total_volumes[index] ? historyData.total_volumes[index][1] : 0
                }));
                
                res.json(priceHistory);
                return;
              }
            }
          }
        }
      } catch (apiError) {
        console.log("Unable to fetch real historical data for this token");
      }
      
      // If no real data available, return empty array with message
      res.json({
        error: "Historical data not available",
        message: "This token is not yet listed on price tracking services. Historical data will be available once the token is indexed by major exchanges.",
        contractAddress: contractAddress,
        data: []
      });
      
    } catch (error) {
      console.error("Error fetching price history:", error);
      res.status(500).json({ error: "Failed to fetch price history" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
