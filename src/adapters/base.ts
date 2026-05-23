import { UnsupportedOperationError } from "../errors";
import { HttpClient } from "../http";
import type {
  Balance,
  CancelOrderRequest,
  ExchangeConfig,
  ExchangeId,
  GatewayAdapter,
  Market,
  MarketSymbol,
  Order,
  PlaceOrderRequest,
  Position,
  Ticker,
} from "../types";

export abstract class BasePerpDexAdapter implements GatewayAdapter {
  readonly id: ExchangeId;
  readonly name: string;
  protected readonly config: ExchangeConfig;
  protected readonly http: HttpClient;

  protected constructor(config: ExchangeConfig) {
    this.id = config.id;
    this.name = config.name ?? config.id;
    this.config = config;
    this.http = new HttpClient({
      baseUrl: config.baseUrl,
      headers: config.headers,
      timeoutMs: config.timeoutMs,
    });
  }

  getMarkets(): Promise<Market[]> {
    throw new UnsupportedOperationError(this.id, "getMarkets");
  }

  getTicker(symbol: MarketSymbol): Promise<Ticker> {
    void symbol;
    throw new UnsupportedOperationError(this.id, "getTicker");
  }

  getBalances(): Promise<Balance[]> {
    throw new UnsupportedOperationError(this.id, "getBalances");
  }

  getPositions(): Promise<Position[]> {
    throw new UnsupportedOperationError(this.id, "getPositions");
  }

  placeOrder(order: PlaceOrderRequest): Promise<Order> {
    void order;
    throw new UnsupportedOperationError(this.id, "placeOrder");
  }

  cancelOrder(order: CancelOrderRequest): Promise<Order> {
    void order;
    throw new UnsupportedOperationError(this.id, "cancelOrder");
  }
}
