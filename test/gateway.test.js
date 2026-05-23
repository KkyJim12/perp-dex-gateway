const assert = require("node:assert/strict");
const test = require("node:test");

const {
  ExchangeNotFoundError,
  HttpClient,
  HttpError,
  PerpDexGateway,
  UnsupportedOperationError,
} = require("../dist");

function adapter(id, overrides = {}) {
  return {
    id,
    name: overrides.name ?? id,
    getMarkets: overrides.getMarkets ?? (async () => [{ symbol: `${id}-PERP` }]),
    getTicker: overrides.getTicker ?? (async (symbol) => ({ symbol, markPrice: "1" })),
    getBalances: overrides.getBalances ?? (async () => [{ asset: "USDC", total: "10" }]),
    getPositions: overrides.getPositions ?? (async () => [{ symbol: "BTC", side: "flat", size: "0" }]),
    placeOrder: overrides.placeOrder ?? (async (order) => ({ id: `${id}-order`, ...order })),
    cancelOrder: overrides.cancelOrder ?? (async (order) => ({ id: order.orderId ?? `${id}-cancelled`, symbol: "BTC", side: "buy", type: "limit", size: "0" })),
  };
}

function mockFetch(handler) {
  const previousFetch = global.fetch;
  global.fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    const result = await handler({ url, init });
    return new Response(result.body, {
      status: result.status ?? 200,
      headers: result.headers ?? { "content-type": "application/json" },
    });
  };

  return () => {
    global.fetch = previousFetch;
  };
}

test("gateway registers, lists, checks, and retrieves adapters", () => {
  const gateway = new PerpDexGateway();
  const hyperliquid = adapter("hyperliquid", { name: "Hyperliquid" });

  gateway.register(hyperliquid);

  assert.equal(gateway.has("hyperliquid"), true);
  assert.equal(gateway.has("lighter"), false);
  assert.equal(gateway.get("hyperliquid"), hyperliquid);
  assert.deepEqual(gateway.list().map((item) => item.id), ["hyperliquid"]);
  assert.throws(() => gateway.get("missing"), ExchangeNotFoundError);
});

test("callAll runs an action across selected exchanges and preserves failures", async () => {
  const gateway = new PerpDexGateway([
    adapter("ok"),
    adapter("bad", {
      getTicker: async () => {
        throw new Error("boom");
      },
    }),
    adapter("skip"),
  ]);

  const results = await gateway.callAll((exchange) => exchange.getTicker("BTC"), {
    exchanges: ["ok", "bad"],
  });

  assert.equal(results.length, 2);
  assert.deepEqual(results.map((result) => result.exchangeId), ["ok", "bad"]);
  assert.equal(results[0].ok, true);
  assert.equal(results[0].data.symbol, "BTC");
  assert.equal(results[1].ok, false);
  assert.match(results[1].error.message, /boom/);
});

test("gateway convenience methods pass params to selected exchanges", async () => {
  const gateway = new PerpDexGateway([adapter("a"), adapter("b")]);

  assert.deepEqual((await gateway.getMarkets(["a"])).map((result) => result.exchangeId), ["a"]);
  assert.deepEqual((await gateway.getTickers({ symbol: "ETH", exchanges: ["b"] })).map((result) => result.data.symbol), ["ETH"]);
  assert.equal((await gateway.getBalances({ exchanges: ["a"] }))[0].data[0].asset, "USDC");
  assert.equal((await gateway.getPositions({ exchanges: ["a"] }))[0].data[0].side, "flat");
  assert.equal((await gateway.placeOrders({ exchanges: ["a"], order: { symbol: "BTC", side: "buy", type: "limit", size: "1", price: "10" } }))[0].data.id, "a-order");
  assert.equal((await gateway.cancelOrders({ exchanges: ["a"], order: { orderId: "123" } }))[0].data.id, "123");
});

test("unsupported base operations return typed errors through fan-out", async () => {
  const gateway = new PerpDexGateway([
    adapter("base", {
      getBalances: async () => {
        throw new UnsupportedOperationError("base", "getBalances");
      },
    }),
  ]);

  const [result] = await gateway.getBalances();

  assert.equal(result.ok, false);
  assert.equal(result.error.name, "UnsupportedOperationError");
});

test("http client sends query/body, parses json/text/empty responses, and throws HttpError", async () => {
  const requests = [];
  const restoreFetch = mockFetch(async ({ url, init }) => {
    requests.push({ url, init });

    if (url.pathname === "/json") {
      return { body: JSON.stringify({ ok: true }), headers: { "content-type": "application/json" } };
    }

    if (url.pathname === "/text") {
      return { body: "plain", headers: { "content-type": "text/plain" } };
    }

    if (url.pathname === "/empty") {
      return { body: "", headers: { "content-type": "application/json" } };
    }

    return {
      status: 418,
      body: JSON.stringify({ code: "teapot" }),
      headers: { "content-type": "application/json" },
    };
  });

  try {
    const http = new HttpClient({ baseUrl: "https://example.test", headers: { "x-test": "1" } });

    assert.deepEqual(await http.get("/json", { query: { symbol: "BTC", empty: undefined } }), { ok: true });
    assert.equal(requests[0].url.searchParams.get("symbol"), "BTC");
    assert.equal(requests[0].url.searchParams.has("empty"), false);
    assert.equal(requests[0].init.headers["x-test"], "1");

    assert.equal(await http.post("/text", { hello: "world" }), "plain");
    assert.equal(requests[1].init.method, "POST");
    assert.equal(requests[1].init.body, JSON.stringify({ hello: "world" }));

    assert.equal(await http.get("/empty"), undefined);
    await assert.rejects(() => http.get("/error"), HttpError);
  } finally {
    restoreFetch();
  }
});
