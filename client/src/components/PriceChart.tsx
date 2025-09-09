import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";

interface PriceData {
  price: number | null;
  change24h: number | null;
  volume24h: number | null;
  marketCap: number | null;
  lastUpdated: string;
  error?: string;
  message?: string;
  source?: string;
  contractAddress?: string;
}

interface HistoryData {
  timestamp: string;
  price: number;
  volume: number;
}

interface HistoryResponse {
  error?: string;
  message?: string;
  contractAddress?: string;
  data?: HistoryData[];
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
  const { data: priceHistoryResponse, isLoading: isHistoryLoading } = useQuery<HistoryResponse | HistoryData[]>({
    queryKey: ["/api/price/history", selectedRange],
    queryFn: async () => {
      const response = await fetch(`/api/price/history?days=${selectedRange}`);
      if (!response.ok) throw new Error("Failed to fetch price history");
      return response.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Handle different response formats
  const priceHistory = Array.isArray(priceHistoryResponse) 
    ? priceHistoryResponse 
    : priceHistoryResponse?.data || [];
  
  const historyError = !Array.isArray(priceHistoryResponse) 
    ? priceHistoryResponse?.error 
    : null;
  
  const historyMessage = !Array.isArray(priceHistoryResponse) 
    ? priceHistoryResponse?.message 
    : null;

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

  const isPositiveChange = (currentPrice?.change24h ?? 0) >= 0;

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
              {isPriceLoading ? "..." : currentPrice?.price ? `$${currentPrice.price.toFixed(6)}` : "Not Listed"}
            </div>
            <div 
              className={`text-sm font-bold ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}
              data-testid="price-change"
            >
              {isPriceLoading ? "..." : currentPrice?.change24h !== null && currentPrice?.change24h !== undefined ? `${isPositiveChange ? '+' : ''}${currentPrice.change24h.toFixed(2)}%` : "N/A"}
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
          ) : historyError || chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="text-center">
                <i className="fas fa-chart-line text-4xl text-muted-foreground mb-3"></i>
                <div className="text-lg font-bold text-primary mb-2" data-testid="chart-error-title">
                  {historyError || "Chart Data Not Available"}
                </div>
                <div className="text-sm text-muted-foreground font-medium max-w-sm" data-testid="chart-error-message">
                  {historyMessage || "This token is not yet listed on price tracking services. Chart data will appear once indexed by exchanges."}
                </div>
                {currentPrice?.contractAddress && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Contract: {currentPrice.contractAddress.slice(0, 8)}...{currentPrice.contractAddress.slice(-8)}
                  </div>
                )}
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
              {isPriceLoading ? "..." : currentPrice?.volume24h ? `$${currentPrice.volume24h.toLocaleString()}` : "N/A"}
            </div>
            <div className="text-xs text-muted-foreground font-medium">24H VOLUME</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black text-primary" data-testid="market-cap">
              {isPriceLoading ? "..." : currentPrice?.marketCap ? `$${currentPrice.marketCap.toLocaleString()}` : "N/A"}
            </div>
            <div className="text-xs text-muted-foreground font-medium">MARKET CAP</div>
          </div>
        </div>
        
        {/* Token Status Message */}
        {currentPrice?.error && currentPrice?.message && (
          <div className="mt-4 p-4 bg-muted rounded-lg border border-border">
            <div className="text-center">
              <div className="text-sm font-bold text-primary mb-1">Token Status</div>
              <div className="text-xs text-muted-foreground">{currentPrice.message}</div>
              {currentPrice.source && (
                <div className="text-xs text-muted-foreground mt-2">
                  Checking: {currentPrice.source}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}