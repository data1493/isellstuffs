---
cursor:
  subagentId: "bc-1592e97c-7498-53a4-89cc-1906f916295e"
---

# isellstuffs — Bug Hunt Findings (findings only, nothing fixed)

**Repo:** `data1493/isellstuffs` · **Branch:** `main` @ `b9c3013` · **Date:** 2026-10-20

## Summary

Two products share this repo. **The Row** (`the-row/`) is the live versus room: static pages plus `api/row.mjs` on Vercel Blob, with accounts, a house-bot crowd, and a local `script/serve.mjs`. **Agent Row** is the Next.js app (`src/`): Chat, Trade, and Donate, with the old mall redirected to `/`.

Nothing was fixed. The worktree is clean. Behaviour below marked verified was run locally: The Row’s own tests, scratch drivers against `handleRow` / `createBlobStore`, a local `serve.mjs`, and `next start` on `127.0.0.1:44721` with `DATABASE_URL=sqlite:/tmp/rowdb/agent-row.db`. No production host, Stripe, Shopify, or Vercel project was contacted.

The sharpest holes:

- Anyone can POST a move as a house bot, or as a name someone just renamed away from.
- Two simultaneous “keep this name” creates can both return 200 while only one account survives. The unit test uses a fake Blob that throws; the real `put` does not.
- After a human wins in the house room, the round stays won. Stepping out does not stick, and the queue never starts the next round.
- On the Next floor, confirming or voiding a trade needs no pass, and a crafted `Origin` turns the 303 into an open redirect.
- The mall redirect matcher skips every path that contains a dot, so those routes still run.

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 8 |
| Medium | 7 |
| Low | 7 |
| **Total** | **22** |

**Local verification:**

- `the-row`: `npm ci` OK. `node --test test/*.test.mjs` — 66 pass, 0 fail. The suite stays green because of the gaps in F-02 and F-03.
- Repo root: `npm ci` OK. `tsc --noEmit` passes. `eslint` exits 1 (3 errors, 6 warnings). `next build` succeeds, with the middleware deprecation warning and two `fs` resolve warnings from `src/lib/seller-overlay.ts`.
- There is no `npm test` script. `src/lib/agent-store.test.ts` calls `confirmTrade(id)` with no actor, which matches F-06: the store never learned who is allowed to finish a trade.

### Top 5

1. **F-01 (High):** An anonymous `POST /act` as `jun` (or any unkept handle) is accepted and moves that seat.
2. **F-02 (High):** Two overlapping keeps both return 200; `allowOverwrite` lets the second create replace the first, and the test fake hides it.
3. **F-03 (High):** A human win freezes the house room. “Run it back” and “step out” do not start another round.
4. **F-06 (High):** `POST /agents/trade` with `intent=confirm` and a public trade id finalizes the trade with no cookie. Same for void.
5. **F-07 (High):** `Origin: https://evil.example` on `POST /agents/write` answers `303` to `https://evil.example/trade`.

---

## Findings

### F-01 — Anonymous callers play any unkept seat, including the house bots

- **Severity:** High · **Category:** Auth
- **Location:** `the-row/js/accounts.mjs:204-214`, `the-row/js/row-http.mjs:122-128`, `the-row/js/room.mjs:403-406`
- **Description:** `actingHandle` allows a request with no session as long as the requested handle is not a row in `book.users`. House bots (`nova`, `jun`) are seats, not users. `POST /act`, `/queue`, and `/again` then apply that handle to the shared room. A spectator can pile, vote, tap, enqueue, or step a bot, and can force a win onto a real player’s opponent. `recordRound` credits whatever handle is sitting in the winning seat.
- **Repro:** With the crowd store up, `POST /act` body `{"handle":"jun","side":"right","kind":"pile"}` and no cookie. Verified: status 200, `ok: true`, and `pile.rightScore` goes from 0 to 1. Repeat until the bot side would win.

### F-02 — A lost Blob create drops the other account, and the test never sees it

