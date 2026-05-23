const assert = require("node:assert/strict");
const test = require("node:test");

const {
  AsterAdapter,
  DecibelAdapter,
  EdgexAdapter,
  EtherealAdapter,
  ExtendedAdapter,
  GrvtAdapter,
  HibachiAdapter,
  HotstuffAdapter,
  HyperliquidAdapter,
  LighterAdapter,
  NadoAdapter,
  PacificaAdapter,
  PhoenixAdapter,
  RisexAdapter,
  StandxAdapter,
  UnsupportedOperationError,
  ZeroOneAdapter,
  createGateway,
} = require("../dist");

const adapterIds = [
  "hyperliquid",
  "lighter",
  "aster",
  "pacifica",
  "grvt",
  "nado",
  "hibachi",
  "phoenix",
  "edgex",
  "extended",
  "ethereal",
  "decibel",
  "risex",
  "01",
  "standx",
  "hotstuff",
];

function mockFetch(routes) {
  const calls = [];
  const previousFetch = global.fetch;

  global.fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    const method = init.method ?? "GET";
    const key = `${method} ${url.origin}${url.pathname}`;
    const route = routes[key] ?? routes[`${method} ${url.pathname}`];

    calls.push({
      key,
      url,
      body: init.body === undefined ? undefined : JSON.parse(init.body),
    });

    if (!route) {
      throw new Error(`Missing mock route: ${key}`);
    }

    const body = typeof route === "function" ? route(calls[calls.length - 1]) : route;
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  return {
    calls,
    restore: () => {
      global.fetch = previousFetch;
    },
  };
}

test("createGateway registers every supported perp DEX by default", () => {
  const gateway = createGateway();

  assert.deepEqual(gateway.list().map((adapter) => adapter.id), adapterIds);
});

test("createGateway can disable selected adapters and configure 01 by either option name", () => {
  const withoutStandx = createGateway({ standx: false });
  assert.equal(withoutStandx.has("standx"), false);

  const withZeroOneAlias = createGateway({ zeroOne: { baseUrl: "https://zero-one.test" } });
  assert.equal(withZeroOneAlias.get("01").name, "01 Exchange");

  const withLiteralZeroOne = createGateway({ "01": { baseUrl: "https://literal-zero-one.test" } });
  assert.equal(withLiteralZeroOne.get("01").name, "01 Exchange");
});

test("placeholder adapters throw unsupported operation errors", async () => {
  const adapters = [
    new LighterAdapter({ baseUrl: "https://lighter.test" }),
    new AsterAdapter({ baseUrl: "https://aster.test" }),
    new NadoAdapter({ baseUrl: "https://nado.test" }),
    new HibachiAdapter({ baseUrl: "https://hibachi.test" }),
    new EdgexAdapter({ baseUrl: "https://edgex.test" }),
    new RisexAdapter({ baseUrl: "https://risex.test" }),
    new ZeroOneAdapter({ baseUrl: "https://zero-one.test" }),
  ];

  for (const exchange of adapters) {
    await assert.rejects(() => Promise.resolve().then(() => exchange.getMarkets()), UnsupportedOperationError);
    await assert.rejects(() => Promise.resolve().then(() => exchange.getTicker("BTC")), UnsupportedOperationError);
    await assert.rejects(() => Promise.resolve().then(() => exchange.getBalances()), UnsupportedOperationError);
    await assert.rejects(() => Promise.resolve().then(() => exchange.getPositions()), UnsupportedOperationError);
    await assert.rejects(() => Promise.resolve().then(() => exchange.placeOrder({ symbol: "BTC", side: "buy", type: "limit", size: "1" })), UnsupportedOperationError);
    await assert.rejects(() => Promise.resolve().then(() => exchange.cancelOrder({ orderId: "1" })), UnsupportedOperationError);
  }
});

test("hyperliquid maps public markets and tickers", async () => {
  const mock = mockFetch({
    "POST https://hyper.test/info": ({ body }) => body.type === "meta"
      ? { universe: [{ name: "BTC", szDecimals: 5 }] }
      : { BTC: "65000" },
  });

  try {
    const exchange = new HyperliquidAdapter({ baseUrl: "https://hyper.test" });
    assert.deepEqual(await exchange.getMarkets(), [{
      symbol: "BTC",
      baseAsset: "BTC",
      quoteAsset: "USD",
      settlementAsset: "USDC",
      stepSize: "0.00001",
      raw: { name: "BTC", szDecimals: 5 },
    }]);
    assert.equal((await exchange.getTicker("BTC")).markPrice, "65000");
  } finally {
    mock.restore();
  }
});

test("pacifica maps public markets and tickers", async () => {
  const mock = mockFetch({
    "GET https://pacifica.test/info": { success: true, data: [{ symbol: "BTC", tick_size: "1", lot_size: "0.001", min_order_size: "10" }] },
    "GET https://pacifica.test/info/prices": { success: true, data: [{ symbol: "BTC", mark: "65000", oracle: "65001", funding: "0.001", open_interest: "100" }] },
  });

  try {
    const exchange = new PacificaAdapter({ baseUrl: "https://pacifica.test" });
    assert.equal((await exchange.getMarkets())[0].symbol, "BTC");
    assert.equal((await exchange.getTicker("BTC")).indexPrice, "65001");
  } finally {
    mock.restore();
  }
});

