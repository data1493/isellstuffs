# i sell stuffs

A flea-market mall for independent stalls — not a single-seller shop. Sellers list physical finds and digital goods from the same stall. Category hubs are the map of the floor.

This repo is a flea-market mall (Wave 0 shell, Wave 1 commerce contracts, Wave 2 browse + listing/stall + tote checkout, Wave 3 share titles, Wave 4 visual close). No auth. No database.

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
| `/lot` | Who set up this weekend. Catalog booths on the lot vs in the car. Reads packed-up flags, lunch notes, gravel notes, who is sitting, last-call fold notes, change-jar notes, who is sharing the table, hangers-stay furniture notes, shade notes, don't-photograph notes, kids-touch-it notes, keep-the-poly-on notes, wrap-breakables notes, don't-open-the-shell notes, don't-email-the-zip notes, don't-unfold-the-pile notes, don't-sit-on-the-crate notes, I-don't-fix notes, and I-don't-burn-a-disc notes. Still-here is a count, not a SKU grid. |
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
| Listing PDP | http://127.0.0.1:44721/listings/ysk-wobbly-lamp |
| Driveway price tag | http://127.0.0.1:44721/listings/ysk-wobbly-lamp/tag |
| Offer slip | http://127.0.0.1:44721/listings/ysk-wobbly-lamp/offer |
| That's the price | http://127.0.0.1:44721/listings/ysk-wobbly-lamp/firm |
| Look, don't bag | http://127.0.0.1:44721/listings/ysk-wobbly-lamp/look |
| Ask before you flip it | http://127.0.0.1:44721/listings/mdb-scratched-lp/ask |
| Needs two people | http://127.0.0.1:44721/listings/ysk-wobbly-lamp/heavy |
| Pockets are empty | http://127.0.0.1:44721/listings/clo-windbreaker/pockets |
| Which press | http://127.0.0.1:44721/listings/mdb-scratched-lp/press |
| Sold for parts | http://127.0.0.1:44721/listings/gtk-cable-drawer/parts |
| Batteries not included | http://127.0.0.1:44721/listings/gtk-game-boy/cells |
| Smells like smoke | http://127.0.0.1:44721/listings/clo-windbreaker/smoke |
| Tag says L | http://127.0.0.1:44721/listings/clo-windbreaker/size |
| Fits a 3-quart | http://127.0.0.1:44721/listings/kdr-lid-no-pot/fits |
| I played it once | http://127.0.0.1:44721/listings/mdb-scratched-lp/plays |
| I kept the good laces | http://127.0.0.1:44721/listings/clo-split-soles/laces |
| The discs walked | http://127.0.0.1:44721/listings/ysk-burned-cdr/cases |
| Not for the microwave | http://127.0.0.1:44721/listings/kdr-chipped-mug/heat |
| Leave it bent | http://127.0.0.1:44721/listings/kdr-bent-whisk/bent |
| Rewired | http://127.0.0.1:44721/listings/ysk-wobbly-lamp/cord |
| I washed it | http://127.0.0.1:44721/listings/clo-windbreaker/wash |
| The remote walked | http://127.0.0.1:44721/listings/gtk-game-boy/remote |
| The skip stays | http://127.0.0.1:44721/listings/mdb-scratched-lp/skip |
| I don't grade your lot | http://127.0.0.1:44721/listings/dl-camera-luts/grade |
| These twelve shots | http://127.0.0.1:44721/listings/dl-sample-pack/stems |
| Won't split the pile | http://127.0.0.1:44721/listings/gtk-cable-drawer/pile |
| The strap walked | http://127.0.0.1:44721/listings/clo-windbreaker/strap |
| The water ring stays | http://127.0.0.1:44721/listings/gtk-cable-drawer/ring |
| The needle walked | http://127.0.0.1:44721/listings/gtk-game-boy/needle |
| The booklet walked | http://127.0.0.1:44721/listings/ysk-burned-cdr/book |
| The hiss stays | http://127.0.0.1:44721/listings/mdb-mixtape-93/hiss |
| The peel stays | http://127.0.0.1:44721/listings/clo-split-soles/toe |
| The key walked | http://127.0.0.1:44721/listings/mdb-jewel-stack/key |
| The hinge stays gone | http://127.0.0.1:44721/listings/mdb-jewel-stack/hinge |
| In someone's hands | http://127.0.0.1:44721/listings/ysk-wobbly-lamp/hands |
| These two go together | http://127.0.0.1:44721/listings/clo-windbreaker/with |
| Scan the liner | http://127.0.0.1:44721/listings/mdb-mixtape-93/scan |
| More in the van | http://127.0.0.1:44721/listings/gtk-cable-drawer/van |
| Mall gift card | http://127.0.0.1:44721/listings/dl-mall-gift-card |
| Gift desk | http://127.0.0.1:44721/stalls/gift-desk |
| Gift credit desk | http://127.0.0.1:44721/gift |
| Mixed stall (physical + digital) | http://127.0.0.1:44721/stalls/folding-table-tuesday |
| Booth scrap | http://127.0.0.1:44721/stalls/folding-table-tuesday/scrap |
| Back after lunch | http://127.0.0.1:44721/stalls/folding-table-tuesday/back |
| Moved two spots | http://127.0.0.1:44721/stalls/folding-table-tuesday/spot |
| Neighbor is sitting | http://127.0.0.1:44721/stalls/folding-table-tuesday/cover |
| Folding up at noon | http://127.0.0.1:44721/stalls/folding-table-tuesday/fold |
| I can break a twenty | http://127.0.0.1:44721/stalls/folding-table-tuesday/break |
| Sharing this table | http://127.0.0.1:44721/stalls/folding-table-tuesday/share |
| Closet hangers stay | http://127.0.0.1:44721/stalls/the-hall-closet/stay |
| Sunday Crate shade | http://127.0.0.1:44721/stalls/sunday-crate/shade |
| Don't photograph the tags | http://127.0.0.1:44721/stalls/folding-table-tuesday/film |
| Kids touch it, you buy it | http://127.0.0.1:44721/stalls/folding-table-tuesday/kids |
| Sunday Crate poly | http://127.0.0.1:44721/stalls/sunday-crate/poly |
| I wrap breakables | http://127.0.0.1:44721/stalls/the-sink-drawer/wrap |
| Don't open the shell | http://127.0.0.1:44721/stalls/half-working/shell |
| I don't email the zip | http://127.0.0.1:44721/stalls/beats-under-the-table/stick |
| Don't dig under | http://127.0.0.1:44721/stalls/sunday-crate/dig |
| Don't unfold the pile | http://127.0.0.1:44721/stalls/the-hall-closet/stack |
| Nothing matches | http://127.0.0.1:44721/stalls/the-sink-drawer/match |
| Don't sit on the crate | http://127.0.0.1:44721/stalls/sunday-crate/seat |
| I don't fix | http://127.0.0.1:44721/stalls/half-working/fix |
| I don't burn a disc | http://127.0.0.1:44721/stalls/beats-under-the-table/burn |
| Still-here price sheet | http://127.0.0.1:44721/stalls/folding-table-tuesday/tape |
| Yard-sale hours sign | http://127.0.0.1:44721/stalls/folding-table-tuesday/sign |
| Paid stash | http://127.0.0.1:44721/stalls/folding-table-tuesday/stash |
| Closet free box | http://127.0.0.1:44721/stalls/the-hall-closet/free |
| Closet lost pile | http://127.0.0.1:44721/stalls/the-hall-closet/lost |
| Sunday Crate I buy that | http://127.0.0.1:44721/stalls/sunday-crate/buy |
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
| File-gone listing (no cart) | http://127.0.0.1:44721/listings/dl-stain-zine |

