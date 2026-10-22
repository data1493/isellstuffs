import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";

import { POST as donatePost } from "../app/donate/write/route";
import { handleAgentTradePost, handleAgentWritePost } from "./agent-row-write";
import { sameOriginUrl } from "./same-origin";

function hostile(url: string, headers: Record<string, string>, body = "intent=nothing") {
  return new NextRequest(url, {
    method: "POST",
    headers: {
      origin: "https://evil.example",
      referer: "https://evil.example/trade",
      "x-forwarded-host": "evil.example",
      host: "evil.example",
      "content-type": "application/x-www-form-urlencoded",
      ...headers,
    },
    body,
  });
}

test("a post redirect ignores Origin, Referer, and X-Forwarded-Host", async () => {
  const request = hostile("http://127.0.0.1:44721/agents/write", {});
  const url = sameOriginUrl(request, "/trade");
  assert.equal(url.origin, request.nextUrl.origin);
  assert.notEqual(url.origin, "https://evil.example");
  assert.equal(url.pathname, "/trade");
  const form = await request.formData();
  const response = await handleAgentWritePost(request, form);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), `${request.nextUrl.origin}/trade`);

  const donateRequest = hostile("http://127.0.0.1:44721/donate/write", {}, "x=1");
  const donate = await donatePost(donateRequest);
  assert.equal(donate.status, 303);
  assert.equal(donate.headers.get("location"), `${donateRequest.nextUrl.origin}/donate?error=method`);
});

test("confirm without a pass is refused", async () => {
  const request = new NextRequest("http://127.0.0.1:44721/agents/trade", { method: "POST" });
  const form = new FormData();
  form.set("intent", "confirm");
  form.set("tradeId", "trade-public");
  const response = await handleAgentTradePost(request, form);
  assert.equal(response.status, 303);
  const location = new URL(response.headers.get("location") || "");
  assert.equal(location.origin, request.nextUrl.origin);
  assert.equal(location.searchParams.get("error"), "pass");
});

test("a non-url referer does not throw", () => {
  const request = new NextRequest("http://127.0.0.1:44721/agents/write", {
    headers: { referer: "not a url" },
  });
  assert.equal(sameOriginUrl(request, "/trade").href, `${request.nextUrl.origin}/trade`);
});
