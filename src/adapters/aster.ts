import { BasePerpDexAdapter } from "./base";
import type { ExchangeConfig } from "../types";

export interface AsterConfig extends Partial<ExchangeConfig> {
  baseUrl?: string;
}

export class AsterAdapter extends BasePerpDexAdapter {
  constructor(config: AsterConfig = {}) {
    super({
      id: "aster",
      name: "Aster",
      baseUrl: "https://fapi.asterdex.com",
      ...config,
    });
  }
}