Physical PDPs (and stall pages that still have objects) show how you pick the thing up — hours and a place hung on the booth, not a warehouse. Digital listings stay file-focused. Copy lives in `@/lib/pickup-display` and reads existing stall ids. No new Listing / Stall field. A stallholder can tape this Saturday at `/sell/hours` (`iss:weekend-hours` / cookie `iss-weekend-hours`). `stallPickupNote` applies that overlay. The fixture table stays.

Physical listings can print a 3×5 driveway tag at `/listings/[id]/tag` — price, condition, booth, aisle. PDFs and the gift card have no tag. Files open in the folder after pay. Gift codes go to the desk. The tag does not show pickup hours.

Physical listings can tape a paper haggle at `/listings/[id]/offer`. Write dollars on the lamp — $8 on the $12 tag — and the stall desk can see that scrap. PDFs and the gift card have no offer. Taping a number does not change the tag or the tote.

Physical listings can tape firm paper at `/listings/[id]/firm`. That's the price. The seller will not move. Native `POST /listings/[id]/firm/tape` (form: `listingId`, `intent=firm|open`) writes `iss:firm-listing-ids` / cookie `iss-firm-listing-ids`. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The Closet windbreaker stays empty if you firmed the lamp. An offer is the other paper.

Physical listings can sit as a display piece at `/listings/[id]/look`. Native `POST /listings/look` (form: `listingId`, `intent=look|open`) writes `iss:look-listing-ids` / cookie `iss-look-listing-ids`. Shop lookups stamp `cartEligible: false` and leave `status` alone. Look drops that id from the tote. Sell-again restores Add to cart. Gift cards and PDFs are refused. Tuesday stays on `/lot`. Not a sold sticker. Not a pack-up.

Physical listings can tape an ask-first flag at `/listings/[id]/ask`. Native `POST /listings/ask` (form: `listingId`, `intent=ask|flip`) writes `iss:ask-listing-ids` / cookie `iss-ask-listing-ids`. Ask before you flip it. Still for sale. Not look. Not a hold. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The lamp stays empty if you asked the LP. Look cookie is not written.

Physical listings can tape weight paper at `/listings/[id]/heavy`. Native `POST /listings/heavy` (form: `listingId`, `intent=heavy|one`) writes `iss:heavy-listing-ids` / cookie `iss-heavy-listing-ids`. Needs two people. The lamp needs a friend. Still for sale. Not a hold. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The Closet windbreaker stays empty if you heavy the lamp. Pickup hours stay on the booth.

Physical listings can tape pocket honesty at `/listings/[id]/pockets`. Native `POST /listings/pockets` (form: `listingId`, `intent=empty|open`) writes `iss:pockets-listing-ids` / cookie `iss-pockets-listing-ids`. Pockets are empty. Walkers still dig the jacket. Still for sale. Not lost. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The lamp stays empty if you emptied the windbreaker. Lost sunglasses stay on `/stalls/[slug]/lost`.

