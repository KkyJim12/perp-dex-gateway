import { BasePerpDexAdapter } from "./base";
import type { ExchangeConfig, Market, MarketSymbol, Ticker } from "../types";

type StandxMarketOverview = {
  symbols: StandxMarketSummary[];
};

type StandxMarketSummary = {
  base: string;
  funding_rate?: string;
  last_price?: string;
  mark_price?: string;
  open_interest?: string;
  quote: string;
  symbol: string;
};

type StandxSymbolInfo = {
  base?: string;
  quote?: string;
  symbol: string;
  tick_size?: string;
  lot_size?: string;
  min_order_qty?: string;
};

export interface StandxConfig extends Partial<ExchangeConfig> {
  baseUrl?: string;
}

export class StandxAdapter extends BasePerpDexAdapter {
  constructor(config: StandxConfig = {}) {
    super({
      id: "standx",
      name: "StandX",
      baseUrl: "https://perps.standx.com",
      ...config,
    });
  }

  async getMarkets(): Promise<Market[]> {
    const overview = await this.http.get<StandxMarketOverview>("/api/query_market_overview");

    return overview.symbols.map((market) => ({
      symbol: market.symbol,
      baseAsset: market.base,
      quoteAsset: market.quote,
      settlementAsset: market.quote,
      raw: market,
    }));
  }

  async getMarket(symbol: MarketSymbol): Promise<Market> {
    const info = await this.http.get<StandxSymbolInfo>("/api/query_symbol_info", {
      query: { symbol },
    });

    return {
      symbol: info.symbol,
      baseAsset: info.base ?? info.symbol,
      quoteAsset: info.quote ?? "DUSD",
      settlementAsset: info.quote ?? "DUSD",
      tickSize: info.tick_size,
      stepSize: info.lot_size,
      minOrderSize: info.min_order_qty,
      raw: info,
    };
  }

  async getTicker(symbol: MarketSymbol): Promise<Ticker> {
    const overview = await this.http.get<StandxMarketOverview>("/api/query_market_overview");
    const ticker = overview.symbols.find((item) => item.symbol === symbol);

    return {
      symbol,
      markPrice: ticker?.mark_price,
      fundingRate: ticker?.funding_rate,
      openInterest: ticker?.open_interest,
      raw: ticker ?? overview,
    };
  }
}
