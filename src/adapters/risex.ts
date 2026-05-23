import { BasePerpDexAdapter } from "./base";
import type { ExchangeConfig } from "../types";

export interface RisexConfig extends Partial<ExchangeConfig> {
  baseUrl?: string;
}

export class RisexAdapter extends BasePerpDexAdapter {
  constructor(config: RisexConfig = {}) {
    super({
      id: "risex",
      name: "RISEx",
      baseUrl: "https://api.risex.trade",
      ...config,
    });
  }
}