Physical listings can tape which press at `/listings/[id]/press`. Native `POST /listings/press` (form: `listingId`, `note`, `intent=tape|clear`) writes `iss:listing-press` / cookie `iss-listing-press`. Which press. The $9 LP is not a first press. Still for sale. Not a scan mate. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The lamp stays empty if you taped the scratched LP. Scan cookie stays put.

Physical listings can tape parts honesty at `/listings/[id]/parts`. Native `POST /listings/parts` (form: `listingId`, `intent=parts|open`) writes `iss:parts-listing-ids` / cookie `iss-parts-listing-ids`. Sold for parts. It does not run. Still tote. Not a fourth status. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The Game Boy stays empty if you parted the cable drawer. As-is stays at the register.

Physical listings can tape battery honesty at `/listings/[id]/cells`. Native `POST /listings/cells` (form: `listingId`, `intent=cells|open`) writes `iss:cells-listing-ids` / cookie `iss-cells-listing-ids`. Batteries not included. Needs AAs. Still tote. Not a fourth status. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The lamp stays empty if you celled the Game Boy. Parts is it does not run.

Physical listings can tape smoke honesty at `/listings/[id]/smoke`. Native `POST /listings/smoke` (form: `listingId`, `intent=smoke|open`) writes `iss:smoke-listing-ids` / cookie `iss-smoke-listing-ids`. Smells like smoke. Pockets are empty is the jacket check. This is the smoke smell. Still tote. Not as-is. Not look. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The lamp stays empty if you smoked the windbreaker. Pockets stay on the jacket check.

Physical listings can tape a lying size tag at `/listings/[id]/size`. Native `POST /listings/size` (form: `listingId`, `intent=size|open`) writes `iss:size-listing-ids` / cookie `iss-size-listing-ids`. Tag says L. Press is which pressing. The Closet tag says L and it is not. Still tote. Not a Listing size field. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The lamp stays empty if you taped the windbreaker. Pockets stay on the jacket check.

Physical listings can tape a 3-quart fit at `/listings/[id]/fits`. Native `POST /listings/fits` (form: `listingId`, `intent=fits|open`) writes `iss:fits-listing-ids` / cookie `iss-fits-listing-ids`. Fits a 3-quart. The pot walked. The lid is still on the table. With needs two titles. This is one pot that fits a 3-quart. Still tote. Not a with pair. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The lamp stays empty if you taped the lid. With stays on two titles.

Physical listings can tape a play count at `/listings/[id]/plays`. Native `POST /listings/plays` (form: `listingId`, `intent=plays|open`) writes `iss:plays-listing-ids` / cookie `iss-plays-listing-ids`. I played it once. Press is which pressing. This is how many times it spun. Still tote. Not tested-kinda. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The lamp stays empty if you played the scratched LP. Press stays on the sleeve.

Physical listings can tape pair honesty at `/listings/[id]/laces`. Native `POST /listings/laces` (form: `listingId`, `note`, `intent=tape|clear`) writes `iss:listing-laces` / cookie `iss-listing-laces`. I kept the good laces. The sneakers are on the table. The nice pair stayed home. Still tote. Not van restock. Not with. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The lamp stays empty if you laced the Closet sneakers. Size stays the jacket tag.

Physical listings can tape an empty jewel case at `/listings/[id]/cases`. Native `POST /listings/cases` (form: `listingId`, `intent=cases|open`) writes `iss:cases-listing-ids` / cookie `iss-cases-listing-ids`. The discs walked. Jewel case on the table. Plays is how many times it spun. This is an empty case. Not wrap. Still tote. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The lamp stays empty if you taped the jewel-case CD-R. Plays stays the spin count.

Physical listings can tape a microwave warning at `/listings/[id]/heat`. Native `POST /listings/heat` (form: `listingId`, `intent=heat|open`) writes `iss:heat-listing-ids` / cookie `iss-heat-listing-ids`. Not for the microwave. Ceramic on the table. Gold rim. Don't nuke it. Not wrap. Not fits. Still tote. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The lamp stays empty if you taped the diner mug. Wrap stays newspaper. Fits stays the lid.

Physical listings can tape a splayed whisk at `/listings/[id]/bent`. Native `POST /listings/bent` (form: `listingId`, `intent=bent|open`) writes `iss:bent-listing-ids` / cookie `iss-bent-listing-ids`. Leave the balloon gone. Still beats eggs. Heat is the mug. Fits is the lid. This is the balloon whisk that stays bent. Leave the whisk splayed. Still tote. Not heat. Not a 3-quart lid. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The mug and lamp stay empty if you bent the whisk. Heat stays the microwave. Fits stays the lid.

Physical listings can tape a rewired cord at `/listings/[id]/cord`. Native `POST /listings/cord` (form: `listingId`, `intent=cord|open`) writes `iss:cord-listing-ids` / cookie `iss-cord-listing-ids`. Rewired. Not the factory cord. Still lights. Shell is the Game Boy blister. This is the wobbly lamp already rewired. Still tote. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The Game Boy and the cable drawer stay empty if you taped the lamp. Shell stays the blister.

Physical listings can tape laundry paper at `/listings/[id]/wash`. Native `POST /listings/wash` (form: `listingId`, `intent=wash|open`) writes `iss:wash-listing-ids` / cookie `iss-wash-listing-ids`. I washed it once. Still smells like a car. Smoke is the smell. Size is the tag. This is laundry paper on the windbreaker. The jacket went through a machine. Still tote. Not smoke. Not a size tag. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The sneakers and lamp stay empty if you washed the windbreaker. Smoke stays the smell. Size stays the tag.

