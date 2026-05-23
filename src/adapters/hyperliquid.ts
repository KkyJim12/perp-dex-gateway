import { BasePerpDexAdapter } from "./base";
import type { ExchangeConfig, Market, MarketSymbol, Ticker } from "../types";

type HyperliquidMetaResponse = {
  universe?: Array<{
    name: string;
    szDecimals?: number;
    maxLeverage?: number;
    onlyIsolated?: boolean;
  }>;
};

type HyperliquidMidsResponse = Record<string, string>;

export interface HyperliquidConfig extends Partial<ExchangeConfig> {
  baseUrl?: string;
}

export class HyperliquidAdapter extends BasePerpDexAdapter {
  constructor(config: HyperliquidConfig = {}) {
    super({
      id: "hyperliquid",
      name: "Hyperliquid",
      baseUrl: "https://api.hyperliquid.xyz",
      ...config,
    });
  }

  async getMarkets(): Promise<Market[]> {
    const response = await this.http.post<HyperliquidMetaResponse>("/info", { type: "meta" });

    return (response.universe ?? []).map((market) => ({
      symbol: market.name,
      baseAsset: market.name,
      quoteAsset: "USD",
      settlementAsset: "USDC",
      stepSize: market.szDecimals === undefined ? undefined : decimalStep(market.szDecimals),
      raw: market,
    }));
  }

  async getTicker(symbol: MarketSymbol): Promise<Ticker> {
    const response = await this.http.post<HyperliquidMidsResponse>("/info", { type: "allMids" });

    return {
      symbol,
      markPrice: response[symbol],
      raw: response,
    };
  }
}

function decimalStep(decimals: number): string {
  return decimals === 0 ? "1" : `0.${"0".repeat(Math.max(decimals - 1, 0))}1`;
}
