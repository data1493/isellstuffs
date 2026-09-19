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
  canTapeWarm,
  isListingWarmOverlay,
  readWarmListingIds,
  subscribeWarm,
} from "@/lib/listing-warm";
import {
  canTapeBalance,
  isListingBalanceOverlay,
  readBalanceListingIds,
  subscribeBalance,
} from "@/lib/listing-balance";
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
  canTapeRevise,
  isListingReviseOverlay,
  readReviseListingIds,
  subscribeRevise,
} from "@/lib/listing-revise";
import {
  canTapeGrid,
  isListingGridOverlay,
  readGridListingIds,
  subscribeGrid,
} from "@/lib/listing-grid";
import {
  canTapeExpire,
  isListingExpireOverlay,
  readExpireListingIds,
  subscribeExpire,
} from "@/lib/listing-expire";
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
  canTapeSlant,
  isListingSlantOverlay,
  readSlantListingIds,
  subscribeSlant,
} from "@/lib/listing-slant";
import {
  canTapeVg,
  isListingVgOverlay,
  readVgListingIds,
  subscribeVg,
} from "@/lib/listing-vg";
import {
  canTapeBake,
  isListingBakeOverlay,
  readBakeListingIds,
  subscribeBake,
} from "@/lib/listing-bake";
import {
  canTapeGlass,
  isListingGlassOverlay,
  readGlassListingIds,
  subscribeGlass,
} from "@/lib/listing-glass";
import {
  canTapeDouble,
  isListingDoubleOverlay,
  readDoubleListingIds,
  subscribeDouble,
} from "@/lib/listing-double";
import {
  canTapeMins,
  isListingMinsOverlay,
  readMinsListingIds,
  subscribeMins,
} from "@/lib/listing-mins";
import {
  canTapePolish,
  isListingPolishOverlay,
  readPolishListingIds,
  subscribePolish,
} from "@/lib/listing-polish";
import {
  canTapeTray,
  isListingTrayOverlay,
  readTrayListingIds,
  subscribeTray,
} from "@/lib/listing-tray";
import {
  canTapeInside,
  isListingInsideOverlay,
  readInsideListingIds,
  subscribeInside,
} from "@/lib/listing-inside";
import {
  canTapeTines,
  isListingTinesOverlay,
  readTinesListingIds,
  subscribeTines,
} from "@/lib/listing-tines";
import {
  canTapeRust,
  isListingRustOverlay,
  readRustListingIds,
  subscribeRust,
} from "@/lib/listing-rust";
import {
  canTapeCap,
  isListingCapOverlay,
  readCapListingIds,
  subscribeCap,
} from "@/lib/listing-cap";
import {
  canTapeSaucer,
  isListingSaucerOverlay,
  readSaucerListingIds,
  subscribeSaucer,
} from "@/lib/listing-saucer";
import {
  canTapeLed,
  isListingLedOverlay,
  readLedListingIds,
  subscribeLed,
} from "@/lib/listing-led";
import {
  canTapeCast,
  isListingCastOverlay,
  readCastListingIds,
  subscribeCast,
} from "@/lib/listing-cast";
import {
  canTapeSpray,
  isListingSprayOverlay,
  readSprayListingIds,
  subscribeSpray,
} from "@/lib/listing-spray";
import {
  canTapeDongle,
  isListingDongleOverlay,
  readDongleListingIds,
  subscribeDongle,
} from "@/lib/listing-dongle";
import {
  canTapeEven,
  isListingEvenOverlay,
  readEvenListingIds,
  subscribeEven,
} from "@/lib/listing-even";
import {
  canTapeLink,
  isListingLinkOverlay,
  readLinkListingIds,
  subscribeLink,
} from "@/lib/listing-link";
import {
  canTapeCenter,
  isListingCenterOverlay,
  readCenterListingIds,
  subscribeCenter,
} from "@/lib/listing-center";
import {
  canTapeSplice,
  isListingSpliceOverlay,
  readSpliceListingIds,
  subscribeSplice,
} from "@/lib/listing-splice";
import {
  canTapeVent,
  isListingVentOverlay,
  readVentListingIds,
  subscribeVent,
} from "@/lib/listing-vent";
import {
  canTapeTune,
  isListingTuneOverlay,
  readTuneListingIds,
  subscribeTune,
} from "@/lib/listing-tune";
import {
  canTapeVerso,
  isListingVersoOverlay,
  readVersoListingIds,
  subscribeVerso,
} from "@/lib/listing-verso";
import {
  canTapeIcons,
  isListingIconsOverlay,
  readIconsListingIds,
  subscribeIcons,
} from "@/lib/listing-icons";
import {
  canTapeGum,
  isListingGumOverlay,
  readGumListingIds,
  subscribeGum,
} from "@/lib/listing-gum";
import {
  listingCardsWritePath,
  listingDoubleWritePath,
  listingMinsWritePath,
  listingDumpWritePath,
  listingGlueWritePath,
  listingGlassWritePath,
  listingPolishWritePath,
  listingTrayWritePath,
  listingGumWritePath,
  listingInsideWritePath,
  listingTinesWritePath,
  listingRustWritePath,
  listingCapWritePath,
  listingSaucerWritePath,
  listingLedWritePath,
  listingCastWritePath,
  listingSprayWritePath,
  listingDongleWritePath,
  listingEvenWritePath,
  listingLinkWritePath,
  listingCenterWritePath,
  listingSpliceWritePath,
  listingVentWritePath,
  listingLoopWritePath,
  listingTuneWritePath,
  listingVersoWritePath,
  listingIconsWritePath,
  listingSlantWritePath,
  listingStretchWritePath,
  listingPhoneWritePath,
  listingRememberWritePath,
  listingRipWritePath,
  listingVgWritePath,
  listingBakeWritePath,
  listingShotWritePath,
  listingWarmWritePath,
  listingBalanceWritePath,
  listingTypesetWritePath,
  listingReviseWritePath,
  listingGridWritePath,
  listingExpireWritePath,
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
  const [warmIds, setWarmIds] = useState<string[]>([]);
  const [balanceIds, setBalanceIds] = useState<string[]>([]);
  const [whoseIds, setWhoseIds] = useState<string[]>([]);
  const [typesetIds, setTypesetIds] = useState<string[]>([]);
  const [reviseIds, setReviseIds] = useState<string[]>([]);
  const [gridIds, setGridIds] = useState<string[]>([]);
  const [loopIds, setLoopIds] = useState<string[]>([]);
  const [twistIds, setTwistIds] = useState<string[]>([]);
  const [stretchIds, setStretchIds] = useState<string[]>([]);
  const [rememberIds, setRememberIds] = useState<string[]>([]);
  const [glueIds, setGlueIds] = useState<string[]>([]);
  const [slantIds, setSlantIds] = useState<string[]>([]);
  const [vgIds, setVgIds] = useState<string[]>([]);
  const [bakeIds, setBakeIds] = useState<string[]>([]);
  const [glassIds, setGlassIds] = useState<string[]>([]);
  const [doubleIds, setDoubleIds] = useState<string[]>([]);
  const [minsIds, setMinsIds] = useState<string[]>([]);
  const [expireIds, setExpireIds] = useState<string[]>([]);
  const [polishIds, setPolishIds] = useState<string[]>([]);
  const [trayIds, setTrayIds] = useState<string[]>([]);
  const [gumIds, setGumIds] = useState<string[]>([]);
  const [insideIds, setInsideIds] = useState<string[]>([]);
  const [tinesIds, setTinesIds] = useState<string[]>([]);
  const [rustIds, setRustIds] = useState<string[]>([]);
  const [capIds, setCapIds] = useState<string[]>([]);
  const [saucerIds, setSaucerIds] = useState<string[]>([]);
  const [ledIds, setLedIds] = useState<string[]>([]);
  const [castIds, setCastIds] = useState<string[]>([]);
  const [sprayIds, setSprayIds] = useState<string[]>([]);
  const [dongleIds, setDongleIds] = useState<string[]>([]);
  const [evenIds, setEvenIds] = useState<string[]>([]);
  const [linkIds, setLinkIds] = useState<string[]>([]);
  const [centerIds, setCenterIds] = useState<string[]>([]);
  const [spliceIds, setSpliceIds] = useState<string[]>([]);
  const [ventIds, setVentIds] = useState<string[]>([]);
  const [tuneIds, setTuneIds] = useState<string[]>([]);
  const [versoIds, setVersoIds] = useState<string[]>([]);
  const [iconsIds, setIconsIds] = useState<string[]>([]);
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
      setWarmIds(readWarmListingIds());
      setBalanceIds(readBalanceListingIds());
      setWhoseIds(readWhoseListingIds());
      setTypesetIds(readTypesetListingIds());
      setReviseIds(readReviseListingIds());
      setGridIds(readGridListingIds());
      setLoopIds(readLoopListingIds());
      setTwistIds(readTwistListingIds());
      setStretchIds(readStretchListingIds());
      setRememberIds(readRememberListingIds());
      setGlueIds(readGlueListingIds());
      setSlantIds(readSlantListingIds());
      setVgIds(readVgListingIds());
      setBakeIds(readBakeListingIds());
      setGlassIds(readGlassListingIds());
      setDoubleIds(readDoubleListingIds());
      setMinsIds(readMinsListingIds());
      setExpireIds(readExpireListingIds());
      setPolishIds(readPolishListingIds());
      setTrayIds(readTrayListingIds());
      setGumIds(readGumListingIds());
      setInsideIds(readInsideListingIds());
      setTinesIds(readTinesListingIds());
      setRustIds(readRustListingIds());
      setCapIds(readCapListingIds());
      setSaucerIds(readSaucerListingIds());
      setLedIds(readLedListingIds());
      setCastIds(readCastListingIds());
      setSprayIds(readSprayListingIds());
      setDongleIds(readDongleListingIds());
      setEvenIds(readEvenListingIds());
      setLinkIds(readLinkListingIds());
      setCenterIds(readCenterListingIds());
      setSpliceIds(readSpliceListingIds());
      setVentIds(readVentListingIds());
      setTuneIds(readTuneListingIds());
      setVersoIds(readVersoListingIds());
      setIconsIds(readIconsListingIds());
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
    const unsubWarm = subscribeWarm(apply);
    const unsubBalance = subscribeBalance(apply);
    const unsubWhose = subscribeWhose(apply);
    const unsubTypeset = subscribeTypeset(apply);
    const unsubRevise = subscribeRevise(apply);
    const unsubGrid = subscribeGrid(apply);
    const unsubLoop = subscribeLoop(apply);
    const unsubTwist = subscribeTwist(apply);
    const unsubStretch = subscribeStretch(apply);
    const unsubRemember = subscribeRemember(apply);
    const unsubGlue = subscribeGlue(apply);
    const unsubSlant = subscribeSlant(apply);
    const unsubVg = subscribeVg(apply);
    const unsubBake = subscribeBake(apply);
    const unsubGlass = subscribeGlass(apply);
    const unsubDouble = subscribeDouble(apply);
    const unsubMins = subscribeMins(apply);
    const unsubExpire = subscribeExpire(apply);
    const unsubPolish = subscribePolish(apply);
    const unsubTray = subscribeTray(apply);
    const unsubGum = subscribeGum(apply);
    const unsubInside = subscribeInside(apply);
    const unsubTines = subscribeTines(apply);
    const unsubRust = subscribeRust(apply);
    const unsubCap = subscribeCap(apply);
    const unsubSaucer = subscribeSaucer(apply);
    const unsubLed = subscribeLed(apply);
    const unsubCast = subscribeCast(apply);
    const unsubSpray = subscribeSpray(apply);
    const unsubDongle = subscribeDongle(apply);
    const unsubEven = subscribeEven(apply);
    const unsubLink = subscribeLink(apply);
    const unsubCenter = subscribeCenter(apply);
    const unsubSplice = subscribeSplice(apply);
    const unsubVent = subscribeVent(apply);
    const unsubTune = subscribeTune(apply);
    const unsubVerso = subscribeVerso(apply);
    const unsubIcons = subscribeIcons(apply);
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
      unsubWarm();
      unsubBalance();
      unsubWhose();
      unsubTypeset();
      unsubRevise();
      unsubGrid();
      unsubLoop();
      unsubTwist();
      unsubStretch();
      unsubRemember();
      unsubGlue();
      unsubSlant();
      unsubVg();
      unsubBake();
      unsubGlass();
      unsubDouble();
      unsubMins();
      unsubExpire();
      unsubPolish();
      unsubTray();
      unsubGum();
      unsubInside();
      unsubTines();
      unsubRust();
      unsubCap();
      unsubSaucer();
      unsubLed();
      unsubCast();
      unsubSpray();
      unsubDongle();
      unsubEven();
      unsubLink();
      unsubCenter();
      unsubSplice();
      unsubVent();
      unsubTune();
      unsubVerso();
      unsubIcons();
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
                      {canTapeGlass(listing) ? (
                        <form
                          method="post"
                          action={listingGlassWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingGlassOverlay(listing.id, glassIds)
                                ? "open"
                                : "glass"
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
                            {isListingGlassOverlay(listing.id, glassIds)
                              ? "Leave the lid"
                              : "I will not replace the glass"}
                          </button>
                        </form>
                      ) : null}
                      {canTapePolish(listing) ? (
                        <form
                          method="post"
                          action={listingPolishWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingPolishOverlay(listing.id, polishIds)
                                ? "open"
                                : "polish"
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
                            {isListingPolishOverlay(listing.id, polishIds)
                              ? "Leave the scratch"
                              : "I will not polish"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeTray(listing) ? (
                        <form
                          method="post"
                          action={listingTrayWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingTrayOverlay(listing.id, trayIds)
                                ? "open"
                                : "tray"
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
                            {isListingTrayOverlay(listing.id, trayIds)
                              ? "Leave this jewel"
                              : "I will not tray it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeInside(listing) ? (
                        <form
                          method="post"
                          action={listingInsideWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingInsideOverlay(listing.id, insideIds)
                                ? "open"
                                : "inside"
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
                            {isListingInsideOverlay(listing.id, insideIds)
                              ? "Leave the empties"
                              : "I will not say what was inside"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeCap(listing) ? (
                        <form
                          method="post"
                          action={listingCapWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingCapOverlay(listing.id, capIds)
                                ? "open"
                                : "cap"
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
                            {isListingCapOverlay(listing.id, capIds)
                              ? "Leave it open"
                              : "I don't have a cap"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeSaucer(listing) ? (
                        <form
                          method="post"
                          action={listingSaucerWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingSaucerOverlay(listing.id, saucerIds)
                                ? "open"
                                : "saucer"
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
                            {isListingSaucerOverlay(listing.id, saucerIds)
                              ? "Leave the mug open"
                              : "I don't have a saucer"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeLed(listing) ? (
                        <form
                          method="post"
                          action={listingLedWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingLedOverlay(listing.id, ledIds)
                                ? "open"
                                : "led"
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
                            {isListingLedOverlay(listing.id, ledIds)
                              ? "Leave the twist"
                              : "I will not LED it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeCast(listing) ? (
                        <form
                          method="post"
                          action={listingCastWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingCastOverlay(listing.id, castIds)
                                ? "open"
                                : "cast"
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
                            {isListingCastOverlay(listing.id, castIds)
                              ? "Leave this clay"
                              : "I will not recast"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeSpray(listing) ? (
                        <form
                          method="post"
                          action={listingSprayWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingSprayOverlay(listing.id, sprayIds)
                                ? "open"
                                : "spray"
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
                            {isListingSprayOverlay(listing.id, sprayIds)
                              ? "Leave the jacket"
                              : "I will not spray it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeDongle(listing) ? (
                        <form
                          method="post"
                          action={listingDongleWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingDongleOverlay(listing.id, dongleIds)
                                ? "open"
                                : "dongle"
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
                            {isListingDongleOverlay(listing.id, dongleIds)
                              ? "Leave the pile"
                              : "I don't have a dongle"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeEven(listing) ? (
                        <form
                          method="post"
                          action={listingEvenWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingEvenOverlay(listing.id, evenIds)
                                ? "open"
                                : "even"
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
                            {isListingEvenOverlay(listing.id, evenIds)
                              ? "Leave the pair"
                              : "I will not even the wear"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeLink(listing) ? (
                        <form
                          method="post"
                          action={listingLinkWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingLinkOverlay(listing.id, linkIds)
                                ? "open"
                                : "link"
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
                            {isListingLinkOverlay(listing.id, linkIds)
                              ? "Leave the brick"
                              : "I don't have a link"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeCenter(listing) ? (
                        <form
                          method="post"
                          action={listingCenterWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingCenterOverlay(listing.id, centerIds)
                                ? "open"
                                : "center"
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
                            {isListingCenterOverlay(listing.id, centerIds)
                              ? "Leave the hole"
                              : "I will not center it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeSplice(listing) ? (
                        <form
                          method="post"
                          action={listingSpliceWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingSpliceOverlay(listing.id, spliceIds)
                                ? "open"
                                : "splice"
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
                            {isListingSpliceOverlay(listing.id, spliceIds)
                              ? "Leave the talkover"
                              : "I will not splice"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeVent(listing) ? (
                        <form
                          method="post"
                          action={listingVentWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingVentOverlay(listing.id, ventIds)
                                ? "open"
                                : "vent"
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
                            {isListingVentOverlay(listing.id, ventIds)
                              ? "Leave the lid solid"
                              : "I will not vent"}
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
                      {canTapeDouble(listing) ? (
                        <form
                          method="post"
                          action={listingDoubleWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingDoubleOverlay(listing.id, doubleIds)
                                ? "open"
                                : "double"
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
                            {isListingDoubleOverlay(listing.id, doubleIds)
                              ? "Leave the three cards"
                              : "I will not double it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeMins(listing) ? (
                        <form
                          method="post"
                          action={listingMinsWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingMinsOverlay(listing.id, minsIds)
                                ? "open"
                                : "mins"
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
                            {isListingMinsOverlay(listing.id, minsIds)
                              ? "Leave the vibes"
                              : "I will not time it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeExpire(listing) ? (
                        <form
                          method="post"
                          action={listingExpireWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingExpireOverlay(listing.id, expireIds)
                                ? "open"
                                : "expire"
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
                            {isListingExpireOverlay(listing.id, expireIds)
                              ? "Leave the leftover"
                              : "I will not expire it"}
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
                      {canTapeWarm(listing) ? (
                        <form
                          method="post"
                          action={listingWarmWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingWarmOverlay(listing.id, warmIds)
                                ? "open"
                                : "warm"
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
                            {isListingWarmOverlay(listing.id, warmIds)
                              ? "Leave the three looks"
                              : "Warm stays warm"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeBalance(listing) ? (
                        <form
                          method="post"
                          action={listingBalanceWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingBalanceOverlay(listing.id, balanceIds)
                                ? "open"
                                : "balance"
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
                            {isListingBalanceOverlay(listing.id, balanceIds)
                              ? "Leave the three looks"
                              : "I will not balance it"}
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
                      {canTapeRevise(listing) ? (
                        <form
                          method="post"
                          action={listingReviseWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingReviseOverlay(listing.id, reviseIds)
                                ? "open"
                                : "revise"
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
                            {isListingReviseOverlay(listing.id, reviseIds)
                              ? "Leave the page"
                              : "I will not revise"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeGrid(listing) ? (
                        <form
                          method="post"
                          action={listingGridWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingGridOverlay(listing.id, gridIds)
                                ? "open"
                                : "grid"
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
                            {isListingGridOverlay(listing.id, gridIds)
                              ? "Leave the one page"
                              : "I will not spreadsheet"}
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
                      {canTapeTune(listing) ? (
                        <form
                          method="post"
                          action={listingTuneWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingTuneOverlay(listing.id, tuneIds)
                                ? "open"
                                : "tune"
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
                            {isListingTuneOverlay(listing.id, tuneIds)
                              ? "Leave the one-shots"
                              : "I will not tune it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeSlant(listing) ? (
                        <form
                          method="post"
                          action={listingSlantWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingSlantOverlay(listing.id, slantIds)
                                ? "open"
                                : "slant"
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
                            {isListingSlantOverlay(listing.id, slantIds)
                              ? "Leave the two weights"
                              : "I will not cut a slant"}
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
                      {canTapeVerso(listing) ? (
                        <form
                          method="post"
                          action={listingVersoWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingVersoOverlay(listing.id, versoIds)
                                ? "open"
                                : "verso"
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
                            {isListingVersoOverlay(listing.id, versoIds)
                              ? "Leave the one page"
                              : "I will not write Side B"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeIcons(listing) ? (
                        <form
                          method="post"
                          action={listingIconsWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingIconsOverlay(listing.id, iconsIds)
                                ? "open"
                                : "icons"
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
                            {isListingIconsOverlay(listing.id, iconsIds)
                              ? "Leave the two weights"
                              : "I will not draw the icons"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeVg(listing) ? (
                        <form
                          method="post"
                          action={listingVgWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingVgOverlay(listing.id, vgIds)
                                ? "open"
                                : "vg"
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
                            {isListingVgOverlay(listing.id, vgIds)
                              ? "Leave the record"
                              : "I will not VG it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeBake(listing) ? (
                        <form
                          method="post"
                          action={listingBakeWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingBakeOverlay(listing.id, bakeIds)
                                ? "open"
                                : "bake"
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
                            {isListingBakeOverlay(listing.id, bakeIds)
                              ? "Leave the tape"
                              : "I will not bake"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeTines(listing) ? (
                        <form
                          method="post"
                          action={listingTinesWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingTinesOverlay(listing.id, tinesIds)
                                ? "open"
                                : "tines"
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
                            {isListingTinesOverlay(listing.id, tinesIds)
                              ? "Leave the splay"
                              : "I will not replace a tine"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeGum(listing) ? (
                        <form
                          method="post"
                          action={listingGumWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingGumOverlay(listing.id, gumIds)
                                ? "open"
                                : "gum"
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
                            {isListingGumOverlay(listing.id, gumIds)
                              ? "Leave the residue"
                              : "The stickers stay"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeRust(listing) ? (
                        <form
                          method="post"
                          action={listingRustWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingRustOverlay(listing.id, rustIds)
                                ? "open"
                                : "rust"
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
                            {isListingRustOverlay(listing.id, rustIds)
                              ? "Leave the wires"
                              : "The rust stays"}
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