Physical listings can tape a missing clicker at `/listings/[id]/remote`. Native `POST /listings/remote` (form: `listingId`, `intent=remote|open`) writes `iss:remote-listing-ids` / cookie `iss-remote-listing-ids`. The remote walked. Clicker is not in the box. Cells are out of the Game Boy. This is the living-room clicker that walked. Still tote. Not parts. Not van. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The lamp stays empty if you taped the Game Boy. Cells stay the AAs.

Physical listings can tape a skip at `/listings/[id]/skip`. Native `POST /listings/skip` (form: `listingId`, `intent=skip|open`) writes `iss:skip-listing-ids` / cookie `iss-skip-listing-ids`. The skip stays. That's the record. Press is which pressing. Plays is I spun the Sharpie disc. Walkers still want a clean Side A on the scratched LP. Still tote. Not a press. Not a play count. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The lamp stays empty if you taped the scratched LP. Press stays on the sleeve.

Digital files can tape as-shot honesty at `/listings/[id]/grade`. Native `POST /listings/grade` (form: `listingId`, `intent=grade|open`) writes `iss:grade-listing-ids` / cookie `iss-grade-listing-ids`. I don't grade your lot. Parking-lot LUTs stay as-shot. Stick is no email. Walkers still ask Beats for a custom grade. Still tote. Not stick. Not scan. Not the folder. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and lamps are refused. The lamp stays empty if you taped the LUT pack. Stick stays the zip note.

Digital files can tape a shot count at `/listings/[id]/stems`. Native `POST /listings/stems` (form: `listingId`, `intent=stems|open`) writes `iss:stems-listing-ids` / cookie `iss-stems-listing-ids`. These twelve shots. The pack is twelve shots, not a stem kit. Grade is I don't grade. Walkers still ask Beats for a stem kit. Still tote. Not grade. Not the folder. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and lamps are refused. The lamp stays empty if you taped the sample pack. Grade stays the as-shot note.

Physical listings can tape a whole-drawer note at `/listings/[id]/pile`. Native `POST /listings/pile` (form: `listingId`, `intent=pile|open`) writes `iss:pile-listing-ids` / cookie `iss-pile-listing-ids`. Won't split the pile. Take the drawer or leave it. Parts is it does not run. Walkers still pull one USB from the cable drawer. Still tote. Not parts. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The lamp stays empty if you taped the cable drawer. Parts stays it does not run.

Physical listings can tape a missing strap at `/listings/[id]/strap`. Native `POST /listings/strap` (form: `listingId`, `intent=strap|open`) writes `iss:strap-listing-ids` / cookie `iss-strap-listing-ids`. The strap walked. The strap is not in the box. Remote is the clicker. This is the camera/bag strap that walked. Still tote. Not van. Not lost. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The lamp stays empty if you taped the Closet windbreaker. Remote stays the living-room clicker.

Physical listings can tape a furniture ring at `/listings/[id]/ring`. Native `POST /listings/ring` (form: `listingId`, `intent=ring|open`) writes `iss:ring-listing-ids` / cookie `iss-ring-listing-ids`. The water ring stays. The table already has a ring. Heat is the mug. Wrap is newspaper. This is the furniture ring that stays. Still tote. Not as-is. Not heat. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The lamp stays empty if you taped the cable drawer. Heat stays the microwave. Wrap stays newspaper.

Physical listings can tape a missing stylus at `/listings/[id]/needle`. Native `POST /listings/needle` (form: `listingId`, `intent=needle|open`) writes `iss:needle-listing-ids` / cookie `iss-needle-listing-ids`. The needle walked. The stylus is not in the box. Skip is the LP scratch. This is the player that needs a needle. Still tote. Not parts. Not remote. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The lamp stays empty if you taped the Game Boy. Skip stays the chorus.

Physical listings can tape a missing booklet at `/listings/[id]/book`. Native `POST /listings/book` (form: `listingId`, `intent=book|open`) writes `iss:book-listing-ids` / cookie `iss-book-listing-ids`. The booklet walked. Liner notes are not in the jewel. Cases is the empty jewel. Scan is paper to a file. This is the booklet that walked. Still tote. Not cases. Not scan. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The lamp stays empty if you taped the jewel-case CD-R. Cases stays the empty jewel. Scan stays paper to a file.

Physical listings can tape cassette hiss at `/listings/[id]/hiss`. Native `POST /listings/hiss` (form: `listingId`, `intent=hiss|open`) writes `iss:hiss-listing-ids` / cookie `iss-hiss-listing-ids`. The hiss stays. That's the cassette. Skip is the LP scratch. Plays is I spun the Sharpie disc. This is the mixtape hiss. Still tote. Not skip. Not a play count. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The lamp stays empty if you taped the mixtape. Skip stays the chorus.

Physical listings can tape a peeled sole at `/listings/[id]/toe`. Native `POST /listings/toe` (form: `listingId`, `intent=toe|open`) writes `iss:toe-listing-ids` / cookie `iss-toe-listing-ids`. The peel stays. The sole already peeled. Laces is the pair that stayed home. This is the sneaker peel. Still tote. Not laces. Not `/offer/peel`. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The lamp stays empty if you taped the Closet sneakers. Laces stays the pair that stayed home.

