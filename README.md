# perp-dex-gateway

TypeScript gateway library for projects that need one interface for multiple perpetual DEX venues.

Initial adapters:

- Hyperliquid
- Lighter
- Aster
- Pacifica
- GRVT
- Nado
- Hibachi

The package exposes a common adapter contract for markets, tickers, balances, positions, order placement, and cancellation. Hyperliquid includes public market/ticker methods as a working example. Authenticated and venue-specific trading methods are intentionally exposed through the adapter interface so each exchange can add signing and request normalization cleanly.

## Install

```bash
npm install
```

## Build

```bash
npm run build
```

## Usage

```ts
import { createGateway } from "perp-dex-gateway";

const gateway = createGateway({
  hyperliquid: {},
  pacifica: {},
  grvt: {},
  lighter: {
    credentials: {
      apiKey: process.env.LIGHTER_API_KEY,
      apiSecret: process.env.LIGHTER_API_SECRET,
    },
  },
  aster: false,
});

const results = await gateway.getMarkets({
  exchanges: ["hyperliquid", "lighter"],
});

for (const result of results) {
  if (result.ok) {
    console.log(result.exchangeId, result.data.length);
  } else {
    console.warn(result.exchangeId, result.error);
  }
}
```

You can still call one exchange directly:

```ts
const hyperliquid = gateway.get("hyperliquid");
const btc = await hyperliquid.getTicker("BTC");

console.log(btc.markPrice);
```

## Fan-out Actions

Call one function to run the same action across every registered perpetual DEX:

```ts
const tickers = await gateway.getTickers({
  symbol: "BTC",
  exchanges: ["hyperliquid", "lighter", "pacifica"],
});

const balances = await gateway.getBalances({
  exchanges: ["hyperliquid", "aster", "grvt"],
});

const positions = await gateway.getPositions({
  exchanges: ["lighter"],
});
```

Omit `exchanges` to run against every registered adapter:

```ts
const btc = await gateway.getTickers({ symbol: "BTC" });
```

Order actions use the same pattern:

```ts
await gateway.placeOrders({
  exchanges: ["hyperliquid", "aster", "pacifica"],
  order: {
    symbol: "BTC",
    side: "buy",
    type: "limit",
    size: "0.01",
    price: "65000",
  },
});
```

For custom actions, use `callAll`:

```ts
const results = await gateway.callAll((exchange) => exchange.getMarkets(), {
  exchanges: ["hyperliquid", "lighter"],
});
```

## Custom Adapter

```ts
import {
  BasePerpDexAdapter,
  PerpDexGateway,
  type ExchangeConfig,
  type Market,
} from "perp-dex-gateway";

class MyPerpAdapter extends BasePerpDexAdapter {
  constructor(config: ExchangeConfig) {
    super(config);
  }

  async getMarkets(): Promise<Market[]> {
    return this.http.get<Market[]>("/markets");
  }
}

const gateway = new PerpDexGateway([
  new MyPerpAdapter({
    id: "my-perp",
    baseUrl: "https://api.example.com",
  }),
]);
```

## Roadmap

- Add exchange-specific signing for Hyperliquid, Lighter, and Aster.
- Add exchange-specific signing for Pacifica, GRVT, Nado, and Hibachi.
- Normalize open orders, fills, funding history, and leverage/margin settings.
- Add websocket market data and account streams.
- Add integration tests with mocked exchange responses.
