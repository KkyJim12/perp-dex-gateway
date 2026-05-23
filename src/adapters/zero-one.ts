import { BasePerpDexAdapter } from "./base";
import type { ExchangeConfig } from "../types";

export interface ZeroOneConfig extends Partial<ExchangeConfig> {
  baseUrl?: string;
}

export class ZeroOneAdapter extends BasePerpDexAdapter {
  constructor(config: ZeroOneConfig = {}) {
    super({
      id: "01",
      name: "01 Exchange",
      baseUrl: "https://api.01.xyz",
      ...config,
    });
  }
}
