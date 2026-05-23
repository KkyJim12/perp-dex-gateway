import { BasePerpDexAdapter } from "./base";
import type { ExchangeConfig, Market, MarketSymbol, Ticker } from "../types";

type GrvtResponse<T> = {
  result: T;
};

type GrvtInstrument = {
  instrument: string;
  base: string;
  quote: string;
  kind: string;
  settlement_period?: string;
  tick_size?: string;
  min_size?: string;
};

type GrvtTicker = {
  instrument?: string;
  mark_price?: string;
  index_price?: string;
  best_bid_price?: string;
  best_ask_price?: string;
  funding_rate?: string | number;
  open_interest?: string;
};

export interface GrvtConfig extends Partial<ExchangeConfig> {
  baseUrl?: string;
}

export class GrvtAdapter extends BasePerpDexAdapter {
  constructor(config: GrvtConfig = {}) {
    super({
      id: "grvt",
      name: "GRVT",
      baseUrl: "https://market-data.grvt.io/full",
      ...config,
    });
  }

  async getMarkets(): Promise<Market[]> {
    const response = await this.http.post<GrvtResponse<GrvtInstrument[]>>("/v1/all_instruments", {
      is_active: true,
    });

    return response.result
      .filter((instrument) => instrument.kind === "PERPETUAL")
      .map((instrument) => ({
        symbol: instrument.instrument,
        baseAsset: instrument.base,
        quoteAsset: instrument.quote,
        settlementAsset: instrument.quote,
        tickSize: instrument.tick_size,
        minOrderSize: instrument.min_size,
        raw: instrument,
      }));
  }

  async getTicker(symbol: MarketSymbol): Promise<Ticker> {
    const response = await this.http.post<GrvtResponse<GrvtTicker>>("/v1/ticker", {
      instrument: symbol,
    });

    return {
      symbol,
      markPrice: response.result.mark_price,
      indexPrice: response.result.index_price,
      bestBid: response.result.best_bid_price,
      bestAsk: response.result.best_ask_price,
      fundingRate: response.result.funding_rate === undefined ? undefined : String(response.result.funding_rate),
      openInterest: response.result.open_interest,
      raw: response.result,
    };
  }
}