Physical listings can tape a missing cabinet key at `/listings/[id]/key`. Native `POST /listings/key` (form: `listingId`, `intent=key|open`) writes `iss:key-listing-ids` / cookie `iss-key-listing-ids`. The key walked. The key is not in the box. Remote is the clicker. Strap is the bag strap. This is the cabinet key that walked. Still tote. Not remote. Not lost. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The lamp stays empty if you taped the jewel-case stack. Remote stays the living-room clicker. Strap stays the bag strap.

Physical listings can tape a cracked jewel hinge at `/listings/[id]/hinge`. Native `POST /listings/hinge` (form: `listingId`, `intent=hinge|open`) writes `iss:hinge-listing-ids` / cookie `iss-hinge-listing-ids`. The hinge stays gone. The jewel hinge already snapped. Cases is empty discs. Key is the cabinet key. This is the cracked hinge. Still tote. Not cases. Not book. Still baggable — `status`, `cartEligible`, and `price` stay put. Gift cards and PDFs are refused. The lamp stays empty if you taped the jewel-case stack. Cases stays the empty jewel. Key stays the cabinet key.

Physical listings can tape a van note at `/listings/[id]/van`. Native `POST /listings/van` (form: `listingId`, `intent=van|table`) writes `iss:van-listing-ids` / cookie `iss-van-listing-ids`. More out back. Ask. Still baggable — `status` and `cartEligible` stay put. Gift cards and PDFs are refused. Garage is home. Look is not for sale. Not a sold sticker.

Physical listings can walk off in someone's hands at `/listings/[id]/hands`. Native `POST /listings/hands` (form: `listingId`, `intent=hands|open`) writes `iss:hands-listing-ids` / cookie `iss-hands-listing-ids`. Shop lookups stamp `cartEligible: false` and leave `status` alone. Hands drops that id from the tote. Put-back restores Add to cart. Gift cards and PDFs are refused. Look stays on the table. Not a sold sticker. Not a van note.

Physical listings can walk with a mate at `/listings/[id]/with`. Native `POST /listings/with` (form: `listingId`, `mateId`, `intent=with|apart`) writes `iss:listing-with-pairs` / cookie `iss-listing-with-pairs`. Two titles on the same table — windbreaker with sneakers. Not a bundle SKU. Still two prices. `status`, `cartEligible`, and tote math stay put. Gift cards, PDFs, and a lamp on another stall are refused. Van is more of one pile.

A paper title can scan to a file at `/listings/[id]/scan`. Native `POST /listings/scan` (form: `listingId`, `mateId`, `intent=scan|apart`) writes `iss:listing-scan-pairs` / cookie `iss-listing-scan-pairs`. The mixtape already has liner notes — paper to that PDF. Not two LPs. That walk is with. Still two prices. `status`, `cartEligible`, and tote math stay put. Gift cards, two files, and a lamp on another stall are refused.

A stallholder can tape a sticky on the booth at `/stalls/[slug]/scrap`. “cash only after 2” stays after reload. Cookie `iss-stall-scraps` + `iss:stall-scraps`. Native `POST /stalls/[slug]/scrap/tape` (form: `note`) and peel. Not a hunt. Not an offer on a lamp. Not `/stalls/[slug]/tape`.

A stallholder can tape a lunch run at `/stalls/[slug]/back`. “Taco truck, back at 1.” stays after reload. Cookie `iss-back-soon` + `iss:back-soon`. Native `POST /stalls/back` (form: `stallId`, `note`, `intent=tape|clear`). Cap 140. Clear deletes that booth only. Not packed. Not new hours. The stall and `/lot` show the note. Closet stays empty if Tuesday taped.

A stallholder can tape a gravel note at `/stalls/[slug]/spot`. “Two spots toward the pavilion.” stays after reload. Cookie `iss-moved-spot` + `iss:moved-spot`. Native `POST /stalls/spot` (form: `stallId`, `note`, `intent=tape|clear`). Cap 140. Clear deletes that booth only. Same booth, new gravel. Not a seventh stall. Not new hours. Not rain. The stall and `/lot` show the note. Closet stays empty if Tuesday taped.

A stallholder can tape who is covering the table at `/stalls/[slug]/cover`. The Hall Closet on Folding Table Tuesday stays after reload. Cookie `iss-booth-cover` + `iss:booth-cover`. Native `POST /stalls/cover` (form: `stallId`, `sitterId`, `intent=tape|clear`). Sitter must be a real catalog `Stall.id`. A booth cannot sit itself. Clear deletes that booth only. Not lunch. Not a watch. The stall and `/lot` name the sitter. Closet stays empty if Tuesday taped.

A stallholder can tape a last-call note at `/stalls/[slug]/fold`. “Boxing at noon.” stays after reload. Cookie `iss-early-fold` + `iss:early-fold`. Native `POST /stalls/fold` (form: `stallId`, `note`, `intent=tape|clear`). Cap 140. Clear deletes that booth only. Not packed. Not new hours. The stall and `/lot` show the note. Closet stays empty if Tuesday taped. Lamp PDP hours stay the Saturday plan.

A stallholder can tape change in the jar at `/stalls/[slug]/break`. “ones and fives” stays after reload. Cookie `iss-break-bills` + `iss:break-bills`. Native `POST /stalls/break` (form: `stallId`, `note`, `intent=tape|clear`). Cap 140. Clear deletes that booth only. Tender is the slip. Change is paper on that table. The stall and `/lot` show the note. Closet stays empty if Tuesday taped.

