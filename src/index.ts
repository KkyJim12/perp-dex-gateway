export * from "./adapters/aster";
export * from "./adapters/base";
export * from "./adapters/grvt";
export * from "./adapters/hibachi";
export * from "./adapters/hyperliquid";
export * from "./adapters/lighter";
export * from "./adapters/nado";
export * from "./adapters/pacifica";
export * from "./errors";
export * from "./gateway";
export * from "./http";
export * from "./types";

import { AsterAdapter, type AsterConfig } from "./adapters/aster";
import { GrvtAdapter, type GrvtConfig } from "./adapters/grvt";
import { HibachiAdapter, type HibachiConfig } from "./adapters/hibachi";
import { HyperliquidAdapter, type HyperliquidConfig } from "./adapters/hyperliquid";
import { LighterAdapter, type LighterConfig } from "./adapters/lighter";
import { NadoAdapter, type NadoConfig } from "./adapters/nado";
import { PacificaAdapter, type PacificaConfig } from "./adapters/pacifica";
import { PerpDexGateway } from "./gateway";

export interface CreateGatewayOptions {
  hyperliquid?: HyperliquidConfig | false;
  lighter?: LighterConfig | false;
  aster?: AsterConfig | false;
  pacifica?: PacificaConfig | false;
  grvt?: GrvtConfig | false;
  nado?: NadoConfig | false;
  hibachi?: HibachiConfig | false;
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

  if (options.pacifica !== false) {
    gateway.register(new PacificaAdapter(options.pacifica));
  }

  if (options.grvt !== false) {
    gateway.register(new GrvtAdapter(options.grvt));
  }

  if (options.nado !== false) {
    gateway.register(new NadoAdapter(options.nado));
  }

  if (options.hibachi !== false) {
    gateway.register(new HibachiAdapter(options.hibachi));
  }

  return gateway;
}
