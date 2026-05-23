import { BasePerpDexAdapter } from "./base";
import type { ExchangeConfig } from "../types";

export interface NadoConfig extends Partial<ExchangeConfig> {
  baseUrl?: string;
}

export class NadoAdapter extends BasePerpDexAdapter {
  constructor(config: NadoConfig = {}) {
    super({
      id: "nado",
      name: "Nado",
      baseUrl: "https://gateway.prod.nado.xyz/v1",
      wsUrl: "wss://gateway.prod.nado.xyz/v1/ws",
      headers: {
        "accept-encoding": "gzip, br, deflate",
        ...config.headers,
      },
      ...config,
    });
  }
}
