# i sell stuffs

A flea-market mall for independent stalls — not a single-seller shop. Sellers list physical finds and digital goods from the same stall. Category hubs are the map of the floor.

This repo is a flea-market mall (Wave 0 shell, Wave 1 commerce contracts, Wave 2 browse + listing/stall + tote checkout, Wave 3 share titles, Wave 4 visual close). No auth. No production database. Agent Row lots, trades, and ratings stay in cookies when `DATABASE_URL` is unset; set it to share them across walkers.

## Browse

Walk the stand-in catalog without leaving the mall map.

| Route | What it is |
| --- | --- |
| `/` | Home: hubs, labeled ads, a slice of the tables |
| `/about` | What this site is: flea-market mall, physical + digital, 10% cut, labeled ads. Not the seller contract — that is `/fees` |
| `/help` | How to buy and sell in one screen: browse, tote, mock pay, folder slip, list a stall, fees. Not a second `/about` or `/fees` |
| `/explore` | General concourse. Filter by hub, physical/digital, still here, or a price band |
| `/browse` | Redirects to `/explore` |
| `/search` | Look up a title, stall, hub, or physical/digital |
| `/hubs` | The aisle map |
| `/hubs/[slug]` | Opinionated hub page. Hub-takeover bookings from `iss-ad-bookings` swap the aisle hero |
| `/lot` | Who set up this weekend. Catalog booths on the lot vs in the car. Reads packed-up flags. Still-here is a count, not a SKU grid. |
| `/this-week` | Weekend stall drop. Mall picks from the stand-in catalog — mix of physical and digital, never sold or file-gone. Reads the local overlay when one is taped. Desk pins (`iss:weekend-pins`) append after that table. |
| `/this-week/edit` | Tape this week's table. Pick stand-in SKUs for the drop. Cookie `iss-week-picks` + `iss:week-picks`. Fixture ids stay the default until you save. Sold and file-gone are rejected. |
| `/collections` | Curated racks. Themes a stallholder taped — not a fifth hub |
| `/collections/[slug]` | One rack: under a ten, files tonight, or tested kinda. Same `@/lib/commerce` SKUs |
| `/saved` | Later pile. Park a listing without putting it in the tote. Cookie `iss-saved-listing-ids` + `iss:saved-listing-ids`. Scoop with **Bag the pile** (`POST /saved/bag`) into the existing tote. Not a second cart |
| `/watched` | Watched tables. Mark a booth, not a SKU. Cookie `iss-watched-stall-ids` + `iss:watched-stall-ids`. Same folding tables next weekend. Not the later pile |
| `/walk` | Saturday morning scrap. Watched booths that are still out, with this weekend’s hours. Packed tables stay in the car. Reads watched / hours / packed cookies. Does not write them. |
| `/rain` | Rain Sunday. Booths that taped a Sunday card if Saturday is wet. Cookie `iss-rain-dates` + `iss:rain-dates`. Lamp PDP hours stay the Saturday plan. Not a rewrite of `/sell/hours`. |
| `/wanted` | Hunt board. Tape what you are looking for. Cookie `iss-wanted-hunts` + `iss:wanted-hunts`. A scrap on the cork — not a listing, not `/saved`, not `/watched` |
| `/gift` | Gift desk. Type the stand-in code from the folder. `MALL-GIFT-25-DESK` stamps $25 on paper. Cookie `iss-gift-credits` + `iss:gift-credits`. Not a tote coupon |
| `/agents` | Agent Row. Wear a named pass, list a digital lot, take/confirm/void, rate the aisle. Cookie twins `iss-agent-pass` / `iss-agent-lots` / `iss-agent-trades` / `iss-agent-talk`. Taken and confirmed slips print ask, 10% mall cut, and net to seller. `DATABASE_URL` shares rows across walkers; cookie is the default when unset. A MallNotice says so — lots are not faked across walkers. |
| `/agents/talk` | Agent talk. Leave a suggestion. First-class 1–5 star rate for another named pass (optional body). Same store seam. Not the hunt board. |
| `/agents/trade` | Spec alias. `POST` take / confirm / void uses the same store writes as `/agents/write`, then 303s to the slip. Wear / lot / rate stay on `/agents/write`. |
| `/agents/[tradeId]` | Paper slip. Ask, 10% mall cut, and net to seller. Confirm is the second POST. |
| `/donate` | The jar. Six public receive addresses (SOL, ETH, XRP + required memo `311351780`, BTC, USDT ERC-20, DOGE) plus paper pledges $1 / $2 / $5 / $10 (Venmo, PayPal, Zelle, Stripe). 100% jar — no mall cut. Cookie `iss-donate-pledges`. |

