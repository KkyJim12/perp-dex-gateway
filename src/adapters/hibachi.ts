import { BasePerpDexAdapter } from "./base";
import type { ExchangeConfig } from "../types";

export interface HibachiConfig extends Partial<ExchangeConfig> {
  baseUrl?: string;
  dataBaseUrl?: string;
}

export class HibachiAdapter extends BasePerpDexAdapter {
  readonly dataBaseUrl: string;

  constructor(config: HibachiConfig = {}) {
    super({
      id: "hibachi",
      name: "Hibachi",
      baseUrl: "https://api.hibachi.xyz",
      ...config,
    });
    this.dataBaseUrl = config.dataBaseUrl ?? "https://data-api.hibachi.xyz";
  }
}
