import { BasePerpDexAdapter } from "./base";
import type { ExchangeConfig, Market, MarketSymbol, Ticker } from "../types";

type PacificaResponse<T> = {
  success: boolean;
  data: T;
  error: unknown;
  code: unknown;
};

type PacificaMarket = {
  symbol: string;
  tick_size?: string;
  lot_size?: string;
  min_order_size?: string;
};

type PacificaPrice = {
  symbol: string;
  funding?: string;
  mark?: string;
  mid?: string;
  open_interest?: string;
  oracle?: string;
  raw?: unknown;
};

export interface PacificaConfig extends Partial<ExchangeConfig> {
  baseUrl?: string;
}

export class PacificaAdapter extends BasePerpDexAdapter {
  constructor(config: PacificaConfig = {}) {
    super({
      id: "pacifica",
      name: "Pacifica",
      baseUrl: "https://api.pacifica.fi/api/v1",
      ...config,
    });
  }

  async getMarkets(): Promise<Market[]> {
    const response = await this.http.get<PacificaResponse<PacificaMarket[]>>("/info");

    return response.data.map((market) => ({
      symbol: market.symbol,
      baseAsset: market.symbol,
      quoteAsset: "USD",
      settlementAsset: "USDC",
      tickSize: market.tick_size,
      stepSize: market.lot_size,
      minOrderSize: market.min_order_size,
      raw: market,
    }));
  }

  async getTicker(symbol: MarketSymbol): Promise<Ticker> {
    const response = await this.http.get<PacificaResponse<PacificaPrice[]>>("/info/prices");
    const ticker = response.data.find((item) => item.symbol === symbol);

    return {
      symbol,
      markPrice: ticker?.mark,
      indexPrice: ticker?.oracle,
      fundingRate: ticker?.funding,
      openInterest: ticker?.open_interest,
      raw: ticker ?? response,
    };
  }
}