- **Severity:** High · **Category:** Race / contradiction with tests
- **Location:** `the-row/api/row.mjs:32-39` (`allowOverwrite: true` when there is no etag), `the-row/api/row.mjs:101-117`, `the-row/js/blob-store.mjs:91-99`, `the-row/js/blob-store.mjs:125-130`; contrast `the-row/test/row-http.test.mjs:178-184`
- **Description:** The first write of `row/state.json` has no etag, so `put` is an overwrite, not a compare-and-swap. If two function instances both read “no blob” and both keep a name, both puts succeed and the second document replaces the first. The loser still gets `200` and a session cookie for a book that no longer contains them. `lostCreate` only helps when `put` throws. The test double throws `conflictError()` whenever a create lands on an existing blob, so “a lost write reloads so two keeps both stay” passes against a store Vercel Blob does not implement. Later etag races do retry; the create race does not.
- **Repro:** Two `createBlobStore` instances whose `write` matches `put({ allowOverwrite: true })` (no throw when `etag` is null). `Promise.all` of `POST /keep` for `mint` and `salt`. Verified: both responses are 200, and the stored `book.users` list is only `["salt"]`.

### F-03 — A human win freezes the house room, and stepping out is undone

- **Severity:** High · **Category:** Edge cases / async
- **Location:** `the-row/js/house.mjs:64-73` (`duePlayer`), `the-row/js/house.mjs:93-114` (`staffHouse`), `the-row/js/house.mjs:135-137` and `176-181` (`play` / `houseBeat`), `the-row/js/crowd.mjs:332-336`
- **Description:** Once a real player is in `people`, `isHouseRoom` is true and the scripted crowd never runs again. `staffHouse` returns immediately when the winner of a finished round is human, so it does not reset the pile, does not read `rematch`, and does not pull the queue. `play` then no-ops because status is not `open`. “Run it back” only sets `rematch[handle] = "back"`, which nothing in the house loop consumes. “Step out” clears the seat, but `duePlayer` treats a person with no queue ticket as due, and real people are never removed from `people`, so the next beat seats them again on the still-won round. The queue does not advance. Verified over 50 beats (120s): status stayed `won`.
- **Repro:** Keep `alice`, `POST /queue` as alice, tick the crowd until she is seated, `POST /act` pile on her side five times. Status becomes `won`. `POST /again` with `{"stay":true}` returns ok. Tick 50 more beats. Verified: status still `won`, seats still alice and nova, `rematch` is `{alice: back}`. Variant: `{"stay":false}`, then queue `bob`, tick 50 beats. Verified: status still `won`, seats `{left: bob, right: alice}` — alice is back in a seat, and the new round never opened.

### F-04 — The live roster and queue have no cap, so the bots never come back

- **Severity:** High · **Category:** Edge cases / availability
- **Location:** `the-row/js/room.mjs:228-237` (`join` unshifts with no cap), `the-row/js/room.mjs:369-379` (`enqueue`), `the-row/js/row-http.mjs:46-54`, `the-row/js/house.mjs:29-31` and `84-95`; the only caps are in `revive` (`the-row/js/room.mjs:447-450`, `516-526`), which the Blob path does not call (`the-row/js/blob-store.mjs:51-76`)
- **Description:** `POST /queue` joins the handle into `people` and appends a ticket. `staffHouse` then sets `people` to every non-cast handle plus the bots. Nobody is evicted. `botCountFor` hits 0 at two real players and stays there, so the “bots step out as players arrive, and return when they leave” behaviour cannot return: players never leave. Every request rewrites the whole Blob document (book plus room). A few hundred distinct handles is already tens of KB; nothing stops it growing until the function times out.
- **Repro:** 300 `POST /queue` calls with handles `spam0` … `spam299`, then 5 crowd ticks. Verified: `people.length` 300, `queue.length` 300, zero house bots in `people`, `JSON.stringify(state)` about 40 KB.

### F-05 — Renaming a kept name lets anyone play the old handle

- **Severity:** High · **Category:** Auth
- **Location:** `the-row/js/accounts.mjs:245-247` (rename writes `user.handle` only), `the-row/js/accounts.mjs:204-214`, `the-row/js/room.mjs:403-406`
- **Description:** `keepName` on an existing session changes `user.handle` and does not touch `live.state` seats, queue, or streaks. After alice keeps `alice2`, no user owns `alice`, so `actingHandle` treats `alice` as a guest. The seat labelled alice still accepts `POST /act` from anyone. The win, if it lands, is credited to a handle that no longer has an account. This contradicts the rule the tests do lock in for a name that is still kept (“a kept name can only be played by its session”).
- **Repro:** Keep alice, queue her, tick until she sits left. `POST /keep` as her session with `{"handle":"alice2"}` (200). Then, with no cookie, `POST /act` `{"handle":"alice","side":"left","kind":"pile"}`. Verified: 200, `ok: true`.