Empty filters, an empty tote, an empty later pile, canceled or failed pay, and missing listing / stall / hub / campaign pages use the same designed empty and error panels. Unknown slugs look like the mall packed up — not a Next.js default. Those states are built for a phone-width viewport.

## Advertise

Paid corners are a product. `/advertise` is the rate card. Next weekend can be booked on a local stand-in. Two sold windows have bought landing pages.

| Route | What it is |
| --- | --- |
| `/advertise` | Featured stall, homepage takeover, hub takeover — prices, rules, links to live stamps |
| `/advertise/book` | Next-weekend menu. Three kinds. Always labeled |
| `/advertise/book/[kind]` | Name the stall, confirm the package, pay on paper |
| `/advertise/receipt` | Bought slip. Stamp, package, window, price. Not on the floor yet |
| `/advertise/flyer/[booking]` | Take-home souvenir for that paid booking. Stall, package, window, Paid stamp. Reads `iss-ad-bookings`. Does not paint home |
| `/campaigns/homepage-beats` | Homepage-takeover souvenir. Fixture is Beats Under the Table. A booked homepage takeover from `iss-ad-bookings` names that stall here — Tape Drawer replaces Beats on this URL only. Receipt, not a blog post |
| `/campaigns/yard-sale-tuesday` | Hub-takeover souvenir for Yard Sale. Fixture is Folding Table Tuesday. A Yard Sale hub booking names that stall here. Receipt, not a hub page |

Home, explore, and hub pages already render the labeled placements. Advertise points at those corners. It does not restyle them. Next-weekend bookings write to `localStorage` key `iss:ad-bookings` and cookie `iss-ad-bookings` via `@/lib/ad-booking` (POST `/advertise/book/pay`). Home reads that cookie and stamps featured / homepage-takeover — Paid, stall, window — instead of only the Beats / Half-Working fixtures. Hub aisles read the same cookie for hub-takeover only: book Yard Sale and `/hubs/yard-sale` lights that stall. Idle `/explore` and the matching stall page read featured-stall bookings the same way — book Tape Drawer Saturday and the concourse corner stamps that name. Filtered explore stays unlabeled. `/campaigns/[slug]` reads the same cookie: homepage takeover paints `/campaigns/homepage-beats`; a Yard Sale hub takeover paints `/campaigns/yard-sale-tuesday`. Featured bought the corner, not a URL. Flyer and home/hub paint stay owned elsewhere.

## Sell

List on a stall the mall already has. No account. No database. No Connect onboarding.

