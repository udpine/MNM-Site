// server/routes.ts
import type { Express } from "express";

export function attachRoutes(app: Express) {
  app.get("/api/price/current", async (req, res) => {
    // ... your price fetch logic
  });

  app.get("/api/price/history", async (req, res) => {
    // ... your history fetch logic
  });
}
