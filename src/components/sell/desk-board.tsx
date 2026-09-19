"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ListingTypeBadge } from "@/components/listing-type-badge";
import { MallNotice } from "@/components/mall-notice";
import { FileGoneButton } from "@/components/sell/file-gone-button";
import { PackButton } from "@/components/sell/pack-button";
import { SoldButton } from "@/components/sell/sold-button";
import { TestedKindaChip } from "@/components/sell/tested-kinda-chip";
import { TestedPin } from "@/components/sell/tested-pin";
import { WeekendPin } from "@/components/sell/weekend-pin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatMoney,
  isCartEligible,
  money,
  type Listing,
  type Stall,
} from "@/lib/commerce";
import {
  listingFact,
  listingFactLabel,
  listingHubName,
  listingStatusLabel,
} from "@/lib/listing-display";
import {
  canTapeCards,
  isListingCardsOverlay,
  readCardsListingIds,
  subscribeCards,
} from "@/lib/listing-cards";
import {
  canTapeDump,
  isListingDumpOverlay,
  readDumpListingIds,
  subscribeDump,
} from "@/lib/listing-dump";
import {
  canTapePhone,
  isListingPhoneOverlay,
  readPhoneListingIds,
  subscribePhone,
} from "@/lib/listing-phone";
import {
  canTapeRip,
  isListingRipOverlay,
  readRipListingIds,
  subscribeRip,
} from "@/lib/listing-rip";
import {
  canTapeShot,
  isListingShotOverlay,
  readShotListingIds,
  subscribeShot,
} from "@/lib/listing-shot";
import {
  canTapeZip,
  isListingZipOverlay,
  readZipListingIds,
  subscribeZip,
} from "@/lib/listing-zip";
import {
  canTapeWhose,
  isListingWhoseOverlay,
  readWhoseListingIds,
  subscribeWhose,
} from "@/lib/listing-whose";
import {
  canTapeTypeset,
  isListingTypesetOverlay,
  readTypesetListingIds,
  subscribeTypeset,
} from "@/lib/listing-typeset";
import {
  canTapeLoop,
  isListingLoopOverlay,
  readLoopListingIds,
  subscribeLoop,
} from "@/lib/listing-loop";
import {
  canTapeTwist,
  isListingTwistOverlay,
  readTwistListingIds,
  subscribeTwist,
} from "@/lib/listing-twist";
import {
  canTapeStretch,
  isListingStretchOverlay,
  readStretchListingIds,
  subscribeStretch,
} from "@/lib/listing-stretch";
import {
  canTapeRemember,
  isListingRememberOverlay,
  readRememberListingIds,
  subscribeRemember,
} from "@/lib/listing-remember";
import {
  canTapeGlue,
  isListingGlueOverlay,
  readGlueListingIds,
  subscribeGlue,
} from "@/lib/listing-glue";
import {
  listingCardsWritePath,
  listingDumpWritePath,
  listingGlueWritePath,
  listingLoopWritePath,
  listingStretchWritePath,
  listingPhoneWritePath,
  listingRememberWritePath,
  listingRipWritePath,
  listingShotWritePath,
  listingTypesetWritePath,
  listingTwistWritePath,
  listingZipWritePath,
  listingWhoseWritePath,
  listingPath,
  sellDeskStallPath,
  sellHoursPath,
  sellListingEditPath,
  sellNewPath,
  stallScrapPath,
} from "@/lib/paths";
import {
  isOverlayListing,
  mergeDeskListingsForStall,
} from "@/lib/seller-desk";
import {
  SELLER_LISTINGS_CHANGED,
  readSellerListings,
} from "@/lib/seller-overlay";
import {
  FILE_GONE_CHANGED_EVENT,
  canStampFileGone,
  stampFileGoneListings,
} from "@/lib/file-gone-overlay";
import {
  PACKED_CHANGED_EVENT,
  isStallPacked,
  stampPackedListings,
} from "@/lib/packed-stall";
import {
  SOLD_CHANGED_EVENT,
  canStampSold,
  stampSoldListings,
} from "@/lib/sold-overlay";
import {
  TESTED_KINDA_CHANGED_EVENT,
  canPinTestedKinda,
  isTestedKindaPinned,
} from "@/lib/tested-kinda-pin";
import {
  WEEKEND_PIN_MIRROR_SCRIPT,
  WEEKEND_PINS_CHANGED_EVENT,
  canPinWeekend,
  readWeekendPinIds,
} from "@/lib/weekend-table-pin";
import { feePercent, splitOnTag } from "@/lib/seller-payouts";
import {
  SELLER_STALLS_CHANGED,
  stallCardById,
} from "@/lib/stall-overlay";

