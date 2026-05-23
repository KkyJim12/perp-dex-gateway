import { BasePerpDexAdapter } from "./base";
import type { ExchangeConfig } from "../types";

export interface EdgexConfig extends Partial<ExchangeConfig> {
  baseUrl?: string;
}

export class EdgexAdapter extends BasePerpDexAdapter {
  constructor(config: EdgexConfig = {}) {
    super({
      id: "edgex",
      name: "edgeX",
      baseUrl: "https://pro.edgex.exchange",
      wsUrl: "wss://quote.edgex.exchange",
      ...config,
    });
  }
}