A stallholder can tape a second name on the table at `/stalls/[slug]/share`. The Hall Closet on Folding Table Tuesday stays after reload. Cookie `iss-table-share` + `iss:table-share`. Native `POST /stalls/share` (form: `stallId`, `sharerId`, `intent=tape|clear`). Sharer must be a real catalog `Stall.id`. A booth cannot share itself. Clear deletes that booth only. Cover is a sitter. Share is two names on one table. Not a seventh stall. SKUs stay with their stall. The stall and `/lot` name the sharer. Closet share stays empty if Closet shared Tuesday.

A stallholder can tape furniture that stays at `/stalls/[slug]/stay`. “hangers stay” stays after reload. Cookie `iss-booth-stay` + `iss:booth-stay`. Native `POST /stalls/stay` (form: `stallId`, `note`, `intent=tape|clear`). Cap 140. Clear deletes that booth only. The rack is furniture. Not the free box. Free is extras you can take. The stall and `/lot` show the note. Sunday Crate stays empty if Closet taped.

A stallholder can tape a shade note at `/stalls/[slug]/shade`. “Records stay in the shade. Jackets crease in the sun.” stays after reload. Cookie `iss-booth-shade` + `iss:booth-shade`. Native `POST /stalls/shade` (form: `stallId`, `note`, `intent=tape|clear`). Cap 140. Clear deletes that booth only. The crate sits in the sun. Not a rain date. Not hangers stay. The stall and `/lot` show the note. Tuesday shade stays empty if Sunday Crate taped.

A stallholder can tape a no-photos note at `/stalls/[slug]/film`. “don’t photograph” stays after reload. Cookie `iss-booth-film` + `iss:booth-film`. Native `POST /stalls/film` (form: `stallId`, `note`, `intent=tape|clear`). Cap 140. Clear deletes that booth only. Walkers still film every 3×5. Not look. Not a flyer. The stall and `/lot` show the note. Closet film stays empty if Tuesday taped.

A stallholder can tape a little-hands note at `/stalls/[slug]/kids`. “kids touch it you buy it” stays after reload. Cookie `iss-booth-kids` + `iss:booth-kids`. Native `POST /stalls/kids` (form: `stallId`, `note`, `intent=tape|clear`). Cap 140. Clear deletes that booth only. If they pick it up, it walks. Film is no photos. Not look. Not a flyer. The stall and `/lot` show the note. Closet kids stays empty if Tuesday taped.

A stallholder can tape a poly note at `/stalls/[slug]/poly`. “keep the poly on” stays after reload. Cookie `iss-booth-poly` + `iss:booth-poly`. Native `POST /stalls/poly` (form: `stallId`, `note`, `intent=tape|clear`). Cap 140. Clear deletes that booth only. The crate stays sealed. Ask is one sleeve. The crate still gets pulled. Not ask-first. The stall and `/lot` show the note. Tuesday poly stays empty if Sunday Crate taped.

A stallholder can tape wrap paper at `/stalls/[slug]/wrap`. “mugs get newspaper” stays after reload. Cookie `iss-booth-wrap` + `iss:booth-wrap`. Native `POST /stalls/wrap` (form: `stallId`, `note`, `intent=tape|clear`). Cap 140. Clear deletes that booth only. The mug still walks naked. Not shipping. Not the yard sign. The stall and `/lot` show the note. Closet wrap stays empty if The Sink Drawer taped.

A stallholder can tape a factory-seal note at `/stalls/[slug]/shell`. “don't open the shell” stays after reload. Cookie `iss-booth-shell` + `iss:booth-shell`. Native `POST /stalls/shell` (form: `stallId`, `note`, `intent=tape|clear`). Cap 140. Clear deletes that booth only. Don't crack the blister. The boxed unit stays factory sealed. Still tote. Not wrap. Not poly. Not cases. The stall and `/lot` show the note. Lamp / folding-table shell stays empty if Half-Working taped.

A stallholder can tape a zip note at `/stalls/[slug]/stick`. “I don't email the zip. Pay and open the folder.” stays after reload. Cookie `iss-booth-stick` + `iss:booth-stick`. Native `POST /stalls/stick` (form: `stallId`, `note`, `intent=tape|clear`). Cap 140. Clear deletes that booth only. Pay and open the folder, or bring a stick. Not SMTP. Plays is the disc. Folder already delivers. The stall and `/lot` show the note. Tuesday stick stays empty if Beats taped.

A stallholder can tape a gravel note at `/stalls/[slug]/dig`. “Don't dig under. The zips are not in the gravel.” stays after reload. Cookie `iss-booth-dig` + `iss:booth-dig`. Native `POST /stalls/dig` (form: `stallId`, `note`, `intent=tape|clear`). Cap 140. Clear deletes that booth only. Ask what's on the table. Van is more out back. Lost is sunglasses. Walkers still crawl under Sunday Crate. The stall and `/lot` show the note. Tuesday dig stays empty if Sunday Crate taped.

A stallholder can tape a pile note at `/stalls/[slug]/stack`. “Don't unfold the pile. Ask what's on top.” stays after reload. Cookie `iss-booth-stack` + `iss:booth-stack`. Native `POST /stalls/stack` (form: `stallId`, `note`, `intent=tape|clear`). Cap 140. Clear deletes that booth only. Ask is the LP flip. Walkers still wreck Hall Closet for a Medium. The stall and `/lot` show the note. Tuesday stack stays empty if Closet taped.

