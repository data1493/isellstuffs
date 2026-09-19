# i sell stuffs

A flea-market mall for independent stalls — not a single-seller shop. Sellers list physical finds and digital goods from the same stall. Category hubs are the map of the floor.

This repo is a flea-market mall (Wave 0 shell, Wave 1 commerce contracts, Wave 2 browse + listing/stall + tote checkout). No auth. No database.

## Browse

Walk the stand-in catalog without leaving the mall map.

| Route | What it is |
| --- | --- |
| `/` | Home: hubs, labeled ads, a slice of the tables |
| `/explore` | General concourse. Filter by hub or physical/digital |
| `/browse` | Redirects to `/explore` |
| `/hubs` | The four aisle map |
| `/hubs/[slug]` | Opinionated hub page |

Empty filters and unknown hub slugs get intentional empty / not-found copy.

## Listing and stall pages

Open a listing or a stall directly. Home, explore, and hub browse are owned elsewhere — these routes do not replace them.

| Page | Example |
| --- | --- |
| Listing PDP | http://127.0.0.1:44721/listings/ysk-wobbly-lamp |
| Mixed stall (physical + digital) | http://127.0.0.1:44721/stalls/folding-table-tuesday |
| Featured stall | http://127.0.0.1:44721/stalls/half-working |
| Sold listing (no cart) | http://127.0.0.1:44721/listings/ysk-folding-chair |
| File-gone listing (no cart) | http://127.0.0.1:44721/listings/dl-stain-zine |

Add to cart writes `Listing.id` values to `localStorage` key `iss:cart-listing-ids` via `@/lib/cart` and `use-cart`. Cart and checkout import that module — there is not a second bag.

## Cart and checkout

| Route | What it is |
| --- | --- |
| `/cart` | Tote. Same listing ids listing/stall pages wrote |
| `/checkout/mock` | Local test pay wall when no Stripe secret is set |
| `/checkout/success` | Paid. Tote clears. Connect split on the slip |
| `/checkout/cancel` | Walked away. Tote stays |

Open **http://127.0.0.1:44721/cart**. Deep-link with `?add=<listingId>` uses the same cart writer.

## Run locally

Needs Node 20+.

```bash
npm install
npm run dev
```

The dev server listens on **http://127.0.0.1:44721**.

```bash
npm run build
npm start
```

`npm start` uses the same port.

## Payments (test only)

Checkout is a **platform** charge with a **separate-charges-and-transfers** plan for multi-stall totes. The mall keeps 10%. Each stall is owed the remainder. No live Connect onboarding. Live Stripe keys are rejected.

| Situation | What happens |
| --- | --- |
| No `STRIPE_SECRET_KEY` | Local pay wall. Stripe.js loads if a test publishable key is present. |
| `STRIPE_SECRET_KEY` is `sk_test_` or `rk_test_` | Creates a Stripe Checkout Session; the client redirects to hosted Checkout. |
| Live secret or publishable key | Refused. The app will not talk to production Stripe. |

Optional local env (gitignored — do not commit keys):

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — test publishable key for Stripe.js
- `STRIPE_SECRET_KEY` — test secret; omit it and checkout stays mocked

Do not put production keys in this app.

## Commerce contracts (import these)

Other agents should import from `@/lib/commerce`. Do not invent listing, stall, or ad-slot shapes.

| Module | Path |
| --- | --- |
| Barrel | `@/lib/commerce` |
| Types | `@/lib/commerce/types` |
| Locked hubs | `@/lib/commerce/hubs` |
| Money helpers | `@/lib/commerce/money` |
| Stand-in catalog (12 SKUs) | `@/lib/commerce/catalog` |

Locked listing fields: `price`, `type` (`physical` \| `digital`), `condition` **or** `fileFormat`, `stallId`, `cartEligible`. One stall holds mixed listings (`slug`, `boothName`, `featured`). Ad slots are labeled campaign fixtures: featured stall, homepage takeover, hub takeover.

Hubs that earn aisle pages: Yard Sale, Closet Overflow, Garage Tech, Download Stall. Homepage + `/browse` stay the general concourse.

## Stack

Next.js, TypeScript, Tailwind CSS, and shadcn/ui at the repo root. Stripe Node SDK + Stripe.js for test checkout.

## Assets

Keep this repo light. Product photos and other bulky files stay off git (local T9 drive on the owner’s machine). Catalog fixtures are text placeholders only — no photo packs, no T9 writes from cloud agents.