### F-06 — Anyone can confirm or void any taken trade

- **Severity:** High · **Category:** Auth
- **Location:** `src/lib/agent-row-write.ts:131-141` (no `readPass` on confirm/void), `src/lib/agent-store.ts:1179-1206`, `src/components/agents/agent-slip.tsx:88-94` (buttons hidden unless `canAct`)
- **Description:** Take requires a pass. Confirm and void do not: the route updates the trade from the posted `tradeId` alone. Confirm also sets the lot `pulled`. Trade ids are listed on `/trade` for every visitor (`listTrades` is unfiltered), and the ids are `trade-` plus `Date.now().toString(36)` plus six `Math.random()` chars (`src/lib/agent-store.ts:298-301`). A cross-site form works because no cookie is required (`SameSite=Lax` does not apply). The slip UI hides the buttons from watchers, so the check is presentation-only. The store tests call `confirmTrade(id)` with no actor, so they document the hole rather than close it. No Stripe charge is involved; the damage is the shared ledger (status, pulled lot, and the 10% cut `mallCutThisAisle` sums).
- **Repro:** Against `next start` with a sqlite `DATABASE_URL`: wear alice, list a lot, wear bob, `POST /agents/trade` `intent=take&lotId=…`. Then, with a clean cookie jar, `POST /agents/trade` `intent=confirm&tradeId=…`. Verified: `303` to `/trade/<id>`, row `status` is `confirmed`, lot `pulled` is 1. `intent=void` on a taken trade is the same request shape.

### F-07 — Post redirects trust Origin, Referer, and X-Forwarded-Host

- **Severity:** High · **Category:** Security
- **Location:** `src/lib/agent-row-write.ts:36-46` and `:85`, `src/app/agents/talk/write/route.ts:11-28`, `src/app/donate/write/route.ts:14-32`. The same helper is copied in the mall POST routes (for example `src/app/listings/[id]/offer/tape/route.ts:11-20`).
- **Description:** `originFrom` prefers `Origin`, then `Referer`, then `X-Forwarded-Host`. The 303 is `new URL(path, thatOrigin)`. A hostile page can post the public trade or donate form and send the browser to an attacker origin that looks like the next step of the flow. Verified on the product routes, not only the mall. Cookie setting still happens on the real host; the follow-up navigation is what leaves.
- **Repro:** `curl -X POST -H "Origin: https://evil.example" -d "intent=nothing" http://127.0.0.1:44721/agents/write` → `303` `location: https://evil.example/trade`. `curl -X POST -H "X-Forwarded-Host: evil.example" -d "x=1" …/donate/write` → `303` `http://evil.example/donate?error=method`.

### F-08 — The mall redirect matcher ignores any URL with a dot

- **Severity:** High · **Category:** Config / contradiction with docs
- **Location:** `src/middleware.ts:11-40`, `src/middleware.ts:97-108`; README “Old mall routes … 308 to `/`”; Next build warning that `middleware` is deprecated (see F-18)
- **Description:** The matcher excludes `.*\..*`, so a pathname containing a dot never enters `middleware`. `isMall` therefore never redirects it. Verified `GET` 200 (the page ran) for `/listings/a.b`, `/stalls/x.y`, `/stalls/x.y/edit`, `/collections/a.b`, `/sell/start/a.b`, `/orders/a.b`, `/advertise/flyer/a.b`, `/campaigns/a.b`. The same paths without a dot return 308 to `/`. `POST /listings/a.b/offer/tape` with `amount=5` returned 303 from the tape route, so the retired write handlers execute, not just the pages. `GET /api/folder/abc.zip` returned the route’s own 404 (“no file”), not the middleware redirect.
- **Repro:** `next start`, then `curl -s -o /dev/null -w '%{http_code} %{redirect_url}' http://127.0.0.1:44721/listings/abc` (308 to `/`) versus `/listings/a.b` (200). POST the tape body above and read the 303.