export function DeskBoard({
  stall,
  listings,
  weekendPins: weekendPinSeed = [],
}: {
  stall: Stall;
  listings: Listing[];
  weekendPins?: string[];
}) {
  const [rows, setRows] = useState(listings);
  const [packed, setPacked] = useState(false);
  const [weekendPins, setWeekendPins] = useState(weekendPinSeed);
  const [dumpIds, setDumpIds] = useState<string[]>([]);
  const [phoneIds, setPhoneIds] = useState<string[]>([]);
  const [ripIds, setRipIds] = useState<string[]>([]);
  const [cardsIds, setCardsIds] = useState<string[]>([]);
  const [zipIds, setZipIds] = useState<string[]>([]);
  const [shotIds, setShotIds] = useState<string[]>([]);
  const [whoseIds, setWhoseIds] = useState<string[]>([]);
  const [typesetIds, setTypesetIds] = useState<string[]>([]);
  const [loopIds, setLoopIds] = useState<string[]>([]);
  const [twistIds, setTwistIds] = useState<string[]>([]);
  const [stretchIds, setStretchIds] = useState<string[]>([]);
  const [rememberIds, setRememberIds] = useState<string[]>([]);
  const [glueIds, setGlueIds] = useState<string[]>([]);
  const [card, setCard] = useState({
    boothName: stall.boothName,
    blurb: stall.blurb,
  });

  useEffect(() => {
    function apply() {
      setRows(
        stampPackedListings(
          stampFileGoneListings(
            stampSoldListings(
              mergeDeskListingsForStall(stall.id, listings, readSellerListings()),
            ),
          ),
        ),
      );
      setPacked(isStallPacked(stall.id));
      setWeekendPins(readWeekendPinIds());
      setDumpIds(readDumpListingIds());
      setPhoneIds(readPhoneListingIds());
      setRipIds(readRipListingIds());
      setCardsIds(readCardsListingIds());
      setZipIds(readZipListingIds());
      setShotIds(readShotListingIds());
      setWhoseIds(readWhoseListingIds());
      setTypesetIds(readTypesetListingIds());
      setLoopIds(readLoopListingIds());
      setTwistIds(readTwistListingIds());
      setStretchIds(readStretchListingIds());
      setRememberIds(readRememberListingIds());
      setGlueIds(readGlueListingIds());
      const patch = stallCardById(stall.id);
      if (patch) {
        setCard({ boothName: patch.boothName, blurb: patch.blurb });
      }
    }

    apply();
    const unsubDump = subscribeDump(apply);
    const unsubPhone = subscribePhone(apply);
    const unsubRip = subscribeRip(apply);
    const unsubCards = subscribeCards(apply);
    const unsubZip = subscribeZip(apply);
    const unsubShot = subscribeShot(apply);
    const unsubWhose = subscribeWhose(apply);
    const unsubTypeset = subscribeTypeset(apply);
    const unsubLoop = subscribeLoop(apply);
    const unsubTwist = subscribeTwist(apply);
    const unsubStretch = subscribeStretch(apply);
    const unsubRemember = subscribeRemember(apply);
    const unsubGlue = subscribeGlue(apply);
    window.addEventListener(SELLER_LISTINGS_CHANGED, apply);
    window.addEventListener(SELLER_STALLS_CHANGED, apply);
    window.addEventListener(SOLD_CHANGED_EVENT, apply);
    window.addEventListener(FILE_GONE_CHANGED_EVENT, apply);
    window.addEventListener(PACKED_CHANGED_EVENT, apply);
    window.addEventListener(TESTED_KINDA_CHANGED_EVENT, apply);
    window.addEventListener(WEEKEND_PINS_CHANGED_EVENT, apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener(SELLER_LISTINGS_CHANGED, apply);
      window.removeEventListener(SELLER_STALLS_CHANGED, apply);
      window.removeEventListener(SOLD_CHANGED_EVENT, apply);
      window.removeEventListener(FILE_GONE_CHANGED_EVENT, apply);
      window.removeEventListener(PACKED_CHANGED_EVENT, apply);
      window.removeEventListener(TESTED_KINDA_CHANGED_EVENT, apply);
      window.removeEventListener(WEEKEND_PINS_CHANGED_EVENT, apply);
      window.removeEventListener("storage", apply);
      unsubDump();
      unsubPhone();
      unsubRip();
      unsubCards();
      unsubZip();
      unsubShot();
      unsubWhose();
      unsubTypeset();
      unsubLoop();
      unsubTwist();
      unsubStretch();
      unsubRemember();
      unsubGlue();
    };
  }, [listings, stall.id]);

  const paper = useMemo(() => {
    const eligible = rows.filter(isCartEligible);
    const tagCents = eligible.reduce(
      (sum, listing) => sum + listing.price.amountCents,
      0,
    );
    return {
      count: eligible.length,
      ...splitOnTag(money(tagCents)),
    };
  }, [rows]);

  return (
    <div className="space-y-10">
      <script dangerouslySetInnerHTML={{ __html: WEEKEND_PIN_MIRROR_SCRIPT }} />
      <div className="max-w-2xl space-y-3">
        <p className="font-heading text-2xl tracking-tight sm:text-3xl">
          {card.boothName}
        </p>
        <p className="text-sm leading-6 text-muted-foreground">{card.blurb}</p>
        <p className="text-sm leading-6 text-muted-foreground">
          The table went in the car. Not a refund. Not a sold sticker.
        </p>
        <PackButton
          stallId={stall.id}
          intent={packed ? "open" : "pack"}
          returnTo={sellDeskStallPath(stall.slug)}
        />
        <Link
          href={sellHoursPath(stall.slug)}
          className="inline-flex h-11 w-full items-center justify-center text-sm font-medium text-foreground underline-offset-4 hover:underline sm:w-auto"
        >
          Tape this weekend’s hours
        </Link>
        <Link
          href={stallScrapPath(stall.slug)}
          className="inline-flex h-11 w-full items-center justify-center text-sm font-medium text-foreground underline-offset-4 hover:underline sm:w-auto"
        >
          Tape a scrap on this table
        </Link>
      </div>

      {rows.length === 0 ? (
        <MallNotice
          tone="empty"
          padded={false}
          titleAs="h2"
          eyebrow="Empty table"
          title="Nothing on this table tonight."
          body={`The fixtures are gone and you have not listed anything on this booth. Put a thing or a file on ${stall.boothName} and it shows up here.`}
          actions={
            <Button
              className="rounded-full px-5"
              render={<Link href={sellNewPath()} />}
            >
              List something
            </Button>
          }
        />
      ) : (
        <div>
        <p className="mb-3 text-sm leading-6 text-muted-foreground">
          Sold sticker is on the table. File pulled from the folder. Putting
          back is restock, not a refund. We turned it on. Not a mall pick. Not
          paid. Taped this weekend. Not a mall pick. Not paid.
        </p>
        <ul className="grid gap-3">
          {rows.map((listing) => {
            const overlay = isOverlayListing(listing);
            const gone = listing.status !== "available";
            const stamp = canStampSold(listing);
            const pull = canStampFileGone(listing);
            const kinda = canPinTestedKinda(listing);
            const pinned = isTestedKindaPinned(listing.id);

            return (
              <li key={listing.id}>
                <Card className="bg-card">
                  <CardHeader className="sm:grid-cols-[1fr_auto]">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <ListingTypeBadge listing={listing} />
                        <Badge variant={gone ? "destructive" : "ghost"}>
                          {listingStatusLabel(listing)}
                        </Badge>
                        {overlay ? (
                          <Badge variant="outline">Listed tonight</Badge>
                        ) : null}
                        {pinned ? <TestedKindaChip listingId={listing.id} /> : null}
                      </div>
                      <CardTitle className="font-heading text-xl tracking-tight">
                        <Link
                          href={listingPath(listing.id)}
                          className="underline-offset-4 hover:underline"
                        >
                          {listing.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-sm leading-6">
                        {listing.summary}
                      </CardDescription>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {listingFactLabel(listing)}:
                        </span>{" "}
                        {listingFact(listing)}
                        <span className="mx-2 text-foreground/30">·</span>
                        {listingHubName(listing)}
                      </p>
                      {overlay ? (
                        <Button
                          variant="outline"
                          className="h-11 w-full rounded-full px-5 sm:w-auto"
                          render={
                            <Link href={sellListingEditPath(listing.id)} />
                          }
                        >
                          Retape
                        </Button>
                      ) : null}
                      {stamp ? (
                        <SoldButton
                          listingId={listing.id}
                          intent={listing.status === "available" ? "sold" : "open"}
                          returnTo={sellDeskStallPath(stall.slug)}
                        />
                      ) : null}
                      {pull ? (
                        <FileGoneButton
                          listingId={listing.id}
                          intent={listing.status === "available" ? "gone" : "open"}
                          returnTo={sellDeskStallPath(stall.slug)}
                        />
                      ) : null}
                      {kinda ? (
                        <TestedPin
                          listingId={listing.id}
                          intent={pinned ? "drop" : "pin"}
                          returnTo={sellDeskStallPath(stall.slug)}
                        />
                      ) : null}
                      {canPinWeekend(listing) ? (
                        <WeekendPin
                          listingId={listing.id}
                          intent={
                            weekendPins.includes(listing.id) ? "drop" : "pin"
                          }
                          returnTo={sellDeskStallPath(stall.slug)}
                        />
                      ) : null}
                      {canTapeDump(listing) ? (
                        <form
                          method="post"
                          action={listingDumpWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingDumpOverlay(listing.id, dumpIds)
                                ? "open"
                                : "dump"
                            }
                          />
                          <input
                            type="hidden"
                            name="returnTo"
                            value={sellDeskStallPath(stall.slug)}
                          />
                          <button
                            type="submit"
                            className="inline-flex h-11 w-full items-center justify-center text-sm font-medium text-foreground underline-offset-4 hover:underline sm:w-auto"
                          >
                            {isListingDumpOverlay(listing.id, dumpIds)
                              ? "Leave the cart"
                              : "I don't dump"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeGlue(listing) ? (
                        <form
                          method="post"
                          action={listingGlueWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingGlueOverlay(listing.id, glueIds)
                                ? "open"
                                : "glue"
                            }
                          />
                          <input
                            type="hidden"
                            name="returnTo"
                            value={sellDeskStallPath(stall.slug)}
                          />
                          <button
                            type="submit"
                            className="inline-flex h-11 w-full items-center justify-center text-sm font-medium text-foreground underline-offset-4 hover:underline sm:w-auto"
                          >
                            {isListingGlueOverlay(listing.id, glueIds)
                              ? "Leave the crack"
                              : "I will not glue"}
                          </button>
                        </form>
                      ) : null}
                      {canTapePhone(listing) ? (
                        <form
                          method="post"
                          action={listingPhoneWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingPhoneOverlay(listing.id, phoneIds)
                                ? "open"
                                : "phone"
                            }
                          />
                          <input
                            type="hidden"
                            name="returnTo"
                            value={sellDeskStallPath(stall.slug)}
                          />
                          <button
                            type="submit"
                            className="inline-flex h-11 w-full items-center justify-center text-sm font-medium text-foreground underline-offset-4 hover:underline sm:w-auto"
                          >
                            {isListingPhoneOverlay(listing.id, phoneIds)
                              ? "Leave the tangle"
                              : "I don't know the phone"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeRip(listing) ? (
                        <form
                          method="post"
                          action={listingRipWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingRipOverlay(listing.id, ripIds)
                                ? "open"
                                : "rip"
                            }
                          />
                          <input
                            type="hidden"
                            name="returnTo"
                            value={sellDeskStallPath(stall.slug)}
                          />
                          <button
                            type="submit"
                            className="inline-flex h-11 w-full items-center justify-center text-sm font-medium text-foreground underline-offset-4 hover:underline sm:w-auto"
                          >
                            {isListingRipOverlay(listing.id, ripIds)
                              ? "Leave the tape"
                              : "I don't rip"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeCards(listing) ? (
                        <form
                          method="post"
                          action={listingCardsWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingCardsOverlay(listing.id, cardsIds)
                                ? "open"
                                : "cards"
                            }
                          />
                          <input
                            type="hidden"
                            name="returnTo"
                            value={sellDeskStallPath(stall.slug)}
                          />
                          <button
                            type="submit"
                            className="inline-flex h-11 w-full items-center justify-center text-sm font-medium text-foreground underline-offset-4 hover:underline sm:w-auto"
                          >
                            {isListingCardsOverlay(listing.id, cardsIds)
                              ? "Leave the scans"
                              : "I will not type them"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeZip(listing) ? (
                        <form
                          method="post"
                          action={listingZipWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingZipOverlay(listing.id, zipIds)
                                ? "open"
                                : "zip"
                            }
                          />
                          <input
                            type="hidden"
                            name="returnTo"
                            value={sellDeskStallPath(stall.slug)}
                          />
                          <button
                            type="submit"
                            className="inline-flex h-11 w-full items-center justify-center text-sm font-medium text-foreground underline-offset-4 hover:underline sm:w-auto"
                          >
                            {isListingZipOverlay(listing.id, zipIds)
                              ? "Leave the disc"
                              : "I don't have the zip"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeShot(listing) ? (
                        <form
                          method="post"
                          action={listingShotWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingShotOverlay(listing.id, shotIds)
                                ? "open"
                                : "shot"
                            }
                          />
                          <input
                            type="hidden"
                            name="returnTo"
                            value={sellDeskStallPath(stall.slug)}
                          />
                          <button
                            type="submit"
                            className="inline-flex h-11 w-full items-center justify-center text-sm font-medium text-foreground underline-offset-4 hover:underline sm:w-auto"
                          >
                            {isListingShotOverlay(listing.id, shotIds)
                              ? "Leave the looks"
                              : "I don't shoot"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeWhose(listing) ? (
                        <form
                          method="post"
                          action={listingWhoseWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingWhoseOverlay(listing.id, whoseIds)
                                ? "open"
                                : "whose"
                            }
                          />
                          <input
                            type="hidden"
                            name="returnTo"
                            value={sellDeskStallPath(stall.slug)}
                          />
                          <button
                            type="submit"
                            className="inline-flex h-11 w-full items-center justify-center text-sm font-medium text-foreground underline-offset-4 hover:underline sm:w-auto"
                          >
                            {isListingWhoseOverlay(listing.id, whoseIds)
                              ? "Leave the mug"
                              : "I will not say whose"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeTwist(listing) ? (
                        <form
                          method="post"
                          action={listingTwistWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingTwistOverlay(listing.id, twistIds)
                                ? "open"
                                : "twist"
                            }
                          />
                          <input
                            type="hidden"
                            name="returnTo"
                            value={sellDeskStallPath(stall.slug)}
                          />
                          <button
                            type="submit"
                            className="inline-flex h-11 w-full items-center justify-center text-sm font-medium text-foreground underline-offset-4 hover:underline sm:w-auto"
                          >
                            {isListingTwistOverlay(listing.id, twistIds)
                              ? "Leave the switch"
                              : "Twist the neck"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeTypeset(listing) ? (
                        <form
                          method="post"
                          action={listingTypesetWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingTypesetOverlay(listing.id, typesetIds)
                                ? "open"
                                : "typeset"
                            }
                          />
                          <input
                            type="hidden"
                            name="returnTo"
                            value={sellDeskStallPath(stall.slug)}
                          />
                          <button
                            type="submit"
                            className="inline-flex h-11 w-full items-center justify-center text-sm font-medium text-foreground underline-offset-4 hover:underline sm:w-auto"
                          >
                            {isListingTypesetOverlay(listing.id, typesetIds)
                              ? "Leave the page"
                              : "I will not typeset"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeLoop(listing) ? (
                        <form
                          method="post"
                          action={listingLoopWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingLoopOverlay(listing.id, loopIds)
                                ? "open"
                                : "loop"
                            }
                          />
                          <input
                            type="hidden"
                            name="returnTo"
                            value={sellDeskStallPath(stall.slug)}
                          />
                          <button
                            type="submit"
                            className="inline-flex h-11 w-full items-center justify-center text-sm font-medium text-foreground underline-offset-4 hover:underline sm:w-auto"
                          >
                            {isListingLoopOverlay(listing.id, loopIds)
                              ? "Leave the loop"
                              : "I will not slice the loop"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeStretch(listing) ? (
                        <form
                          method="post"
                          action={listingStretchWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingStretchOverlay(listing.id, stretchIds)
                                ? "open"
                                : "stretch"
                            }
                          />
                          <input
                            type="hidden"
                            name="returnTo"
                            value={sellDeskStallPath(stall.slug)}
                          />
                          <button
                            type="submit"
                            className="inline-flex h-11 w-full items-center justify-center text-sm font-medium text-foreground underline-offset-4 hover:underline sm:w-auto"
                          >
                            {isListingStretchOverlay(listing.id, stretchIds)
                              ? "Leave the pair"
                              : "I will not stretch"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeRemember(listing) ? (
                        <form
                          method="post"
                          action={listingRememberWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingRememberOverlay(listing.id, rememberIds)
                                ? "open"
                                : "remember"
                            }
                          />
                          <input
                            type="hidden"
                            name="returnTo"
                            value={sellDeskStallPath(stall.slug)}
                          />
                          <button
                            type="submit"
                            className="inline-flex h-11 w-full items-center justify-center text-sm font-medium text-foreground underline-offset-4 hover:underline sm:w-auto"
                          >
                            {isListingRememberOverlay(listing.id, rememberIds)
                              ? "Leave the page"
                              : "I will not remember better"}
                          </button>
                        </form>
                      ) : null}
                    </div>
                    <p
                      className={
                        gone
                          ? "font-heading text-2xl text-muted-foreground line-through"
                          : "font-heading text-2xl tracking-tight"
                      }
                    >
                      {formatMoney(listing.price)}
                    </p>
                  </CardHeader>
                </Card>
              </li>
            );
          })}
        </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card">
          <CardHeader>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              If it sold tonight
            </p>
            <CardTitle className="font-heading text-3xl">
              {formatMoney(paper.tag)}
            </CardTitle>
            <CardDescription className="text-base leading-6">
              {paper.count === 0
                ? "Nothing still for sale on this table."
                : `${paper.count} ${paper.count === 1 ? "thing" : "things"} still on the table.`}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-card">
          <CardHeader>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Mall keeps
            </p>
            <CardTitle className="font-heading text-3xl">
              {formatMoney(paper.mallCut)}
            </CardTitle>
            <CardDescription className="text-base leading-6">
              {feePercent}% from the stall, not on top of the buyer.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-card">
          <CardHeader>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Stall is owed
            </p>
            <CardTitle className="font-heading text-3xl">
              {formatMoney(paper.stallOwed)}
            </CardTitle>
            <CardDescription className="text-base leading-6">
              Paper only. No Connect, no bank.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
