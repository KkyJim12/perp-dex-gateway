import { ExchangeNotFoundError } from "./errors";
import type {
  Balance,
  CancelOrderRequest,
  ExchangeId,
  GatewayActionResult,
  GatewayAdapter,
  GatewayCancelOrderRequest,
  GatewayPlaceOrderRequest,
  GatewayRequestOptions,
  GatewayTickerRequest,
  Market,
  MarketSymbol,
  Order,
  PlaceOrderRequest,
  Position,
  Ticker,
} from "./types";

export class PerpDexGateway {
  private readonly adapters = new Map<ExchangeId, GatewayAdapter>();

  constructor(adapters: GatewayAdapter[] = []) {
    for (const adapter of adapters) {
      this.register(adapter);
    }
  }

  register(adapter: GatewayAdapter): this {
    this.adapters.set(adapter.id, adapter);
    return this;
  }

  get(exchangeId: ExchangeId): GatewayAdapter {
    const adapter = this.adapters.get(exchangeId);
    if (!adapter) {
      throw new ExchangeNotFoundError(exchangeId);
    }

    return adapter;
  }

  has(exchangeId: ExchangeId): boolean {
    return this.adapters.has(exchangeId);
  }

  list(): GatewayAdapter[] {
    return [...this.adapters.values()];
  }

  async callAll<T>(
    action: (adapter: GatewayAdapter) => Promise<T>,
    options?: GatewayRequestOptions | ExchangeId[],
  ): Promise<Array<GatewayActionResult<T>>> {
    const adapters = this.resolveAdapters(options);

    return Promise.all(
      adapters.map(async (adapter) => {
        try {
          return {
            exchangeId: adapter.id,
            exchangeName: adapter.name,
            ok: true,
            data: await action(adapter),
          };
        } catch (error) {
          return {
            exchangeId: adapter.id,
            exchangeName: adapter.name,
            ok: false,
            error,
          };
        }
      }),
    );
  }

  getMarkets(options?: GatewayRequestOptions | ExchangeId[]): Promise<Array<GatewayActionResult<Market[]>>> {
    return this.callAll((adapter) => adapter.getMarkets(), options);
  }

  getTickers(
    request: GatewayTickerRequest,
  ): Promise<Array<GatewayActionResult<Ticker>>> {
    return this.callAll((adapter) => adapter.getTicker(request.symbol), request);
  }

  getBalances(options?: GatewayRequestOptions | ExchangeId[]): Promise<Array<GatewayActionResult<Balance[]>>> {
    return this.callAll((adapter) => adapter.getBalances(), options);
  }

  getPositions(options?: GatewayRequestOptions | ExchangeId[]): Promise<Array<GatewayActionResult<Position[]>>> {
    return this.callAll((adapter) => adapter.getPositions(), options);
  }

  placeOrders(
    request: GatewayPlaceOrderRequest,
  ): Promise<Array<GatewayActionResult<Order>>> {
    return this.callAll((adapter) => adapter.placeOrder(request.order), request);
  }

  cancelOrders(
    request: GatewayCancelOrderRequest,
  ): Promise<Array<GatewayActionResult<Order>>> {
    return this.callAll((adapter) => adapter.cancelOrder(request.order), request);
  }

  private resolveAdapters(options?: GatewayRequestOptions | ExchangeId[]): GatewayAdapter[] {
    const exchangeIds = Array.isArray(options) ? options : options?.exchanges;

    return exchangeIds === undefined
      ? this.list()
      : exchangeIds.map((exchangeId) => this.get(exchangeId));
  }
}