### F-09 — The login key is about 30 bits, with no lockout

- **Severity:** Medium · **Category:** Security
- **Location:** `the-row/js/accounts.mjs:5`, `the-row/js/accounts.mjs:20-23`, `the-row/js/accounts.mjs:250-258`
- **Description:** A kept name’s key is 6 characters from a 31-character alphabet (`31^6` = 887,503,681, about 30 bits), shown once and stored as scrypt. `POST /login` has no attempt counter, delay, or lockout. Missing users return before scrypt and existing users do not, so timing also distinguishes “no such name” from “wrong key” even though both answers are “That key does not match.” Session tokens themselves are `randomBytes(24)` and are not the weak part.
- **Repro:** Keep a name, read the key out of the JSON, `POST /out`, then `POST /login` with that handle and a guessed key. Each guess is one request. A short script over the alphabet is the attack; the route will not slow it down.

### F-10 — The Row’s node server sends any file under its root

- **Severity:** Medium · **Category:** Security / config
- **Location:** `the-row/script/serve.mjs:88-96` (`filePath` only rejects `..`), `the-row/script/serve.mjs:120-129`
- **Description:** Static serving is “anything under `the-row/` that is not an API path.” There is no extension or basename allowlist. Verified 200 responses for `/.env.example` (the Blob token placeholder file), `/node_modules/@vercel/blob/package.json`, `/script/serve.mjs`, and `/api/row.mjs`. A real `the-row/.env` placed next to the example would be returned the same way. `..%2fpackage.json` is blocked (403) after decoding. This is the server `script/serve.mjs` and its tests ship; the Vercel function does not use this static handler. `/%E0` throws inside `decodeURIComponent` and becomes a 500 “Down” because the catch only special-cases `ENOENT` (`serve.mjs:130-138`).
- **Repro:** `PORT=4481 node script/serve.mjs`, then `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4481/.env.example` → 200. Same for the three paths above. `curl …/%E0` → 500.

### F-11 — A shared handle is last-write-wins, and the pass cookie is an unsigned identity

- **Severity:** Medium · **Category:** Auth
- **Location:** `src/lib/agent-store.ts:938-946` (`ON CONFLICT DO UPDATE` of `public_address`), `src/lib/agent-store.ts:865-878` (no DB row → trust the cookie), `src/lib/agent-row-io.ts:85-92` (`httpOnly: false`, no signature)
- **Description:** The product says there is no auth product, and the cookie is the pass. On a shared database the handle is still a primary key other people rate and sell under. A second `intent=wear` for the same handle replaces the stored address. Verified: alice wore `0xVICTIM`, a second browser wore alice with `0xATTACKER`, and `agent_passes.public_address` became `0xATTACKER`. Separately, `readPass` returns the cookie pass when the handle is not in `agent_passes` at all, so a client can mint `iss-agent-pass` (JSON, not httpOnly) and list or rate as that name without a prior wear. Lots and ratings then attribute to a handle the writer does not own.
- **Repro:** Two cookie jars, both `POST /agents/write` `intent=wear&handle=alice&publicAddress=…` with different addresses. Read `agent_passes`. The second address is the one stored.

### F-12 — A pledge has no upper bound, and it rewrites the public jar

- **Severity:** Medium · **Category:** Input validation
- **Location:** `src/app/donate/write/route.ts:43-50`, `src/lib/agent-store.ts:1456-1464` (only `amountCents >= 1` and integer), `src/lib/commerce/money.ts:20-26`
- **Description:** Donate is paper, not a charge, but the floor adds every pledge into the jar total anyone can see. There is no maximum and no pass. `900000000000000` is an integer under `2^53`, so it is stored and formatted.
- **Repro:** `POST /donate/write` with `method=stripe&from=human&amountCents=900000000000000` and no cookie. Verified: 303 to `/donate`, and the page renders `$9,000,000,000,000.00`.

### F-13 — The seller can take their own lot

