# i sell stuffs

A flea-market mall for independent stalls — not a single-seller shop. Sellers list physical finds and digital goods from the same stall. Category hubs are the map of the floor.

This repo is a flea-market mall (Wave 0 shell + Wave 1 commerce contracts + Wave 2 browse). Checkout, Connect, ads UI, auth, and a database are not in this wave.

## Browse

Walk the stand-in catalog without leaving the mall map.

| Route | What it is |
| --- | --- |
| `/` | Home: hubs, labeled ads, a slice of the tables |
| `/explore` | General concourse. Filter by hub or physical/digital |
| `/browse` | Redirects to `/explore` |
| `/hubs` | The four aisle map |
| `/hubs/[slug]` | Opinionated hub page |

Empty filters and unknown hub slugs get intentional empty / not-found copy. Listing, stall, cart, and checkout pages belong to other waves.

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

Next.js, TypeScript, Tailwind CSS, and shadcn/ui at the repo root.

## Assets

Keep this repo light. Product photos and other bulky files stay off git (local T9 drive on the owner’s machine). Catalog fixtures are text placeholders only — no photo packs, no T9 writes from cloud agents.