A stallholder can tape a match note at `/stalls/[slug]/match`. “Nothing matches. The pot is not in this drawer.” stays after reload. Cookie `iss-booth-match` + `iss:booth-match`. Native `POST /stalls/match` (form: `stallId`, `note`, `intent=tape|clear`). Cap 140. Clear deletes that booth only. Ask what's on the table. Fits is the lid. Walkers still hunt The Sink Drawer for the matching pot. The stall and `/lot` show the note. Tuesday match stays empty if The Sink Drawer taped.

A stallholder can tape a sit note at `/stalls/[slug]/seat`. “Don't sit on the crate.” stays after reload. Cookie `iss-booth-seat` + `iss:booth-seat`. Native `POST /stalls/seat` (form: `stallId`, `note`, `intent=tape|clear`). Cap 140. Clear deletes that booth only. The crate is stock, not a chair. Stay is hangers. Kids is you-buy-it. Walkers still sit on Sunday Crate. The stall and `/lot` show the note. Tuesday seat stays empty if Sunday Crate taped.

A stallholder can tape a no-repair note at `/stalls/[slug]/fix`. “I don't fix” stays after reload. Cookie `iss-booth-fix` + `iss:booth-fix`. Native `POST /stalls/fix` (form: `stallId`, `note`, `intent=tape|clear`). Cap 140. Clear deletes that booth only. I sell it, I don't repair it. Walkers still ask Half-Working to fix the Game Boy. Parts is it doesn't run. Shell is don't crack the blister. Not parts. Not remote. The stall and `/lot` show the note. Tuesday fix stays empty if Half-Working taped.

A stallholder can tape a burn note at `/stalls/[slug]/burn`. “I don't burn a disc. Pay and open the folder.” stays after reload. Cookie `iss-booth-burn` + `iss:booth-burn`. Native `POST /stalls/burn` (form: `stallId`, `note`, `intent=tape|clear`). Cap 140. Clear deletes that booth only. I don't burn a CD-R. Stick is no email. Plays is this Sharpie copy. Folder already delivers. Walkers still ask Beats to burn a fresh disc. The stall and `/lot` show the note. Tuesday burn stays empty if Beats taped.

Add to cart POSTs to `/listings/bag` and writes `Listing.id` values to cookie `iss-cart-listing-ids` plus `localStorage` key `iss:cart-listing-ids` via `@/lib/cart`. Cart and checkout import that module — there is not a second bag. **Bag this table** on a stall POSTs to `/stalls/bag` and copies that booth’s still-here ids onto the same tote writer. Sold, packed, pulled, and gift-ineligible SKUs stay on the floor. The later pile is still a pile (`POST /saved/bag`).

A stall can print a still-here price sheet at `/stalls/[slug]/tape` — lamp and PDF prices on the paper, sold chair off the sheet. Not a driveway 3×5. Not a tote scoop. Not a booth scrap.

A stall can print a driveway hours sign at `/stalls/[slug]/sign` — stall name and fixture hours at the curb. Packed booths have no sign. Not the price tape. Not a paid flyer. Not a 3×5 on a lamp.

A stall can print a paid stash at `/stalls/[slug]/stash` — paid physicals that have not walked, with the slip id. Tape is still-here titles. Stash is don’t-bag paper. The PDF stays in the folder. Taken pairs drop off. Reads `iss:orders` + the checkout cookie + `iss-taken-handoffs`. Does not write sold, taken, or here.

A stall can tape cardboard free titles at `/stalls/[slug]/free`. “extra plastic hangers” stays after reload. Cookie `iss-free-box` + `iss:free-box`. Native `POST /stalls/free` (form: `slug`, `intent=tape|peel`, `title`, `titleId`). Cap 140 characters, 20 titles per booth. Not a $0 listing. Not tote math. Not `/stalls/[slug]/tape`.

A stall can tape left-behind titles at `/stalls/[slug]/lost`. “green sunglasses” stays after reload. Cookie `iss-booth-lost` + `iss:booth-lost`. Native `POST /stalls/lost` (form: `slug`, `intent=tape|peel`, `title`, `titleId`). Cap 140 characters, 20 titles per booth. Someone left sunglasses on the windbreaker pile. Not free. Not cork. Not tote math.

A stallholder can tape titles this booth also buys at `/stalls/[slug]/buy`. “scratched LPs” stays after reload. Cookie `iss-booth-buys` + `iss:booth-buys`. Native `POST /stalls/buy` (form: `slug`, `intent=tape|peel`, `title`, `titleId`). Cap 140 characters, 20 titles per booth. Wanted is walkers. Scrap is a lid question. The stallholder buys too.

Save for later POSTs to `/listings/later` and writes the same `Listing.id` shape to cookie `iss-saved-listing-ids` plus `localStorage` key `iss:saved-listing-ids` via `@/lib/saved`. Saving does not add to the tote. Adding to the tote does not drop the pile. **Bag the pile** POSTs to `/saved/bag` and copies still-here ids onto the existing tote writer (`@/lib/cart`). Sold, file-gone, and missing SKUs stay parked. The pile cookie stays.

## Cart and checkout

