import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";

import { config, middleware } from "./middleware";

type MatcherModule = {
  getMiddlewareMatchers: (
    matcher: typeof config.matcher,
    nextConfig: { basePath?: string },
  ) => { regexp?: string }[];
};

async function matcherAccepts(pathname: string) {
  const info = (await import(
    "next/dist/build/analysis/get-page-static-info.js"
  )) as unknown as MatcherModule;
  const matchers = info.getMiddlewareMatchers(config.matcher, {});
  return matchers.some((matcher) => new RegExp(matcher.regexp || "").test(pathname));
}

test("dotted mall paths enter middleware and redirect home", async () => {
  for (const pathname of ["/listings/a.b", "/stalls/x.y/edit", "/api/folder/abc.zip", "/listings/abc"]) {
    assert.equal(await matcherAccepts(pathname), true, pathname);
    const response = middleware(new NextRequest(`http://127.0.0.1:44721${pathname}`));
    assert.equal(response.status, 308, pathname);
    const location = response.headers.get("location") || "";
    assert.equal(new URL(location).pathname, "/", pathname);
  }
  const posted = middleware(new NextRequest("http://127.0.0.1:44721/listings/a.b/offer/tape", {
    method: "POST",
  }));
  assert.equal(posted.status, 308);
  assert.equal(new URL(posted.headers.get("location") || "").pathname, "/");
});

test("static files stay outside middleware and product paths stay put", async () => {
  assert.equal(await matcherAccepts("/favicon.ico"), false);
  assert.equal(await matcherAccepts("/_next/static/chunk.js"), false);
  assert.equal(await matcherAccepts("/_next/image"), false);
  const trade = middleware(new NextRequest("http://127.0.0.1:44721/trade/slip.id"));
  assert.equal(trade.headers.get("location"), null);
  assert.notEqual(trade.status, 308);
});
