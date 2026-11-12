# Launch checklist

Estimate for the shared room on Vercel Blob, then the list of what is still in the way of strangers playing. The numbers come from this branch’s code. They were not read off a Vercel usage chart.

## What one request does

The live room is one private blob, `row/state.json`. `the-row/api/row.mjs` reads it with `head` and then `get` (`useCache: false`), and writes it with one `put` when the book or the live room changed.

`the-row/js/live.mjs` polls `GET /live.json` every 800ms while the page is `?crowd=1`. One open tab is one poller.

`the-row/js/live-clock.mjs` sets a beat at 2400ms. `createBlobStore` advances due beats on the request and writes when that advance changes the room. With polls coming in steadily, that is one `put` per beat for the whole room, not one `put` per tab. Two polls that cross the same beat can both try the `put`. The loser reloads and usually does not write again. Those extra attempts are not in the table.

A page without `?crowd=1` runs the house in the browser and does not poll Blob.

## Arithmetic

```
polls per player per minute = 60 / 0.8 = 75
simple operations per poll   = 1 head + 1 get = 2
simple per minute            = players × 75 × 2 = players × 150

beats per minute             = 60 / 2.4 = 25
advanced per minute          = 25 puts, shared by the room

month                        = 30 × 24 × 60 = 43,200 minutes
```

Document size is the JSON this store writes (book of that many names, plus the live room), measured here, not downloaded from Blob:

| Players | Document |
| ---: | ---: |
| 2 | 1,330 bytes |
| 10 | 4,057 bytes |
| 40 | 13,433 bytes |

Transfer per minute is polls times that size. A month below is that concurrency held for all 43,200 minutes. That is a ceiling.

| Players | Simple / min | Advanced / min | Simple / month | Advanced / month | Transfer / month |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 2 | 300 | 25 | 12,960,000 | 1,080,000 | 8.62 GB |
| 10 | 1,500 | 25 | 64,800,000 | 1,080,000 | 131.45 GB |
| 40 | 6,000 | 25 | 259,200,000 | 1,080,000 | 1,740.92 GB |

Transfer, in bytes, before dividing by 1,000,000,000:

- 2 players: 150 polls × 1,330 × 43,200 = 8,618,400,000
- 10 players: 750 × 4,057 × 43,200 = 131,446,800,000
- 40 players: 3,000 × 13,433 × 43,200 = 1,740,916,800,000

A pile to five is five `/act` calls: 10 simple and 5 advanced, once. That is small next to the poll.

One crowd tab, nobody else: 150 simple operations a minute.

## Hobby limits

Source: [Vercel Blob pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing), page dated 23 September 2026.

| Limit | Hobby |
| --- | --- |
| Storage | 1 GB / month |
| Simple operations | first 10,000 |
| Advanced operations | first 2,000 |
| Blob data transfer | first 10 GB |
| Simple operation rate | 1,200 / min |
| Advanced operation rate | 900 / min |

Hobby does not bill past these. Blob access stops until 30 days have passed.

Against the ceiling above:

- Storage at 40 players is about 13 KB. That fits in 1 GB.
- Simple operations: 2 players reach 10,000 in 10,000 / 300 = 33 minutes. One tab reaches it in 10,000 / 150 = 67 minutes.
- Simple rate: 2 players (300/min) fit under 1,200/min. 10 players (1,500) and 40 players (6,000) do not.
- Advanced operations: the beat alone reaches 2,000 in 2,000 / 25 = 80 minutes, at every player count in this table.
- Advanced rate: 25/min is under 900/min.
- Transfer: 2 players for a full month is 8.62 GB, under 10 GB. 10 and 40 players are over. The room still dies on simple operations first.

## Unverified on this estimate

- No Blob call was made against Vercel. The operation counts are from the code plus the pricing page.
- The pricing page counts a download as a simple operation on a cache miss, and a metadata read as a simple operation. This code calls `head` and `get` with `useCache: false`. The table counts both, every time. A live bill might differ if `get` is cached anyway.
- Beat-boundary retries are not counted.
- CDN requests and Fast Origin Transfer are separate Hobby pools. They are not in the table.
- The dollar example on that page uses iad1. This checklist compares included amounts, not a region price.

## Still between today and strangers playing

In order.

