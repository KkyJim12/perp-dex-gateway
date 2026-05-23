import { BasePerpDexAdapter } from "./base";
import type { ExchangeConfig, Market, MarketSymbol } from "../types";

type PhoenixExchange = {
  markets?: PhoenixMarket[];
};

type PhoenixMarket = {
  symbol: string;
  tickSize?: number;
  baseLotsDecimals?: number;
};

export interface PhoenixConfig extends Partial<ExchangeConfig> {
  baseUrl?: string;
}

export class PhoenixAdapter extends BasePerpDexAdapter {
  constructor(config: PhoenixConfig = {}) {
    super({
      id: "phoenix",
      name: "Phoenix",
      baseUrl: "https://perp-api.phoenix.trade",
      ...config,
    });
  }

  async getMarkets(): Promise<Market[]> {
    const response = await this.http.get<PhoenixExchange>("/exchange");

    return (response.markets ?? []).map((market) => this.toMarket(market));
  }

  async getMarket(symbol: MarketSymbol): Promise<Market> {
    const response = await this.http.get<PhoenixMarket>(`/exchange/market/${encodeURIComponent(symbol)}`);

    return this.toMarket(response);
  }

  private toMarket(market: PhoenixMarket): Market {
    return {
      symbol: market.symbol,
      baseAsset: market.symbol.replace(/[-_]?PERP$/i, ""),
      quoteAsset: "USD",
      tickSize: market.tickSize === undefined ? undefined : String(market.tickSize),
      raw: market,
    };
  }
}
