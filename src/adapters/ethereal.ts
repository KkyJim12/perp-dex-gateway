import { BasePerpDexAdapter } from "./base";
import type { ExchangeConfig, Market, MarketSymbol, Ticker } from "../types";

type EtherealResponse<T> = {
  data: T;
};

type EtherealProduct = {
  ticker: string;
  displayTicker?: string;
  status?: string;
  baseTokenName: string;
  quoteTokenName: string;
  lotSize?: string;
  tickSize?: string;
  minQuantity?: string;
  fundingRate1h?: string;
  openInterest?: string;
};

export interface EtherealConfig extends Partial<ExchangeConfig> {
  baseUrl?: string;
  archiveBaseUrl?: string;
}

export class EtherealAdapter extends BasePerpDexAdapter {
  readonly archiveBaseUrl: string;

  constructor(config: EtherealConfig = {}) {
    super({
      id: "ethereal",
      name: "Ethereal",
      baseUrl: "https://api.ethereal.trade",
      wsUrl: "wss://ws.ethereal.trade",
      ...config,
    });
    this.archiveBaseUrl = config.archiveBaseUrl ?? "https://archive.ethereal.trade";
  }

  async getMarkets(): Promise<Market[]> {
    const response = await this.http.get<EtherealResponse<EtherealProduct[]>>("/v1/product", {
      query: { limit: 500, orderBy: "createdAt" },
    });

    return response.data.map((product) => ({
      symbol: product.displayTicker ?? product.ticker,
      baseAsset: product.baseTokenName,
      quoteAsset: product.quoteTokenName,
      settlementAsset: product.quoteTokenName,
      tickSize: product.tickSize,
      stepSize: product.lotSize,
      minOrderSize: product.minQuantity,
      raw: product,
    }));
  }

  async getTicker(symbol: MarketSymbol): Promise<Ticker> {
    const markets = await this.getMarkets();
    const product = markets.find((market) => {
      const raw = asProduct(market.raw);
      return market.symbol === symbol || raw?.ticker === symbol || raw?.displayTicker === symbol;
    });

    return {
      symbol,
      fundingRate: asProduct(product?.raw)?.fundingRate1h,
      openInterest: asProduct(product?.raw)?.openInterest,
      raw: product?.raw,
    };
  }
}

function asProduct(value: unknown): EtherealProduct | undefined {
  return typeof value === "object" && value !== null ? (value as EtherealProduct) : undefined;
}
