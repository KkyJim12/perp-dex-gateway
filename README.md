# perp-dex-gateway

TypeScript gateway library for projects that need one interface for many perpetual DEX venues.

The goal is simple: your app sends one normalized request, chooses which perp DEXs should receive it, and gets one normalized result list back.

## Supported Exchanges

| Exchange | ID | Public markets | Public ticker | Trading methods |
| --- | --- | --- | --- | --- |
| Hyperliquid | `hyperliquid` | Yes | Yes | Planned |
| Lighter | `lighter` | Planned | Planned | Planned |
| Aster | `aster` | Planned | Planned | Planned |
| Pacifica | `pacifica` | Yes | Yes | Planned |
| GRVT | `grvt` | Yes | Yes | Planned |
| Nado | `nado` | Planned | Planned | Planned |
| Hibachi | `hibachi` | Planned | Planned | Planned |
| Phoenix | `phoenix` | Yes | Planned | Planned |
| edgeX | `edgex` | Planned | Planned | Planned |
| Extended | `extended` | Yes | Yes | Planned |
| Ethereal | `ethereal` | Yes | Yes | Planned |
| Decibel | `decibel` | Yes, API key needed for live test | Yes, API key needed for live test | Planned |
| RISEx | `risex` | Planned | Planned | Planned |
| 01 Exchange | `01` | Planned | Planned | Planned |
| StandX | `standx` | Yes | Yes | Planned |
| Hotstuff | `hotstuff` | Yes | Yes | Planned |

Methods marked `Planned` currently throw `UnsupportedOperationError`. The adapter still exists, so projects can configure, route, and add implementations incrementally without changing the gateway shape.

## Install

From npm after publishing:

```bash
npm install perp-dex-gateway
```

From this repo while developing locally:

```bash
npm install
npm run build
```

## Quick Start

```ts
import { createGateway } from "perp-dex-gateway";

const gateway = createGateway();

const tickers = await gateway.getTickers({
  symbol: "BTC",
  exchanges: ["hyperliquid", "pacifica", "grvt", "extended", "standx"],
});

for (const result of tickers) {
  if (result.ok) {
    console.log(result.exchangeId, result.data.markPrice);
  } else {
    console.warn(result.exchangeId, result.error);
  }
}
```

## Configure Exchanges

`createGateway()` registers every built-in adapter by default. Pass `false` to disable an exchange, or pass config to override endpoints, headers, credentials, or timeout.

```ts
const gateway = createGateway({
  hyperliquid: {},
  pacifica: {},
  grvt: {},
  extended: {},
  standx: {},
  hotstuff: {},
  aster: false,
  lighter: {
    credentials: {
      apiKey: process.env.LIGHTER_API_KEY,
      apiSecret: process.env.LIGHTER_API_SECRET,
    },
    timeoutMs: 15_000,
  },
  decibel: {
    headers: {
      authorization: `Bearer ${process.env.DECIBEL_API_KEY}`,
    },
  },
  "01": {},
});
```

01 Exchange can also be configured with the TypeScript-friendly alias:

```ts
const gateway = createGateway({
  zeroOne: {},
});
```

## Select Perps Per Request

Every gateway fan-out method accepts `exchanges`. Only those adapters receive the action.

```ts
const markets = await gateway.getMarkets({
  exchanges: ["hyperliquid", "pacifica"],
});

const balances = await gateway.getBalances({
  exchanges: ["lighter", "aster"],
});

const positions = await gateway.getPositions({
  exchanges: ["hyperliquid"],
});
```

Omit `exchanges` to run against every registered adapter:

```ts
const allMarkets = await gateway.getMarkets();
```

## Result Shape

Fan-out methods do not throw just because one exchange fails. Each exchange returns an `ok` result or an error result:

```ts
type GatewayActionResult<T> =
  | {
      exchangeId: string;
      exchangeName: string;
      ok: true;
      data: T;
    }
  | {
      exchangeId: string;
      exchangeName: string;
      ok: false;
      error: unknown;
    };
```

This lets your app use partial successes safely:

```ts
const results = await gateway.getMarkets({
  exchanges: ["hyperliquid", "lighter", "standx"],
});

const successful = results.filter((result) => result.ok);
const failed = results.filter((result) => !result.ok);
```

## Available Gateway Methods

```ts
await gateway.getMarkets({ exchanges });

await gateway.getTickers({
  symbol: "BTC",
  exchanges,
});

await gateway.getBalances({ exchanges });

await gateway.getPositions({ exchanges });

await gateway.placeOrders({
  exchanges,
  order: {
    symbol: "BTC",
    side: "buy",
    type: "limit",
    size: "0.01",
    price: "65000",
  },
});

await gateway.cancelOrders({
  exchanges,
  order: {
    symbol: "BTC",
    orderId: "order-id",
  },
});
```

## Direct Exchange Calls

You can still use a single adapter directly when needed:

```ts
const hyperliquid = gateway.get("hyperliquid");

const markets = await hyperliquid.getMarkets();
const btc = await hyperliquid.getTicker("BTC");
```

## Custom Fan-out Actions

Use `callAll` when your app needs a custom action while keeping the same result format:

```ts
const results = await gateway.callAll(
  (exchange) => exchange.getMarkets(),
  { exchanges: ["hyperliquid", "pacifica"] },
);
```

The second argument also accepts the old shorthand array:

```ts
const results = await gateway.callAll(
  (exchange) => exchange.getMarkets(),
  ["hyperliquid", "pacifica"],
);
```

## Custom Adapter

Add a private or unsupported perp DEX by extending `BasePerpDexAdapter`:

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
    name: "My Perp",
    baseUrl: "https://api.example.com",
  }),
]);
```

## Testing

Run deterministic unit tests with mocked HTTP responses:

```bash
npm test
```

Run real public endpoint tests:

```bash
npm run test:integration
```

Live tests call real DEX servers. They can fail because of network restrictions, endpoint changes, rate limits, region blocks, or missing API keys. Decibel live tests are skipped unless `DECIBEL_API_KEY` is set.

## Development

```bash
npm run typecheck
npm run build
npm test
```

PowerShell may block the `npm` shim on some machines. Use `npm.cmd` if that happens:

```bash
npm.cmd test
```

## Roadmap

- Add exchange-specific signing for authenticated trading.
- Normalize open orders, fills, funding history, leverage, and margin settings.
- Add websocket market data and account streams.
- Add more live endpoint coverage as each adapter gets normalized public methods.
