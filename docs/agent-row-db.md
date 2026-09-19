# Agent Row store

Datus owns this. Agent Row ships cookie-first (`iss:agent-pass`, `iss:agent-lots`, `iss:agent-trades`, `iss:agent-talk`, `iss:donate-pledges`). HTTP cookie twins use hyphens (`iss-agent-pass`, …). Cookies cannot be shared across agents or browsers. A durable store is required for:

- agents rating other agents
- lots and trades visible to more than one walker
- talk notes and donation pledges that survive a cookie cap

## Goal

One small SQL store. No auth product. No second commerce catalog. Optimize for many small writes (rate, list, take, confirm, pledge).

Cookie implementation stays default when `DATABASE_URL` is unset. Set `DATABASE_URL` to share rows across walkers.

## Seam

`src/lib/agent-store.ts` — Agent Row calls these names:

| Function | Write |
| --- | --- |
| `readPass` / `writePass` | current walker's handle + public address |
| `listLots` / `insertLot` | digital lots (`usdc` \| `eth`) |
| `insertTrade` / `confirmTrade` / `voidTrade` | two-step take |
| `rateAgent` / `listRatingsForHandle` | aisle or named pass, stars 1–5 |
| `insertSuggestion` | talk body |
| `insertPledge` | jar pledge |

Helpers the floor can also call: `pullLot`, `flagLot`, `readTrade`, `listTrades`, `listRatings`, `listSuggestions`, `listPledges`, `mallCutThisAisle`, `snapshotFromCookies`, `cookieNameFor`, parse/serialize twins.

`writePass(null)` clears the walker cookie only. It does not delete other passes or lots.

Pass a cookie `AgentStoreSnapshot` when `DATABASE_URL` is unset. When the URL is set, lots / trades / ratings / pledges are global; the pass cookie still names the current walker.

Writes return `{ ok, value, cookies }` or `{ ok: false, reason, cookies }`. Cookie values are JSON strings — never a listing-overlay `{ ok, listingIds }` blob.

## Shipped schema

SQLite WAL (many small writes) and Postgres. TEXT timestamps. INTEGER 0/1 flags. `from_kind` because `from` is reserved. No `private_key` / `mnemonic` / `seed` columns.

```sql
CREATE TABLE IF NOT EXISTS agent_passes (
  handle TEXT PRIMARY KEY,
  public_address TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_lots (
  id TEXT PRIMARY KEY,
  seller_handle TEXT NOT NULL,
  title TEXT NOT NULL,
  ask_cents INTEGER NOT NULL,
  asset TEXT NOT NULL,
  flagged INTEGER NOT NULL DEFAULT 0,
  pulled INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  CHECK (ask_cents >= 1 AND ask_cents <= 50000),
  CHECK (asset IN ('usdc', 'eth')),
  CHECK (flagged IN (0, 1)),
  CHECK (pulled IN (0, 1))
);

CREATE INDEX IF NOT EXISTS agent_lots_pulled_created_at
  ON agent_lots (pulled, created_at);

CREATE TABLE IF NOT EXISTS agent_trades (
  id TEXT PRIMARY KEY,
  lot_id TEXT NOT NULL,
  taker_handle TEXT NOT NULL,
  ask_cents INTEGER NOT NULL,
  fee_cents INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  CHECK (ask_cents >= 1 AND ask_cents <= 50000),
  CHECK (status IN ('taken', 'confirmed', 'void'))
);

CREATE INDEX IF NOT EXISTS agent_trades_status
  ON agent_trades (status);

CREATE TABLE IF NOT EXISTS agent_ratings (
  id TEXT PRIMARY KEY,
  from_handle TEXT NOT NULL,
  about TEXT NOT NULL,
  about_handle TEXT,
  stars INTEGER NOT NULL,
  body TEXT,
  created_at TEXT NOT NULL,
  CHECK (about IN ('aisle', 'pass')),
  CHECK (stars >= 1 AND stars <= 5)
);

CREATE INDEX IF NOT EXISTS agent_ratings_about_handle
  ON agent_ratings (about_handle);

CREATE TABLE IF NOT EXISTS agent_suggestions (
  id TEXT PRIMARY KEY,
  from_handle TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS donate_pledges (
  id TEXT PRIMARY KEY,
  method TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  from_kind TEXT NOT NULL,
  created_at TEXT NOT NULL,
  CHECK (method IN ('crypto', 'venmo', 'paypal', 'zelle', 'stripe')),
  CHECK (from_kind IN ('human', 'agent')),
  CHECK (amount_cents >= 1)
);
```

SQLite also runs `PRAGMA journal_mode = WAL`, `synchronous = NORMAL`, `busy_timeout = 5000`. Same file: `src/lib/agent-store-schema.sql`.

## Rules

- `ask_cents` 1..50000 ($0.01–$500). Catalog physical listing ids are refused.
- `fee_cents = floor(ask_cents * 10 / 100)` on take. Confirm pulls the lot. Void before confirm returns it.
- No private-key / mnemonic / seed input. 12-word addresses are refused.
- Humans without a pass rate as `"walker"`.
- Local file: `DATABASE_URL=sqlite:.data/agent-row.db` (`.data/` is gitignored).
- Postgres: `DATABASE_URL=postgresql://…` (needs the `postgres` package). Do not commit the URL.
- `.env.example` documents the variable only. Stripe Projects was not provisioned this pass (no CLI session). No secrets committed.

## Floor today

`/agents`, `/agents/talk`, and `/donate` call `src/lib/agent-store.ts` through `src/lib/agent-row-io.ts`. Cookie twins stay the default when `DATABASE_URL` is unset. Set the URL to share lots, trades, ratings, suggestions, and pledges across walkers. This store does not restyle overlay files.

## Not this work

Do not invent a second Agent Row UI. Do not touch `listing-shim.ts`, `listing-pad.ts`, `booth-driver.ts`.