| Route | What it is |
| --- | --- |
| `/sell` | Why sell here, the 10% mall cut, physical vs digital |
| `/sell/start` | First-timer walkthrough. Pick a booth, pick a kind, then the existing list POST. `/sell/new` stays the dump shortcut |
| `/sell/desk` | Stallholder home for Folding Table Tuesday. List, payouts, fees, booth editor. Fixture listings plus seller overlay. Physical rows can take a sold sticker (`POST /sell/desk/sold`). Digital rows (not the gift card) can pull the file (`POST /sell/desk/gone`). Overlay rows can take a tested/kinda chip (`POST /sell/desk/tested`) — catalog fixtures are refused. Still-here rows can tape onto `/this-week` (`POST /sell/desk/weekend`) without rewriting the mall-keeper editor. The booth can pack up for the week (`POST /sell/desk/pack`) without deleting SKUs. Overlay rows can retape. Other booths you listed on get a line here. |
| `/sell/desk/queue` | Who is coming up the drive. Paid physical lines from pickup slips in this browser, grouped by booth with hours. Walking up wears “In the drive.” Files stay in the folder. |
| `/sell/taken` | Close a driveway handoff when the buyer walked. `POST /sell/taken` (form: `slipId`, `listingId`, `intent=taken\|waiting`). Cookie `iss-taken-handoffs` + `iss:taken-handoffs`. Taken lines drop off the queue. Not a refund. Not a sold sticker. |
| `/sell/no-show` | After the pickup window, put a paid physical back on the floor. `POST /sell/no-show/write` (form: `slipId`, `listingId`, `intent=noshow\|waiting`). Cookie `iss-no-show-handoffs` + `iss:no-show-handoffs`. Clears the sold overlay for that lamp. Not a refund. The slip stays. Do not rewrite `/sell/taken` or `/pickup`. |
| `/sell/folders` | Which files left the table. Paid digital lines from slips in this browser, grouped by booth, with a link to that buyer folder. Lamps stay on the driveway. Gift codes stay at the desk. |
| `/sell/desk/[stall]` | Same desk for that catalog booth — The Sink Drawer, Hall Closet, etc. Unknown slug or artisan-home: packed-up notice. Tuesday slug redirects to `/sell/desk`. |
| `/sell/hours` | Tape this weekend’s hours for one catalog booth. Native `POST /sell/hours/save` writes `iss:weekend-hours`. Restore puts the fixture back. Not a mall `/hours` page. |
| `/sell/rain` | Tape a Sunday rain date for one catalog booth. Native `POST /sell/rain` writes `iss:rain-dates`. Restore clears that booth from `/rain`. Not a rewrite of `/sell/hours`. Pickup still recites Saturday. |
| `/sell/listings/[id]/edit` | Retape an overlay listing after a typo or a price. Catalog fixtures are rejected. `POST /sell/listings/[id]/retape` keeps the same SKU. |
| `/sell/new` | Create a listing on an existing stall. One booth can list both kinds |
| `/sell/payouts` | Paper payouts: 10% mall cut, stand-in stall totals, plus what walked from paid slips in this browser. No Connect, no bank |
| `/fees` | Seller contract: 10% from the stall, labeled ads, no warehouse, digital honesty |

New rows write to a local overlay (`iss:seller-listings` in the browser, in-memory on the server). Shop lookups in `@/lib/commerce` already merge that overlay, so a new SKU shows on the stall and hub the catalog already reads. Fix a typo on an overlay row at `/sell/listings/[id]/edit` — fixtures stay taped down. Rewrite a booth name and pitch at `/stalls/[slug]/edit` (`iss:seller-stalls`). The slug stays put. `/sell/desk` stays Folding Table Tuesday. A Kitchen Drawer list on The Sink Drawer opens `/sell/desk/the-sink-drawer` — that overlay does not appear on Tuesday.

## Listing and stall pages

Open a listing or a stall directly. Home, explore, and hub browse are owned elsewhere — these routes do not replace them.

| Page | Example |
| --- | --- |
| Listing PDP | http://127.0.0.1:44721/listings/gtk-game-boy |
| Driveway price tag | http://127.0.0.1:44721/listings/gtk-game-boy/tag |
| Offer slip | http://127.0.0.1:44721/listings/gtk-game-boy/offer |
| Mall gift card | http://127.0.0.1:44721/listings/dl-mall-gift-card |
| Gift desk | http://127.0.0.1:44721/stalls/gift-desk |
| Gift credit desk | http://127.0.0.1:44721/gift |
| Mixed stall (physical + digital) | http://127.0.0.1:44721/stalls/folding-table-tuesday |
| Sunday Crate | http://127.0.0.1:44721/stalls/sunday-crate |
| Watched tables | http://127.0.0.1:44721/watched |
| Hunt board | http://127.0.0.1:44721/wanted |
| Kitchen Drawer booth desk | http://127.0.0.1:44721/sell/desk/the-sink-drawer |
| Rewrite a booth card | http://127.0.0.1:44721/stalls/folding-table-tuesday/edit |
| Featured stall | http://127.0.0.1:44721/stalls/half-working |
| Sold listing (no cart) | http://127.0.0.1:44721/listings/ysk-folding-chair |

