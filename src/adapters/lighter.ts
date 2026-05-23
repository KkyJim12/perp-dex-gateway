import { BasePerpDexAdapter } from "./base";
import type { ExchangeConfig } from "../types";

export interface LighterConfig extends Partial<ExchangeConfig> {
  baseUrl?: string;
}

export class LighterAdapter extends BasePerpDexAdapter {
  constructor(config: LighterConfig = {}) {
    super({
      id: "lighter",
      name: "Lighter",
      baseUrl: "https://mainnet.zklighter.elliot.ai",
      ...config,
    });
  }
}