- **Severity:** Medium · **Category:** Input validation / auth
- **Location:** `src/lib/agent-store.ts:1078-1128` (checks pulled, already-taken, empty handle; never `takerHandle !== lot.sellerHandle`), `src/lib/agent-row-write.ts:114-128`
- **Description:** Take copies the lot’s ask and writes a 10% fee for the taker handle. Nothing stops that handle being the seller. The seller can then confirm (F-06 does not even require them to be the taker) and record a floor cut and a pulled lot against themselves.
- **Repro:** Wear alice, `POST /agents/write` `intent=lot&title=beat&ask=10&asset=usdc`. `POST /agents/trade` as alice with `intent=take&lotId=<that id>`. The insert path has no seller check; the trade row’s `taker_handle` is alice.

### F-14 — Take and confirm are check-then-write, not one transaction

- **Severity:** Medium · **Category:** Race
- **Location:** `src/lib/agent-store.ts:1096-1127` (SELECT busy trades, then INSERT), `src/lib/agent-store.ts:1194-1205` (UPDATE trade, then UPDATE lot), `src/lib/agent-store.ts:813-855` (no `BEGIN`)
- **Description:** Two concurrent takes can both observe no `taken`/`confirmed` row and both insert. There is no partial unique index on `lot_id` for open trades. Confirm’s status change and the lot pull are two round-trips; a crash or a second take between them leaves a confirmed trade whose lot is still open, or two taken rows. `sql.all` / `sql.run` yield at each await, including on the sqlite client.
- **Repro:** List one lot. Fire two `POST /agents/trade` `intent=take&lotId=…` in parallel from two passes. The schema allows both inserts. Follow with a confirm and a second take timed between the two UPDATEs to hit the non-atomic pull.

### F-15 — A non-URL Referer throws and the POST returns 500

- **Severity:** Medium · **Category:** Error handling
- **Location:** `src/lib/agent-row-write.ts:39-40`, `src/app/agents/talk/write/route.ts:15`, `src/app/donate/write/route.ts:18`
- **Description:** `new URL(referer)` is outside any try. A `Referer` that is not an absolute URL throws `TypeError` before the write runs. Browsers send absolute referers; anything else (a client, a proxy, a probe) takes down that request. Verified on `POST /agents/write`.
- **Repro:** `curl -X POST -H "Referer: not a url" -d "intent=nothing" http://127.0.0.1:44721/agents/write` → 500.

### F-16 — Reviving a room truncates lane positions

- **Severity:** Low · **Category:** Edge cases
- **Location:** `the-row/js/room.mjs:575-578` (`Math.trunc` inside `clamp`), `the-row/js/room.mjs:558-572`, `the-row/js/live.mjs:55` (every poll runs `revive`)
- **Description:** `armLane` and `tapLane` accept fractional spots. `revive` clamps with `Math.trunc`, so a stored mark of 50.6 and a tap of 50.4 become 50 and 50. Distance ties clear both taps (`room.mjs:353-356`). The crowd poll paints the truncated room. Server award uses the pre-revive numbers; the client can show a tie the server did not play.
- **Repro:** `armLane(seed, 50.6)` then `tapLane(..., "left", 50.4)`, `JSON` round-trip, `revive`. Verified: mark 50.6 → 50, tap 50.4 → 50.

### F-17 — A bad session cookie 500s the row function

- **Severity:** Low · **Category:** Error handling
- **Location:** `the-row/js/row-http.mjs:8-14`, `the-row/api/row.mjs:162-184`
- **Description:** `readCookie` calls `decodeURIComponent` on the raw value. A cookie of `row=%E0` throws `URIError`. The Vercel handler catches it and answers 500 “Down” (and logs a fault line). The same throw is what F-10 hits on a bad path. One request, not a process crash.
- **Repro:** `curl -H "Cookie: row=%E0" http://127.0.0.1:4481/me` against `serve.mjs` → 500. The function path calls the same `readCookie` inside its try (`api/row.mjs:173`).

### F-18 — `middleware.ts` is the deprecated Next 16 convention

- **Severity:** Low · **Category:** Config
- **Location:** `src/middleware.ts:81` (export `middleware`), `next` 16.3.5; `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/middleware.md` (“deprecated, renamed to proxy”)
- **Description:** `next build` warns: `The "middleware" file convention is deprecated. Please use "proxy" instead.` The file still runs today (the 308s in F-08 prove it). The matcher bug in F-08 is independent, but this is the file that has to move when the convention stops working. `export const runtime = "nodejs"` is already what `proxy` requires.
- **Repro:** `npx next build` and read the deprecation line. It is also in the build log from this hunt.

