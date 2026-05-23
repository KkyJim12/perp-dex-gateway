const assert = require("node:assert/strict");
const test = require("node:test");

const {
  DecibelAdapter,
  EtherealAdapter,
  ExtendedAdapter,
  GrvtAdapter,
  HotstuffAdapter,
  HyperliquidAdapter,
  PacificaAdapter,
  PhoenixAdapter,
  StandxAdapter,
} = require("../../dist");

const liveAdapters = [
  { adapter: new HyperliquidAdapter(), supportsTicker: true },
  { adapter: new PacificaAdapter(), supportsTicker: true },
  { adapter: new GrvtAdapter(), supportsTicker: true },
  { adapter: new PhoenixAdapter(), supportsTicker: false },
  { adapter: new ExtendedAdapter(), supportsTicker: true },
  { adapter: new EtherealAdapter(), supportsTicker: true },
  {
    adapter: new DecibelAdapter({
      headers: process.env.DECIBEL_API_KEY
        ? { authorization: `Bearer ${process.env.DECIBEL_API_KEY}` }
        : undefined,
    }),
    requiresEnv: "DECIBEL_API_KEY",
    supportsTicker: true,
  },
  { adapter: new StandxAdapter(), supportsTicker: true },
  { adapter: new HotstuffAdapter(), supportsTicker: true },
];

const adaptersWithoutPublicEndpointTests = [
  "lighter",
  "aster",
  "nado",
  "hibachi",
  "edgex",
  "risex",
  "01",
];

for (const { adapter, requiresEnv, supportsTicker } of liveAdapters) {
  const testOrSkip = requiresEnv && !process.env[requiresEnv] ? test.skip : test;

  testOrSkip(`${adapter.id} live getMarkets() returns markets`, async () => {
    if (requiresEnv && !process.env[requiresEnv]) {
      throw new Error(`${requiresEnv} is required for ${adapter.id} live tests`);
    }

    const markets = await adapter.getMarkets();

    assert.ok(Array.isArray(markets), `${adapter.id} getMarkets() should return an array`);
    assert.ok(markets.length > 0, `${adapter.id} should return at least one market`);
    assert.equal(typeof markets[0].symbol, "string");
    assert.ok(markets[0].symbol.length > 0);
  });

  if (!supportsTicker) {
    test.skip(`${adapter.id} live getTicker() not implemented yet`, () => {
      // The adapter has a real public market endpoint, but no ticker method
      // has been normalized into the gateway interface yet.
    });
    continue;
  }

  testOrSkip(`${adapter.id} live getTicker() returns a ticker for first market`, async () => {
    if (requiresEnv && !process.env[requiresEnv]) {
      throw new Error(`${requiresEnv} is required for ${adapter.id} live tests`);
    }

    const markets = await adapter.getMarkets();
    assert.ok(markets.length > 0, `${adapter.id} should return at least one market`);

    const ticker = await adapter.getTicker(markets[0].symbol);

    assert.equal(ticker.symbol, markets[0].symbol);
    assert.ok(
      ticker.markPrice !== undefined ||
        ticker.indexPrice !== undefined ||
        ticker.bestBid !== undefined ||
        ticker.bestAsk !== undefined ||
        ticker.fundingRate !== undefined ||
        ticker.openInterest !== undefined ||
        ticker.raw !== undefined,
      `${adapter.id} ticker should include at least one data field`,
    );
  });
}

for (const exchangeId of adaptersWithoutPublicEndpointTests) {
  test.skip(`${exchangeId} live public endpoint test not implemented yet`, () => {
    // These adapters are routed and typed, but their exact public market/ticker
    // methods have not been normalized into the library yet.
  });
}