1. **Jordan.** Publish this branch (the site root is The Row) or keep the mall. This file does not deploy it.
2. **Jordan.** Create the Blob store and set `BLOB_READ_WRITE_TOKEN` or `BLOB_STORE_ID`, and `ROW_CROWD=1`, on the project. Hobby Blob, as counted above, does not hold an evening of polling. The choice is a paid Blob plan, or a slower poll and fewer writes, before the room is public.
3. **Build, after that choice.** The 800ms poll reads the whole document, and every beat writes it. That is the bill. `row/accounts-split` only stops the beat from copying the book. It does not cut the two reads per poll.
4. **Jordan.** Public text on this branch is not screened. `row/moderation` does that screening. There is no host role, so nobody can hide a vibe that is already up. Jordan decides who, if anyone, gets that.
5. **Build.** After a win the house holds the seats until the winner runs it back or someone steps out. The playtest then has the waiter sit and the loser queue at the back. A stranger is not walked through those steps.
6. **Jordan.** F-01 stays as it is: an act needs a kept name. Changing that is Jordan’s call.
7. **Jordan.** The public hostname, and whether Web Analytics is turned on. The script-tag branch is `row/web-analytics`, cut from `main`, and Analytics is off.

## Blob free-tier fit

The sections above are the room before this branch, copied from `row/playtest-e2e`. They assume an 800ms poll and a Blob `put` on every 2400ms beat. This branch changes that. Limits re-checked at https://vercel.com/docs/vercel-blob/usage-and-pricing on 12 November 2026 (page dated 23 September 2026): 10,000 simple operations, 2,000 advanced operations, 10 GB transfer, 1 GB storage. Hobby stops Blob access when a limit is passed. It does not bill the overage.

### Normal play

Two people, one tab each, on `?crowd=1`, for **1 hour a day, 30 days** (30 hours, 1,800 minutes). They play **7 pile rounds an hour**. A round is **6 Blob writes**: five piles and one “run it back” or step-out. Other people may watch. Watchers share the cached `live.json` and do not add Blob reads.

Two hours a day of the same rounds does not fit. The writes alone would be 7 × 6 × 60 = 2,520 advanced operations, past 2,000, before any live read.

### What the code does now

- A beat is calculated for the response and is not stored. `the-row/js/blob-store.mjs` puts only when the document is created or the request changes the book or the room.
- `GET /live.json` is cached for 30 seconds (`the-row/js/live-read.mjs`, `s-maxage=30` in `the-row/vercel.json`). Tabs poll every 2 seconds. One shared cache serves every watcher.
- A successful post includes the room. The player who acted sees that result immediately. A cached poll with an older `beat` is ignored.
- The other player sees the move when the shared cache refreshes: at most about 30 seconds, plus up to 2 seconds for the next poll. About 32 seconds. This is a slow room. A reflex game does not fit the free tier.

### Before, two players, if the old rate ran the whole month

From the table above, continuous play:

```
300 simple/min × 43,200 min = 12,960,000 simple
25 advanced/min × 43,200 min = 1,080,000 advanced
```

That is the “before”. It does not fit.

### After, normal play, counted from this branch

Each live miss still does `head` and `get`: 2 simple operations, no `put`.
Each player write does `head`, `get`, and `put`: 2 simple and 1 advanced.
Misses per minute = 60 / 30 = 2. Both players share them.

```
writes     = 7 rounds × 6 writes × 30 hours = 1,260 advanced
simple     = writes × 2 + misses × 2
           = 1,260 × 2 + (1,800 × 2) × 2
           = 2,520 + 7,200
           = 9,720 simple
transfer   = (1,260 + 3,600) gets × 1,329 bytes
           = 6,458,940 bytes
           = 0.0065 GB
```

1,329 bytes is a 2-player document measured in this repo (book plus live room), not a download from Blob. A 10-player document built the same way is 3,465 bytes.

| | Simple | Advanced | Transfer | Storage |
| --- | ---: | ---: | ---: | ---: |
| Hobby | 10,000 | 2,000 | 10 GB | 1 GB |
| Before, continuous month | 12,960,000 | 1,080,000 | 8.62 GB | under 1 GB |
| After, 2 players, 1 hour/day | 9,720 | 1,260 | 0.0065 GB | 1,329 bytes |
| After, 10 watching, same 2 seats | 9,720 | 1,260 | under 0.02 GB | 3,465 bytes |

Two keeps a day add about 60 writes (120 simple, 60 advanced). The totals stay under the caps: about 9,840 simple and 1,320 advanced.

Ten players who each play those 7 rounds do not fit. Writes would be about 1,260 × 5 = 6,300 advanced operations.

The per-minute Hobby caps (1,200 simple, 900 advanced) are not the limit here. The month is.

No new store. The room stays in the one private Blob document.
