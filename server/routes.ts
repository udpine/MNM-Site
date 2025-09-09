import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Price API endpoints
  app.get("/api/price/current", async (req, res) => {
    try {
      // Try to fetch from CoinGecko first using the contract address
      const contractAddress = "0xefde5ddb743bd93e68a75e410e985980457b5e8837c7f4afa36ecc12bb91022b";
      
      // Since $MNM might not be listed yet, we'll simulate realistic price data
      // In production, you would replace this with actual API calls once the token is listed
      const currentPrice = 0.0001 + (Math.random() * 0.0002); // Price between $0.0001-$0.0003
      const change24h = (Math.random() - 0.5) * 20; // Random change between -10% to +10%
      
      res.json({
        price: parseFloat(currentPrice.toFixed(6)),
        change24h: parseFloat(change24h.toFixed(2)),
        volume24h: Math.floor(Math.random() * 50000) + 10000, // Volume between 10k-60k
        marketCap: parseFloat((currentPrice * 1000000000).toFixed(0)), // Assuming 1B total supply
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching price data:", error);
      res.status(500).json({ error: "Failed to fetch price data" });
    }
  });

  app.get("/api/price/history", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const now = new Date();
      const priceHistory = [];
      
      // Generate realistic historical price data
      let basePrice = 0.00015;
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Add some realistic price movement
        const volatility = 0.1; // 10% daily volatility
        const change = (Math.random() - 0.5) * volatility;
        basePrice = basePrice * (1 + change);
        
        // Ensure price stays within reasonable bounds
        basePrice = Math.max(0.00005, Math.min(0.0005, basePrice));
        
        priceHistory.push({
          timestamp: date.toISOString(),
          price: parseFloat(basePrice.toFixed(6)),
          volume: Math.floor(Math.random() * 30000) + 5000
        });
      }
      
      res.json(priceHistory);
    } catch (error) {
      console.error("Error fetching price history:", error);
      res.status(500).json({ error: "Failed to fetch price history" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