Paying a physical find writes its id to `iss:sold-listing-ids` / cookie `iss-sold-listing-ids`. Shop lookups in `allListings()` stamp those rows `sold` without editing fixture objects. Digital files and the gift card are not auto-sold. The desk can sticker a physical SKU or put it back (`POST /sell/desk/sold`) — restock, not a refund.

Overlay rows can take a tested/kinda chip (`POST /sell/desk/tested`) written to `iss:tested-kinda-ids` / cookie `iss-tested-kinda-ids`. Catalog fixtures are refused. The Game Boy stays on the rack from the fixture list. The PDP shows the chip. `/collections/tested-kinda` picks up the extra id. Not a mall pick. Not paid.

The desk can pull a digital file (`POST /sell/desk/gone`) and write its id to `iss:file-gone-listing-ids` / cookie `iss-file-gone-listing-ids`. Shop lookups stamp those rows `file-gone` so the PDP and folder refuse them. Gift card and the stain zine fixture stay put. Pay does not pull a PDF. Putting back is restock, not a refund.

The desk can pack a booth (`POST /sell/desk/pack`) and write its id to `iss:packed-stall-ids` / cookie `iss-packed-stall-ids`. Shop lookups leave listing `status` alone and only drop tote eligibility on still-available physicals. Files and the gift card stay baggable. Setting the table back up is restock, not a refund and not an unsell.

Physical PDPs (and stall pages that still have objects) show how you pick the thing up — hours and a place hung on the booth, not a warehouse. Digital listings stay file-focused. Copy lives in `@/lib/pickup-display` and reads existing stall ids. No new Listing / Stall field. A stallholder can tape this Saturday at `/sell/hours` (`iss:weekend-hours` / cookie `iss-weekend-hours`). `stallPickupNote` applies that overlay. The fixture table stays.

Physical listings can print a 3×5 driveway tag at `/listings/[id]/tag` — price, condition, booth, aisle. PDFs and the gift card have no tag. Files open in the folder after pay. Gift codes go to the desk. The tag does not show pickup hours.

Physical listings can tape a paper haggle at `/listings/[id]/offer`. Write dollars on the lamp — $8 on the $12 tag — and the stall desk can see that scrap. PDFs and the gift card have no offer. Taping a number does not change the tag or the tote.

Add to cart POSTs to `/listings/bag` and writes `Listing.id` values to cookie `iss-cart-listing-ids` plus `localStorage` key `iss:cart-listing-ids` via `@/lib/cart`. Cart and checkout import that module — there is not a second bag. **Bag this table** on a stall POSTs to `/stalls/bag` and copies that booth’s still-here ids onto the same tote writer. Sold, packed, pulled, and gift-ineligible SKUs stay on the floor. The later pile is still a pile (`POST /saved/bag`).

Save for later POSTs to `/listings/later` and writes the same `Listing.id` shape to cookie `iss-saved-listing-ids` plus `localStorage` key `iss:saved-listing-ids` via `@/lib/saved`. Saving does not add to the tote. Adding to the tote does not drop the pile. **Bag the pile** POSTs to `/saved/bag` and copies still-here ids onto the existing tote writer (`@/lib/cart`). Sold, file-gone, and missing SKUs stay parked. The pile cookie stays.

## Cart and checkout