test("grvt maps public markets and tickers", async () => {
  const mock = mockFetch({
    "POST https://grvt.test/v1/all_instruments": { result: [{ instrument: "BTC_USDT_Perp", base: "BTC", quote: "USDT", kind: "PERPETUAL", tick_size: "0.01", min_size: "0.001" }] },
    "POST https://grvt.test/v1/ticker": { result: { mark_price: "65000", index_price: "65001", best_bid_price: "64999", best_ask_price: "65002", funding_rate: 0.001, open_interest: "100" } },
  });

  try {
    const exchange = new GrvtAdapter({ baseUrl: "https://grvt.test" });
    assert.equal((await exchange.getMarkets())[0].symbol, "BTC_USDT_Perp");
    assert.equal((await exchange.getTicker("BTC_USDT_Perp")).fundingRate, "0.001");
  } finally {
    mock.restore();
  }
});

test("phoenix maps public market endpoints", async () => {
  const mock = mockFetch({
    "GET https://phoenix.test/exchange": { markets: [{ symbol: "SOL-PERP", tickSize: 1 }] },
    "GET https://phoenix.test/exchange/market/SOL-PERP": { symbol: "SOL-PERP", tickSize: 1 },
  });

  try {
    const exchange = new PhoenixAdapter({ baseUrl: "https://phoenix.test" });
    assert.equal((await exchange.getMarkets())[0].baseAsset, "SOL");
    assert.equal((await exchange.getMarket("SOL-PERP")).tickSize, "1");
  } finally {
    mock.restore();
  }
});

test("extended maps public markets and tickers", async () => {
  const market = {
    name: "BTC-USD",
    type: "PERPETUAL",
    assetName: "BTC",
    collateralAssetName: "USD",
    marketStats: { markPrice: "65000", indexPrice: "65001", bidPrice: "64999", askPrice: "65002", fundingRate: "0.001", openInterest: "100" },
    tradingConfig: { minOrderSize: "0.001", minOrderSizeChange: "0.001", minPriceChange: "1" },
  };
  const mock = mockFetch({
    "GET https://extended.test/api/v1/info/markets": { status: "ok", data: [market] },
  });

  try {
    const exchange = new ExtendedAdapter({ baseUrl: "https://extended.test" });
    assert.equal((await exchange.getMarkets())[0].baseAsset, "BTC");
    assert.equal((await exchange.getTicker("BTC-USD")).bestAsk, "65002");
  } finally {
    mock.restore();
  }
});

test("ethereal maps public products and tickers", async () => {
  const product = {
    ticker: "BTCUSD",
    displayTicker: "BTC-USD",
    baseTokenName: "BTC",
    quoteTokenName: "USD",
    lotSize: "0.00001",
    tickSize: "1",
    minQuantity: "0.001",
    fundingRate1h: "0.001",
    openInterest: "100",
  };
  const mock = mockFetch({
    "GET https://ethereal.test/v1/product": { data: [product] },
  });

  try {
    const exchange = new EtherealAdapter({ baseUrl: "https://ethereal.test" });
    assert.equal((await exchange.getMarkets())[0].symbol, "BTC-USD");
    assert.equal((await exchange.getTicker("BTCUSD")).openInterest, "100");
  } finally {
    mock.restore();
  }
});

test("decibel maps public markets and tickers", async () => {
  const mock = mockFetch({
    "GET https://decibel.test/api/v1/markets": [{ market: "BTC-PERP", base: "BTC", quote: "USD", tick_size: 1, lot_size: 0.001, min_order_size: 10 }],
    "GET https://decibel.test/api/v1/prices": [{ market: "BTC-PERP", oracle_px: 65001, mark_px: 65000, funding_rate_bps: 0.1, open_interest: 100 }],
  });

  try {
    const exchange = new DecibelAdapter({ baseUrl: "https://decibel.test" });
    assert.equal((await exchange.getMarkets())[0].tickSize, "1");
    assert.equal((await exchange.getTicker("BTC-PERP")).markPrice, "65000");
  } finally {
    mock.restore();
  }
});

test("standx maps public markets and tickers", async () => {
  const mock = mockFetch({
    "GET https://standx.test/api/query_market_overview": { symbols: [{ symbol: "BTC-USD", base: "BTC", quote: "DUSD", mark_price: "65000", funding_rate: "0.001", open_interest: "100" }] },
    "GET https://standx.test/api/query_symbol_info": { symbol: "BTC-USD", base: "BTC", quote: "DUSD", tick_size: "1", lot_size: "0.001", min_order_qty: "0.001" },
  });

  try {
    const exchange = new StandxAdapter({ baseUrl: "https://standx.test" });
    assert.equal((await exchange.getMarkets())[0].settlementAsset, "DUSD");
    assert.equal((await exchange.getMarket("BTC-USD")).stepSize, "0.001");
    assert.equal((await exchange.getTicker("BTC-USD")).fundingRate, "0.001");
  } finally {
    mock.restore();
  }
});

test("hotstuff maps public markets and tickers", async () => {
  const mock = mockFetch({
    "POST https://hotstuff.test/info": ({ body }) => body.method === "instruments"
      ? { perps: [{ name: "BTC-PERP", lot_size: 0.00001, tick_size: 1, delisted: false, min_notional_usd: 10 }] }
      : { instrument: "BTC-PERP", mark_price: "65000", index_price: "65001", bid: "64999", ask: "65002", funding_rate: "0.001", open_interest: "100" },
  });

  try {
    const exchange = new HotstuffAdapter({ baseUrl: "https://hotstuff.test" });
    assert.equal((await exchange.getMarkets())[0].stepSize, "0.00001");
    assert.equal((await exchange.getTicker("BTC-PERP")).bestBid, "64999");
  } finally {
    mock.restore();
  }
});