| Route | What it is |
| --- | --- |
| `/cart` | Tote. Same listing ids listing/stall pages wrote |
| `/cart/shake` | Shake sold, packed, pulled, and missing ids out of a fat tote. Native `POST /cart/shake`. The sold chair drops; the still-here lamp stays. Same `iss-cart-listing-ids` cookie. Not checkout. |
| `/checkout/mock` | Local test pay wall when no Stripe secret is set. Physical booths on the slip aside show driveway hours from `@/lib/pickup-display` before you pay. Files and the gift card do not. Physical totes can pay **cash on the table** or the same test card. Digital / gift stay on the card. |
| `/checkout/success` | Paid. Tote clears. Connect split on the slip. Digital lines get “Open your folder”. Physical lines get “Open the pickup slip” and join the sold overlay — the lamp leaves `avail=open`, the PDF stays for sale. A cash tote stamps “Cash on the table” on the receipt and pickup slip. |
| `/checkout/cancel` | Walked away. Tote stays |
| `/folder` | Current slip’s digital lines, or last week’s files still in `iss:orders`. Cold tab: “No folder on this slip.” |
| `/folder/[slip]` | One paid slip’s booth folder. Reads the checkout cookie, then `iss:orders` after that cookie dies. Stand-in downloads, not a CDN |
| `/pickup` | Current slip’s physical lines + booth hours, or “No pickup on this slip.” Physical lines can mark **I’m walking up** (`POST /pickup/here`). |
| `/pickup/[slip]` | One paid slip’s walk-up card. Hours from `@/lib/pickup-display`. Files stay in the folder. Cash totes say cash on the table, not card. Walking up stamps `iss:here-handoffs`. |
| `/pickup/here` | Cold / refused here flag. “Nobody is in the drive.” Files, gift codes, missing pairs, and already-taken lines land here. |
| `/sell/desk/queue` | Stallholder twin of pickup. Mixed tote lists the lamp and Tuesday driveway hours, not the PDF. Walking up wears “In the drive.” Taken lines drop off. |
| `/sell/taken` | Mark the lamp taken after they walk. Coming vs left-with-it. Queue hides that arrival. |
| `/sell/no-show` | Mark the lamp a no-show after the window. Sold sticker comes off. Queue hides that arrival. |
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
| `/stalls/[slug]/tape` | Still-here price sheet. Available objects and files. Sold and file-gone stay off. `noindex` |
| `/stalls/[slug]/sign` | Driveway hours sign. Stall name + fixture or taped weekend hours. Packed booths have no sign. `noindex` |
| `/stalls/[slug]/stash` | Paid-not-taken sheet. Physicals from paid slips. Taken pairs drop off. Files stay in the folder. `noindex` |
| `/about` | The mall story — flea-market mall, 10% cut, labeled ads, not a warehouse |
| `/help` | How this mall works — browse, tote, mock pay, folder slip, list a stall |
| `/lot` | Who set up. Booths on the lot vs in the car. Not this week's picks |
| `/this-week` | Weekend stall drop. Objects and files, not a paid stamp |
| `/collections`, `/collections/[slug]` | Racks, not aisles. Under a ten, files tonight, tested kinda |
| `/sell/desk` | Your table tonight — Folding Table Tuesday stallholder home |
| `/sell/desk/[stall]` | Same desk for that booth. Unknown slug packed up. |
| `/cart`, `/cart/shake`, `/checkout/*`, `/saved`, `/watched`, `/walk`, `/rain`, `/wanted`, `/listings/[id]/look`, `/listings/[id]/ask`, `/listings/[id]/van`, `/listings/[id]/firm`, `/listings/[id]/hands`, `/listings/[id]/with`, `/listings/[id]/heavy`, `/listings/[id]/pockets`, `/listings/[id]/press`, `/listings/[id]/parts`, `/listings/[id]/cells`, `/listings/[id]/smoke`, `/listings/[id]/size`, `/listings/[id]/fits`, `/listings/[id]/plays`, `/listings/[id]/laces`, `/listings/[id]/cases`, `/listings/[id]/heat`, `/listings/[id]/bent`, `/listings/[id]/cord`, `/listings/[id]/wash`, `/listings/[id]/remote`, `/listings/[id]/skip`, `/listings/[id]/grade`, `/listings/[id]/stems`, `/listings/[id]/pile`, `/listings/[id]/strap`, `/listings/[id]/ring`, `/listings/[id]/needle`, `/listings/[id]/book`, `/listings/[id]/hiss`, `/listings/[id]/toe`, `/listings/[id]/key`, `/listings/[id]/hinge`, `/stalls/[slug]/scrap`, `/stalls/[slug]/free`, `/stalls/[slug]/lost`, `/stalls/[slug]/buy`, `/stalls/[slug]/back`, `/stalls/[slug]/spot`, `/stalls/[slug]/cover`, `/stalls/[slug]/fold`, `/stalls/[slug]/break`, `/stalls/[slug]/share`, `/stalls/[slug]/stay`, `/stalls/[slug]/shade`, `/stalls/[slug]/film`, `/stalls/[slug]/kids`, `/stalls/[slug]/poly`, `/stalls/[slug]/wrap`, `/stalls/[slug]/shell`, `/stalls/[slug]/stick`, `/stalls/[slug]/dig`, `/stalls/[slug]/stack`, `/stalls/[slug]/match`, `/stalls/[slug]/seat`, `/stalls/[slug]/fix`, `/orders`, `/gift` | Real titles. `noindex` — not catalog URLs |
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
