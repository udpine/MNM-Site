import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";

interface PriceData {
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: string;
}

interface HistoryData {
  timestamp: string;
  price: number;
  volume: number;
}

const timeRanges = [
  { label: "1D", days: 1 },
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
] as const;

export default function PriceChart() {
  const [selectedRange, setSelectedRange] = useState(7);

  // Fetch current price data
  const { data: currentPrice, isLoading: isPriceLoading } = useQuery<PriceData>({
    queryKey: ["/api/price/current"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch historical price data
  const { data: priceHistory, isLoading: isHistoryLoading } = useQuery<HistoryData[]>({
    queryKey: ["/api/price/history", selectedRange],
    queryFn: async () => {
      const response = await fetch(`/api/price/history?days=${selectedRange}`);
      if (!response.ok) throw new Error("Failed to fetch price history");
      return response.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Format chart data
  const chartData = priceHistory?.map(item => ({
    time: new Date(item.timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      ...(selectedRange <= 1 ? { hour: '2-digit' } : {})
    }),
    price: item.price,
    volume: item.volume
  })) || [];

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border vintage-border p-3 rounded-lg shadow-lg">
          <p className="font-semibold text-primary">{label}</p>
          <p className="text-foreground">
            Price: <span className="font-bold">${payload[0].value.toFixed(6)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const isPositiveChange = (currentPrice?.change24h || 0) >= 0;

  return (
    <Card className="vintage-border cartoon-shadow bg-background p-6 space-y-6">
      <div className="space-y-4">
        {/* Price Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-primary mb-1" data-testid="chart-title">
              $MNM PRICE CHART
            </h3>
            <p className="text-sm text-muted-foreground font-medium">Live Price Data</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-primary" data-testid="current-price">
              {isPriceLoading ? "..." : `$${currentPrice?.price.toFixed(6) || "0.000000"}`}
            </div>
            <div 
              className={`text-sm font-bold ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}
              data-testid="price-change"
            >
              {isPriceLoading ? "..." : `${isPositiveChange ? '+' : ''}${currentPrice?.change24h.toFixed(2) || "0.00"}%`}
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex space-x-2">
          {timeRanges.map((range) => (
            <Button
              key={range.days}
              onClick={() => setSelectedRange(range.days)}
              className={`px-4 py-2 font-bold text-sm ${
                selectedRange === range.days
                  ? 'vintage-button bg-primary text-primary-foreground'
                  : 'vintage-button bg-background text-primary hover:bg-accent'
              }`}
              data-testid={`range-${range.label.toLowerCase()}`}
            >
              {range.label}
            </Button>
          ))}
        </div>

        {/* Chart */}
        <div className="h-64 w-full">
          {isHistoryLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground font-medium" data-testid="chart-loading">
                Loading chart data...
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="time" 
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  fontWeight="500"
                />
                <YAxis 
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  fontWeight="500"
                  tickFormatter={(value) => `$${value.toFixed(6)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: "var(--primary)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-lg font-black text-primary" data-testid="volume-24h">
              {isPriceLoading ? "..." : `$${(currentPrice?.volume24h || 0).toLocaleString()}`}
            </div>
            <div className="text-xs text-muted-foreground font-medium">24H VOLUME</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black text-primary" data-testid="market-cap">
              {isPriceLoading ? "..." : `$${(currentPrice?.marketCap || 0).toLocaleString()}`}
            </div>
            <div className="text-xs text-muted-foreground font-medium">MARKET CAP</div>
          </div>
        </div>
      </div>
    </Card>
  );
}