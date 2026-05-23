export * from "./adapters/aster";
export * from "./adapters/base";
export * from "./adapters/decibel";
export * from "./adapters/edgex";
export * from "./adapters/ethereal";
export * from "./adapters/extended";
export * from "./adapters/grvt";
export * from "./adapters/hibachi";
export * from "./adapters/hotstuff";
export * from "./adapters/hyperliquid";
export * from "./adapters/lighter";
export * from "./adapters/nado";
export * from "./adapters/pacifica";
export * from "./adapters/phoenix";
export * from "./adapters/risex";
export * from "./adapters/standx";
export * from "./adapters/zero-one";
export * from "./errors";
export * from "./gateway";
export * from "./http";
export * from "./types";

import { AsterAdapter, type AsterConfig } from "./adapters/aster";
import { DecibelAdapter, type DecibelConfig } from "./adapters/decibel";
import { EdgexAdapter, type EdgexConfig } from "./adapters/edgex";
import { EtherealAdapter, type EtherealConfig } from "./adapters/ethereal";
import { ExtendedAdapter, type ExtendedConfig } from "./adapters/extended";
import { GrvtAdapter, type GrvtConfig } from "./adapters/grvt";
import { HibachiAdapter, type HibachiConfig } from "./adapters/hibachi";
import { HotstuffAdapter, type HotstuffConfig } from "./adapters/hotstuff";
import { HyperliquidAdapter, type HyperliquidConfig } from "./adapters/hyperliquid";
import { LighterAdapter, type LighterConfig } from "./adapters/lighter";
import { NadoAdapter, type NadoConfig } from "./adapters/nado";
import { PacificaAdapter, type PacificaConfig } from "./adapters/pacifica";
import { PhoenixAdapter, type PhoenixConfig } from "./adapters/phoenix";
import { RisexAdapter, type RisexConfig } from "./adapters/risex";
import { StandxAdapter, type StandxConfig } from "./adapters/standx";
import { ZeroOneAdapter, type ZeroOneConfig } from "./adapters/zero-one";
import { PerpDexGateway } from "./gateway";

export interface CreateGatewayOptions {
  hyperliquid?: HyperliquidConfig | false;
  lighter?: LighterConfig | false;
  aster?: AsterConfig | false;
  pacifica?: PacificaConfig | false;
  grvt?: GrvtConfig | false;
  nado?: NadoConfig | false;
  hibachi?: HibachiConfig | false;
  phoenix?: PhoenixConfig | false;
  edgex?: EdgexConfig | false;
  extended?: ExtendedConfig | false;
  ethereal?: EtherealConfig | false;
  decibel?: DecibelConfig | false;
  risex?: RisexConfig | false;
  "01"?: ZeroOneConfig | false;
  zeroOne?: ZeroOneConfig | false;
  standx?: StandxConfig | false;
  hotstuff?: HotstuffConfig | false;
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

  if (options.phoenix !== false) {
    gateway.register(new PhoenixAdapter(options.phoenix));
  }

  if (options.edgex !== false) {
    gateway.register(new EdgexAdapter(options.edgex));
  }

  if (options.extended !== false) {
    gateway.register(new ExtendedAdapter(options.extended));
  }

  if (options.ethereal !== false) {
    gateway.register(new EtherealAdapter(options.ethereal));
  }

  if (options.decibel !== false) {
    gateway.register(new DecibelAdapter(options.decibel));
  }

  if (options.risex !== false) {
    gateway.register(new RisexAdapter(options.risex));
  }

  const zeroOneConfig = options.zeroOne ?? options["01"];
  if (zeroOneConfig !== false) {
    gateway.register(new ZeroOneAdapter(zeroOneConfig));
  }

  if (options.standx !== false) {
    gateway.register(new StandxAdapter(options.standx));
  }

  if (options.hotstuff !== false) {
    gateway.register(new HotstuffAdapter(options.hotstuff));
  }

  return gateway;
}
