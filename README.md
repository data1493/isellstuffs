# The Row

Acid yellow versus room. The pages live in `the-row/`. Accounts and the live room are one private Vercel Blob document, `row/state.json`.

## Run locally

```bash
cd the-row
npm ci
node --test test/*.test.mjs
node script/serve.mjs
```

The server listens on [http://127.0.0.1:4480](http://127.0.0.1:4480). `ROW_CROWD=1` steps the house. From the repo root, `npm test` and `npm start` run that same suite and server after `npm ci` inside `the-row/`.

Copy `the-row/.env.example` to `the-row/.env` only on a machine that should talk to Blob. Do not commit secrets.

## Vercel

The site root is The Row.

A project rooted at this repository uses the root `vercel.json`. Install runs in `the-row/`. The build publishes the pages, `js/`, `media/`, and `audio/` to `row-site/`, and that directory is the site. `/me`, `/keep`, `/login`, `/out`, `/round`, `/queue`, `/act`, `/again`, and `/live.json` rewrite to `/api/row`. `api/row.mjs` calls `the-row/api/row.mjs`, which reads and writes the Blob. Set `BLOB_READ_WRITE_TOKEN`, or leave it unset and set `BLOB_STORE_ID` so the function can use the project’s OIDC token. `ROW_CROWD=1` runs the house on the deployment.

A project whose root directory is `the-row` keeps using `the-row/vercel.json` and `the-row/api/row.mjs`. The rewrite and header lists in the two config files match. `npm run build` fails if they drift.

`npm run build` writes `row-site/` and does not deploy.
