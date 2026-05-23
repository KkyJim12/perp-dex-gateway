import { BasePerpDexAdapter } from "./base";
import type { ExchangeConfig, Market, MarketSymbol, Ticker } from "../types";

type ExtendedResponse<T> = {
  status: string;
  data: T;
};

type ExtendedMarket = {
  name: string;
  type: "PERPETUAL" | "SPOT" | string;
  assetName: string;
  collateralAssetName: string;
  marketStats?: {
    askPrice?: string;
    bidPrice?: string;
    markPrice?: string;
    indexPrice?: string;
    fundingRate?: string;
    openInterest?: string;
  };
  tradingConfig?: {
    minOrderSize?: string;
    minOrderSizeChange?: string;
    minPriceChange?: string;
  };
};

export interface ExtendedConfig extends Partial<ExchangeConfig> {
  baseUrl?: string;
}

export class ExtendedAdapter extends BasePerpDexAdapter {
  constructor(config: ExtendedConfig = {}) {
    super({
      id: "extended",
      name: "Extended",
      baseUrl: "https://api.starknet.extended.exchange",
      wsUrl: "wss://api.starknet.extended.exchange/stream.extended.exchange/v1",
      ...config,
    });
  }

  async getMarkets(): Promise<Market[]> {
    const response = await this.http.get<ExtendedResponse<ExtendedMarket[]>>("/api/v1/info/markets");

    return response.data
      .filter((market) => market.type === "PERPETUAL")
      .map((market) => ({
        symbol: market.name,
        baseAsset: market.assetName,
        quoteAsset: market.collateralAssetName,
        settlementAsset: market.collateralAssetName,
        tickSize: market.tradingConfig?.minPriceChange,
        stepSize: market.tradingConfig?.minOrderSizeChange,
        minOrderSize: market.tradingConfig?.minOrderSize,
        raw: market,
      }));
  }

  async getTicker(symbol: MarketSymbol): Promise<Ticker> {
    const response = await this.http.get<ExtendedResponse<ExtendedMarket[]>>("/api/v1/info/markets", {
      query: { market: symbol },
    });
    const market = response.data[0];

    return {
      symbol,
      markPrice: market?.marketStats?.markPrice,
      indexPrice: market?.marketStats?.indexPrice,
      bestBid: market?.marketStats?.bidPrice,
      bestAsk: market?.marketStats?.askPrice,
      fundingRate: market?.marketStats?.fundingRate,
      openInterest: market?.marketStats?.openInterest,
      raw: market ?? response,
    };
  }
}
