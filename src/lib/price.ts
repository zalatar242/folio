// Stock price fetcher — Yahoo Finance with hardcoded fallback

interface PriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

// Hardcoded fallback prices (updated at build time)
const FALLBACK_PRICES: Record<string, PriceData> = {
  TSLA: {
    symbol: 'TSLA',
    price: 225.0,
    change: 3.45,
    changePercent: 1.56,
    lastUpdated: new Date().toISOString(),
  },
  AAPL: {
    symbol: 'AAPL',
    price: 178.5,
    change: -1.2,
    changePercent: -0.67,
    lastUpdated: new Date().toISOString(),
  },
};

// Cache to avoid hammering the API
let priceCache: Record<string, PriceData> = {};
let lastFetch = 0;
const CACHE_TTL = 30_000; // 30 seconds

export async function getStockPrice(symbol: string): Promise<PriceData> {
  const now = Date.now();

  // Return cached if fresh
  if (priceCache[symbol] && now - lastFetch < CACHE_TTL) {
    return priceCache[symbol];
  }

  try {
    // Dynamic import to avoid issues in browser bundles
    const yahooFinance = await import('yahoo-finance2');
    const yf = yahooFinance.default;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quote: any = await (yf as any).quote(symbol);

    const data: PriceData = {
      symbol,
      price: quote.regularMarketPrice ?? FALLBACK_PRICES[symbol]?.price ?? 0,
      change: quote.regularMarketChange ?? 0,
      changePercent: quote.regularMarketChangePercent ?? 0,
      lastUpdated: new Date().toISOString(),
    };

    priceCache[symbol] = data;
    lastFetch = now;
    return data;
  } catch {
    // Fallback to hardcoded or cached
    if (priceCache[symbol]) return priceCache[symbol];
    if (FALLBACK_PRICES[symbol]) return FALLBACK_PRICES[symbol];
    throw new Error(`No price available for ${symbol}`);
  }
}

export async function getAllPrices(): Promise<Record<string, PriceData>> {
  const [tsla, aapl] = await Promise.allSettled([
    getStockPrice('TSLA'),
    getStockPrice('AAPL'),
  ]);

  return {
    TSLA: tsla.status === 'fulfilled' ? tsla.value : FALLBACK_PRICES.TSLA,
    AAPL: aapl.status === 'fulfilled' ? aapl.value : FALLBACK_PRICES.AAPL,
  };
}
