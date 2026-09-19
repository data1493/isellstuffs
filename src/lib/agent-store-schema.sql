-- Agent Row store. Many small writes. No private keys. No auth.
-- SQLite (WAL) and Postgres both accept this dialect:
-- TEXT timestamps, INTEGER 0/1 flags, ? / $n placeholders at the client.

PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 5000;

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
