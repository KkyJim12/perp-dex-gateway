import type { ExchangeId } from "./types";

export class GatewayError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "GatewayError";
  }
}

export class ExchangeNotFoundError extends GatewayError {
  constructor(exchangeId: ExchangeId) {
    super(`Exchange adapter is not registered: ${exchangeId}`);
    this.name = "ExchangeNotFoundError";
  }
}

export class UnsupportedOperationError extends GatewayError {
  constructor(exchangeId: ExchangeId, operation: string) {
    super(`${exchangeId} adapter does not implement ${operation}`);
    this.name = "UnsupportedOperationError";
  }
}

export class HttpError extends GatewayError {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}
