export * from "./adapters/aster";
export * from "./adapters/base";
export * from "./adapters/hyperliquid";
export * from "./adapters/lighter";
export * from "./errors";
export * from "./gateway";
export * from "./http";
export * from "./types";

import { AsterAdapter, type AsterConfig } from "./adapters/aster";
import { HyperliquidAdapter, type HyperliquidConfig } from "./adapters/hyperliquid";
import { LighterAdapter, type LighterConfig } from "./adapters/lighter";
import { PerpDexGateway } from "./gateway";

export interface CreateGatewayOptions {
  hyperliquid?: HyperliquidConfig | false;
  lighter?: LighterConfig | false;
  aster?: AsterConfig | false;
}

export function createGateway(options: CreateGatewayOptions = {}): PerpDexGateway {
  const gateway = new PerpDexGateway();

  if (options.hyperliquid !== false) {
    gateway.register(new HyperliquidAdapter(options.hyperliquid));
  }

  if (options.lighter !== false) {
    gateway.register(new LighterAdapter(options.lighter));
  }

  if (options.aster !== false) {
    gateway.register(new AsterAdapter(options.aster));
  }

  return gateway;
}