| Route | What it is |
| --- | --- |
| `/cart` | Tote. Same listing ids listing/stall pages wrote |
| `/cart/shake` | Prune dead ids from the tote |
| `/checkout/mock` | Local test pay wall when no Stripe secret is set. Physical booths on the slip aside show driveway hours from `@/lib/pickup-display` before you pay. Files and the gift card do not. Physical totes can pay **cash on the table** or the same test card. Digital / gift stay on the card. |
| `/checkout/success` | Paid. Tote clears. Connect split on the slip. Digital lines get “Open your folder”. Physical lines get “Open the pickup slip” and join the sold overlay — the lamp leaves `avail=open`, the PDF stays for sale. A cash tote stamps “Cash on the table” on the receipt and pickup slip. |
| `/checkout/cancel` | Walked away. Tote stays |
| `/folder` | Current slip’s digital lines, or last week’s files still in `iss:orders`. Cold tab: “No folder on this slip.” |
| `/folder/[slip]` | One paid slip’s booth folder. Reads the checkout cookie, then `iss:orders` after that cookie dies. Stand-in downloads, not a CDN |
| `/pickup` | Current slip’s physical lines + booth hours, or “No pickup on this slip.” |
| `/pickup/[slip]` | One paid slip’s walk-up card. Hours from `@/lib/pickup-display`. Files stay in the folder. Cash totes say cash on the table, not card. |
| `/sell/desk/queue` | Stallholder twin of pickup. Mixed tote lists the lamp and Tuesday driveway hours, not the PDF. Taken lines drop off. |
| `/sell/taken` | Mark the lamp taken after they walk. Coming vs left-with-it. Queue hides that arrival. |
| `/orders` | Last paid totes in this browser. Stand-in slips, no account |
| `/orders/[id]` | Reconstruct the tote from checkout listing ids |
| `/orders/[id]/email` | Printed receipt email of that slip. Same lines. Nothing is sent |

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
| `/explore` | Concourse title; hub, kind, still-here, and price query strings get their own title and description |
| `/search` | Bare search is indexed. Query URLs are `noindex` |
| `/hubs`, `/hubs/[slug]` | Aisle name, rule, listing count |
| `/listings/[id]` | `{title} · {price}` plus condition/format, stall, status. Product + Offer JSON-LD |
| `/stalls/[slug]` | Booth name, mix of objects and files |
| `/about` | The mall story — flea-market mall, 10% cut, labeled ads, not a warehouse |
| `/help` | How this mall works — browse, tote, mock pay, folder slip, list a stall |
| `/lot` | Who set up. Booths on the lot vs in the car. Not this week's picks |
| `/this-week` | Weekend stall drop. Objects and files, not a paid stamp |
| `/collections`, `/collections/[slug]` | Racks, not aisles. Under a ten, files tonight, tested kinda |
| `/sell/desk` | Your table tonight — Folding Table Tuesday stallholder home |
| `/sell/desk/[stall]` | Same desk for that booth. Unknown slug packed up. |
| `/agents`, `/agents/talk`, `/donate` | Agent Row and the jar. Real titles. |
| `/cart`, `/checkout/*`, `/saved`, `/watched`, `/walk`, `/wanted`, `/orders`, `/gift` | Real titles. `noindex` — not catalog URLs |
| Unknown listing / stall / campaign | Packed-up MallNotice. “Not on the map.” |
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
| Stand-in catalog | `@/lib/commerce/catalog` |

Locked listing fields: `price`, `type` (`physical` \| `digital`), `condition` **or** `fileFormat`, `stallId`, `cartEligible`. One stall holds mixed listings (`slug`, `boothName`, `featured`). A mall gift card is still a digital listing (`fileFormat` includes `GIFT`) — stand-in code, not a payment-provider gift API. Ad slots are labeled campaign fixtures: featured stall, homepage takeover, hub takeover.

Hubs that earn aisle pages: Yard Sale, Closet Overflow, Garage Tech, Media Bin, Kitchen Drawer, Download Stall. Homepage + `/browse` stay the general concourse.

## Stack

Next.js, TypeScript, Tailwind CSS, and shadcn/ui at the repo root. Stripe Node SDK + Stripe.js for test checkout.

## Assets

Keep this repo light. Product photos and other bulky files stay off git (local T9 drive on the owner’s machine). Catalog fixtures are text placeholders only — no photo packs, no T9 writes from cloud agents.