### F-19 — `npm run lint` exits 1

- **Severity:** Low · **Category:** Config
- **Location:** `src/hooks/use-cart.ts:17-19` (reading `ref.current` during render, reported twice), `src/components/sell/retape-lookup.tsx:21` (`setState` synchronously in an effect)
- **Description:** `eslint` reports 3 errors and 6 warnings and exits 1. The warnings are unused locals: `cookiesFor` (`src/lib/agent-store.ts:574`), `cachedRaw` / `cachedIds` (`src/lib/cart.ts:23-24`), `pack` (`src/lib/hub-ads.ts:51`), `mergeRainMaps` (`src/lib/rain-date.ts:136`). `tsc --noEmit` is clean, and `next build` still succeeds, so typecheck does not catch these. The cart and retape files are mall code the middleware is supposed to retire (F-08); the lint script still lints them.
- **Repro:** `npx eslint` at the repo root. Exit code 1.

### F-20 — `agent-talk.ts` is a second, unused catalog

- **Severity:** Low · **Category:** Dead code
- **Location:** `src/lib/agent-talk.ts:1-27` (its own `AgentPass`, cookie name `iss:agent-talk` with a colon, caps, fee constant), `src/lib/agent-store.ts:574` (`cookiesFor`, never called)
- **Description:** Nothing under `src/app` or `src/components` imports `@/lib/agent-talk`. The live floor uses `@/lib/agent-store` and the hyphenated cookie `iss-agent-talk`. The file header still says the cookie lasts “until a database exists” and names a different pass shape (`id`, `stallId`, `blurb`). `docs/agent-row-db.md` says not to invent a second catalog. `cookiesFor` in the real store is unused (the lint warning in F-19).
- **Repro:** `rg "from \\"@/lib/agent-talk\\"" src` returns no imports. The module is 615 lines.

### F-21 — The store doc still describes the routes the README retires

- **Severity:** Low · **Category:** Contradiction with docs
- **Location:** `docs/agent-row-db.md:126-128` (“`/agents`, `/agents/talk`, and `/donate` call `agent-store`”), README “Writes that stay” and “Old mall routes … 308”
- **Description:** `GET /agents` and `GET /agents/talk` 308 to `/trade` and `/chat` (`src/middleware.ts:60-66`). Donate remains. The “Floor today” section of the store doc still points at the pre-portal URLs, and it says cookie names `iss:agent-pass` while the HTTP cookies are `iss-agent-pass` (the doc’s own seam table is the one that is right). A reader following “Floor today” will look for pages the middleware no longer serves.
- **Repro:** Read `docs/agent-row-db.md` “Floor today”, then `curl -s -o /dev/null -w '%{http_code} %{redirect_url}' http://127.0.0.1:44721/agents` → 308 to `/trade`.

### F-22 — Queue timestamps ignore the request clock

- **Severity:** Low · **Category:** Contradiction with tests / async
- **Location:** `the-row/js/row-http.mjs:53` (`at: Date.now()`), `the-row/js/row-http.mjs:78` (`const at = now()`), `the-row/js/house.mjs:64-72` and `the-row/js/crowd.mjs:247-253` (both compare ticket `at` to the injected `now`)
- **Description:** Account writes and crowd ticks use the `now` argument. The queue ticket stamped by `POST /queue` does not. Production clocks match, so this is not a live delay. Tests and the scratch driver that pass a fake `now` compute a negative age (`duePlayer` then returns false) or a huge age (`PULL_AFTER_MS` already elapsed). The wait-20-seconds behaviour cannot be tested through `handleRow` without freezing the real clock. `award` has the same split: `streakAt` is `Date.now()` inside `the-row/js/room.mjs:175`.
- **Repro:** Call `handleRow` for `/queue` with `now: () => 1_000_000` and a crowd tick at that same timestamp. The ticket’s `at` is the wall clock (about 1.7e12). `duePlayer` sees a negative age and will not seat that player. Re-running with `now: () => Date.now()` seats them on the next ticks.
