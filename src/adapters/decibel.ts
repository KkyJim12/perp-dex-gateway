import { BasePerpDexAdapter } from "./base";
import type { ExchangeConfig, Market, MarketSymbol, Ticker } from "../types";

type DecibelMarket = {
  market?: string;
  symbol?: string;
  base?: string;
  quote?: string;
  tick_size?: string | number;
  lot_size?: string | number;
  min_order_size?: string | number;
};

type DecibelPrice = {
  market: string;
  oracle_px?: number;
  mark_px?: number;
  mid_px?: number;
  funding_rate_bps?: number;
  open_interest?: number;
};

export interface DecibelConfig extends Partial<ExchangeConfig> {
  baseUrl?: string;
}

export class DecibelAdapter extends BasePerpDexAdapter {
  constructor(config: DecibelConfig = {}) {
    super({
      id: "decibel",
      name: "Decibel",
      baseUrl: "https://api.mainnet.aptoslabs.com/decibel",
      ...config,
    });
  }

  async getMarkets(): Promise<Market[]> {
    const response = await this.http.get<DecibelMarket[]>("/api/v1/markets");

    return response.map((market) => ({
      symbol: market.symbol ?? market.market ?? "",
      baseAsset: market.base ?? market.symbol ?? market.market ?? "",
      quoteAsset: market.quote ?? "USD",
      tickSize: market.tick_size === undefined ? undefined : String(market.tick_size),
      stepSize: market.lot_size === undefined ? undefined : String(market.lot_size),
      minOrderSize: market.min_order_size === undefined ? undefined : String(market.min_order_size),
      raw: market,
    }));
  }

  async getTicker(symbol: MarketSymbol): Promise<Ticker> {
    const response = await this.http.get<DecibelPrice[]>("/api/v1/prices");
    const price = response.find((item) => item.market === symbol);

    return {
      symbol,
      markPrice: price?.mark_px === undefined ? undefined : String(price.mark_px),
      indexPrice: price?.oracle_px === undefined ? undefined : String(price.oracle_px),
      fundingRate: price?.funding_rate_bps === undefined ? undefined : String(price.funding_rate_bps),
      openInterest: price?.open_interest === undefined ? undefined : String(price.open_interest),
      raw: price ?? response,
    };
  }
}
