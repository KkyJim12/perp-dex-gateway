export type ExchangeId =
  | "hyperliquid"
  | "lighter"
  | "aster"
  | "pacifica"
  | "grvt"
  | "nado"
  | "hibachi"
  | "phoenix"
  | "edgex"
  | "extended"
  | "ethereal"
  | "decibel"
  | "risex"
  | "01"
  | "standx"
  | "hotstuff"
  | (string & {});

export type MarketSymbol = string;

export type Side = "buy" | "sell";

export type OrderType = "market" | "limit";

export type TimeInForce = "ioc" | "fok" | "gtc" | "postOnly";

export interface GatewayCredentials {
  apiKey?: string;
  apiSecret?: string;
  passphrase?: string;
  privateKey?: string;
  walletAddress?: string;
  accountId?: string;
}

export interface ExchangeConfig {
  id: ExchangeId;
  name?: string;
  baseUrl: string;
  wsUrl?: string;
  credentials?: GatewayCredentials;
  headers?: Record<string, string>;
  timeoutMs?: number;
  sandbox?: boolean;
}

export interface Market {
  symbol: MarketSymbol;
  baseAsset: string;
  quoteAsset: string;
  settlementAsset?: string;
  tickSize?: string;
  stepSize?: string;
  minOrderSize?: string;
  raw?: unknown;
}

export interface Ticker {
  symbol: MarketSymbol;
  markPrice?: string;
  indexPrice?: string;
  bestBid?: string;
  bestAsk?: string;
  fundingRate?: string;
  openInterest?: string;
  raw?: unknown;
}

export interface Balance {
  asset: string;
  total?: string;
  available?: string;
  margin?: string;
  unrealizedPnl?: string;
  raw?: unknown;
}

export interface Position {
  symbol: MarketSymbol;
  side: "long" | "short" | "flat";
  size: string;
  entryPrice?: string;
  markPrice?: string;
  liquidationPrice?: string;
  unrealizedPnl?: string;
  leverage?: string;
  raw?: unknown;
}

export interface PlaceOrderRequest {
  symbol: MarketSymbol;
  side: Side;
  type: OrderType;
  size: string;
  price?: string;
  reduceOnly?: boolean;
  timeInForce?: TimeInForce;
  clientOrderId?: string;
}

export interface Order {
  id: string;
  symbol: MarketSymbol;
  side: Side;
  type: OrderType;
  status?: string;
  size: string;
  price?: string;
  filledSize?: string;
  clientOrderId?: string;
  raw?: unknown;
}

export interface CancelOrderRequest {
  symbol?: MarketSymbol;
  orderId?: string;
  clientOrderId?: string;
}

export interface GatewayRequestOptions {
  exchanges?: ExchangeId[];
}

export interface GatewayTickerRequest extends GatewayRequestOptions {
  symbol: MarketSymbol;
}

export interface GatewayPlaceOrderRequest extends GatewayRequestOptions {
  order: PlaceOrderRequest;
}

export interface GatewayCancelOrderRequest extends GatewayRequestOptions {
  order: CancelOrderRequest;
}

export interface GatewayAdapter {
  readonly id: ExchangeId;
  readonly name: string;

  getMarkets(): Promise<Market[]>;
  getTicker(symbol: MarketSymbol): Promise<Ticker>;
  getBalances(): Promise<Balance[]>;
  getPositions(): Promise<Position[]>;
  placeOrder(order: PlaceOrderRequest): Promise<Order>;
  cancelOrder(order: CancelOrderRequest): Promise<Order>;
}

export type GatewayActionResult<T> =
  | {
      exchangeId: ExchangeId;
      exchangeName: string;
      ok: true;
      data: T;
    }
  | {
      exchangeId: ExchangeId;
      exchangeName: string;
      ok: false;
      error: unknown;
    };
