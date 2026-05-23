import { BasePerpDexAdapter } from "./base";
import type { ExchangeConfig, Market, MarketSymbol, Ticker } from "../types";

type HotstuffInstrumentsResponse = {
  perps?: HotstuffPerpInstrument[];
};

type HotstuffPerpInstrument = {
  name: string;
  price_index?: string;
  lot_size?: number;
  tick_size?: number;
  settlement_currency?: number | string;
  delisted?: boolean;
  min_notional_usd?: number;
};

type HotstuffTicker = {
  instrument?: string;
  instrument_name?: string;
  mark_price?: string;
  index_price?: string;
  funding_rate?: string;
  open_interest?: string;
  bid?: string;
  ask?: string;
};

export interface HotstuffConfig extends Partial<ExchangeConfig> {
  baseUrl?: string;
}

export class HotstuffAdapter extends BasePerpDexAdapter {
  constructor(config: HotstuffConfig = {}) {
    super({
      id: "hotstuff",
      name: "Hotstuff",
      baseUrl: "https://api.hotstuff.trade",
      wsUrl: "wss://api.hotstuff.trade/ws",
      ...config,
    });
  }

  async getMarkets(): Promise<Market[]> {
    const response = await this.http.post<HotstuffInstrumentsResponse>("/info", {
      method: "instruments",
      params: { type: "perps" },
    });

    return (response.perps ?? [])
      .filter((instrument) => instrument.delisted !== true)
      .map((instrument) => ({
        symbol: instrument.name,
        baseAsset: instrument.name.replace(/[-_]?PERP$/i, ""),
        quoteAsset: "USD",
        tickSize: instrument.tick_size === undefined ? undefined : String(instrument.tick_size),
        stepSize: instrument.lot_size === undefined ? undefined : String(instrument.lot_size),
        minOrderSize: instrument.min_notional_usd === undefined ? undefined : String(instrument.min_notional_usd),
        raw: instrument,
      }));
  }

  async getTicker(symbol: MarketSymbol): Promise<Ticker> {
    const response = await this.http.post<HotstuffTicker>("/info", {
      method: "ticker",
      params: { symbol },
    });

    return {
      symbol,
      markPrice: response.mark_price,
      indexPrice: response.index_price,
      bestBid: response.bid,
      bestAsk: response.ask,
      fundingRate: response.funding_rate,
      openInterest: response.open_interest,
      raw: response,
    };
  }
}
