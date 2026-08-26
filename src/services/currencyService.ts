// Service for fetching live daily exchange rates with multiple fallback sources

export interface ExchangeRateResult {
  success: boolean;
  rate: number;
  lastUpdated: string;
  source: string;
  error?: string;
}

// Offline fallback table for popular travel currencies relative to TWD / USD
const FALLBACK_RATES: Record<string, Record<string, number>> = {
  JPY: { TWD: 0.215, USD: 0.0067, EUR: 0.0061, KRW: 9.05, JPY: 1 },
  USD: { TWD: 32.2, JPY: 149.5, EUR: 0.92, KRW: 1350, THB: 36.5, USD: 1 },
  EUR: { TWD: 34.8, JPY: 162.0, USD: 1.08, KRW: 1465, EUR: 1 },
  KRW: { TWD: 0.024, JPY: 0.11, USD: 0.00074, EUR: 0.00068, KRW: 1 },
  THB: { TWD: 0.94, JPY: 4.1, USD: 0.027, THB: 1 },
  HKD: { TWD: 4.12, JPY: 19.1, USD: 0.128, HKD: 1 },
  SGD: { TWD: 24.5, JPY: 114.0, USD: 0.76, SGD: 1 },
  GBP: { TWD: 41.2, JPY: 191.0, USD: 1.28, GBP: 1 },
  CNY: { TWD: 4.45, JPY: 20.7, USD: 0.138, CNY: 1 },
  TWD: { JPY: 4.65, USD: 0.031, EUR: 0.029, KRW: 41.6, TWD: 1 },
};

export async function fetchLiveExchangeRate(
  foreignCurrency: string,
  baseCurrency: string
): Promise<ExchangeRateResult> {
  const from = foreignCurrency.trim().toUpperCase();
  const to = baseCurrency.trim().toUpperCase();

  if (from === to) {
    return {
      success: true,
      rate: 1,
      lastUpdated: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
      source: '相同貨幣 (1:1)'
    };
  }

  // Strategy 1: Open Exchange Rates API (open.er-api.com)
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates && data.rates[to] !== undefined) {
        const rate = Number(data.rates[to]);
        const formattedDate = new Date().toLocaleString('zh-TW', {
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        return {
          success: true,
          rate: Number(rate.toFixed(4)),
          lastUpdated: formattedDate,
          source: '即時匯率網路連線 (OpenER)'
        };
      }
    }
  } catch (err) {
    console.warn('Strategy 1 exchange rate fetch failed, trying secondary...', err);
  }

  // Strategy 2: Secondary API (api.exchangerate-api.com)
  try {
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates && data.rates[to] !== undefined) {
        const rate = Number(data.rates[to]);
        const formattedDate = new Date().toLocaleString('zh-TW', {
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        return {
          success: true,
          rate: Number(rate.toFixed(4)),
          lastUpdated: formattedDate,
          source: '備用匯率服務 (ExchangeRate-API)'
        };
      }
    }
  } catch (err) {
    console.warn('Strategy 2 exchange rate fetch failed, using fallback tables...', err);
  }

  // Strategy 3: Fallback table
  if (FALLBACK_RATES[from] && FALLBACK_RATES[from][to] !== undefined) {
    return {
      success: true,
      rate: FALLBACK_RATES[from][to],
      lastUpdated: '離線預設參考',
      source: '常用旅遊匯率基準庫'
    };
  }

  // If calculating cross-rate via USD
  if (FALLBACK_RATES[from]?.USD && FALLBACK_RATES[to]?.USD) {
    const fromToUSD = FALLBACK_RATES[from].USD;
    const toToUSD = FALLBACK_RATES[to].USD;
    const crossRate = fromToUSD / toToUSD;
    return {
      success: true,
      rate: Number(crossRate.toFixed(4)),
      lastUpdated: '離線交叉換算',
      source: '常用旅遊匯率基準庫'
    };
  }

  return {
    success: false,
    rate: 0.215,
    lastUpdated: '更新失敗',
    source: '預設基準值',
    error: `暫時無法取得 ${from} 至 ${to} 的即時匯率`
  };
}
