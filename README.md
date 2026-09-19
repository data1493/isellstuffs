# i sell stuffs

A flea-market mall for independent stalls — not a single-seller shop. Sellers list physical finds and digital goods from the same stall. Category hubs are the map of the floor.

This repo is a flea-market mall (Wave 0 shell, Wave 1 commerce contracts, Wave 2 browse + listing/stall + tote checkout, Wave 3 share titles, Wave 4 visual close). No auth. No database.

## Browse

Walk the stand-in catalog without leaving the mall map.

| Route | What it is |
| --- | --- |
| `/` | Home: hubs, labeled ads, a slice of the tables |
| `/explore` | General concourse. Filter by hub or physical/digital |
| `/browse` | Redirects to `/explore` |
| `/search` | Look up a title, stall, hub, or physical/digital |
| `/hubs` | The four aisle map |
| `/hubs/[slug]` | Opinionated hub page |

Empty filters, an empty tote, canceled or failed pay, and missing listing / stall / hub pages use the same designed empty and error panels. Those states are built for a phone-width viewport.

## Advertise

Paid corners are a product. `/advertise` is the rate card. Next weekend can be booked on a local stand-in. One campaign also has a bought landing page.

| Route | What it is |
| --- | --- |
| `/advertise` | Featured stall, homepage takeover, hub takeover — prices, rules, links to live stamps |
| `/advertise/book` | Next-weekend menu. Three kinds. Always labeled |
| `/advertise/book/[kind]` | Name the stall, confirm the package, pay on paper |
| `/advertise/receipt` | Bought slip. Stamp, package, window, price. Not on the floor yet |
| `/campaigns/homepage-beats` | Beats Under the Table Fri–Mon lander. Receipt, not a blog post |

Home, explore, and hub pages already render the labeled placements. Advertise points at those corners. It does not restyle them. Next-weekend bookings write to `localStorage` key `iss:ad-bookings` via `@/lib/ad-booking` and stop at the receipt — they do not land on the floor yet.

## Sell

List on a stall the mall already has. No account. No database. No Connect onboarding.

| Route | What it is |
| --- | --- |
| `/sell` | Why sell here, the 10% mall cut, physical vs digital |
| `/sell/new` | Create a listing on an existing stall. One booth can list both kinds |

New rows write to a local overlay (`iss:seller-listings` in the browser, in-memory on the server). Shop lookups in `@/lib/commerce` already merge that overlay, so a new SKU shows on the stall and hub the catalog already reads.

## Listing and stall pages

Open a listing or a stall directly. Home, explore, and hub browse are owned elsewhere — these routes do not replace them.

| Page | Example |
| --- | --- |
| Listing PDP | http://127.0.0.1:44721/listings/ysk-wobbly-lamp |
| Mixed stall (physical + digital) | http://127.0.0.1:44721/stalls/folding-table-tuesday |
| Featured stall | http://127.0.0.1:44721/stalls/half-working |
| Sold listing (no cart) | http://127.0.0.1:44721/listings/ysk-folding-chair |
| File-gone listing (no cart) | http://127.0.0.1:44721/listings/dl-stain-zine |

Add to cart POSTs to `/listings/bag` and writes `Listing.id` values to cookie `iss-cart-listing-ids` plus `localStorage` key `iss:cart-listing-ids` via `@/lib/cart`. Cart and checkout import that module — there is not a second bag.

## Cart and checkout

| Route | What it is |
| --- | --- |
| `/cart` | Tote. Same listing ids listing/stall pages wrote |
| `/checkout/mock` | Local test pay wall when no Stripe secret is set |
| `/checkout/success` | Paid. Tote clears. Connect split on the slip. Digital lines get “Open your folder” |
| `/checkout/cancel` | Walked away. Tote stays |
| `/folder` | Current slip’s digital lines, or “No folder on this slip.” |
| `/folder/[slip]` | One paid slip’s booth folder. Stand-in downloads, not a CDN |

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

## Share titles

Route titles, Open Graph, Twitter cards, and listing Product JSON-LD live in `@/lib/seo`. Titles and prices come from `@/lib/commerce` — do not invent listing copy in metadata.

| Surface | What a share sees |
| --- | --- |
| `/` | Mall name + four-hub pitch. WebSite JSON-LD |
| `/explore` | Concourse title; hub/type query strings get their own title and description |
| `/search` | Bare search is indexed. Query URLs are `noindex` |
| `/hubs`, `/hubs/[slug]` | Aisle name, rule, listing count |
| `/listings/[id]` | `{title} · {price}` plus condition/format, stall, status. Product + Offer JSON-LD |
| `/stalls/[slug]` | Booth name, mix of objects and files |
| `/cart`, `/checkout/*` | Real titles. `noindex` — not catalog URLs |
| Unknown path | Root 404: “Not on the map” |

Optional: set `NEXT_PUBLIC_SITE_URL` so canonical and OG URLs are absolute. Local fallback is `http://127.0.0.1:44721`.

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
