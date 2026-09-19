import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { StallMissing } from "@/components/mall-missing";
import { MallNotice } from "@/components/mall-notice";
import { PickupNote } from "@/components/pickup-note";
import { StallCardCopy } from "@/components/stalls/stall-card-copy";
import {
  BagThisTableButton,
  parseStallBagNotice,
} from "@/components/stalls/bag-table-button";
import { BoothBuysLink } from "@/components/stalls/booth-buys-link";
import { BoothLostLink } from "@/components/stalls/booth-lost-link";
import { FreeBoxLink } from "@/components/stalls/free-box-link";
import { StashTableLink } from "@/components/stalls/stash-table-link";
import { TapeTableLink } from "@/components/stalls/tape-table-link";
import { YardSignLink } from "@/components/stalls/yard-sign-link";
import { WatchStallButton } from "@/components/watch-stall-button";
import { StallListingCard } from "@/components/stall-listing-card";
import { StallMixBar } from "@/components/stall-mix-bar";
import { Badge } from "@/components/ui/badge";
import { AD_BOOKINGS_COOKIE } from "@/lib/ad-booking";
import {
  isDigitalListing,
  isPhysicalListing,
  listingsByStall,
  stallBySlug,
  stalls,
} from "@/lib/commerce";
import {
  featuredBookingsFromCookie,
  resolveFeaturedForStall,
} from "@/lib/featured-ads";
import {
  BACK_SOON_COOKIE_NAME,
  BACK_SOON_PAPER_LINE,
  backSoonFor,
  parseBackSoon,
} from "@/lib/back-soon";
import {
  BOOTH_COVER_COOKIE_NAME,
  BOOTH_COVER_PAPER_LINE,
  coverSitterFor,
  parseBoothCover,
} from "@/lib/booth-cover";
import {
  BOOTH_FILM_COOKIE_NAME,
  BOOTH_FILM_PAPER_LINE,
  boothFilmFor,
  parseBoothFilm,
} from "@/lib/booth-film";
import {
  BOOTH_KIDS_COOKIE_NAME,
  BOOTH_KIDS_PAPER_LINE,
  boothKidsFor,
  parseBoothKids,
} from "@/lib/booth-kids";
import {
  BOOTH_POLY_COOKIE_NAME,
  BOOTH_POLY_PAPER_LINE,
  boothPolyFor,
  parseBoothPoly,
} from "@/lib/booth-poly";
import {
  BOOTH_WRAP_COOKIE_NAME,
  BOOTH_WRAP_PAPER_LINE,
  boothWrapFor,
  parseBoothWrap,
} from "@/lib/booth-wrap";
import {
  BOOTH_SHELL_COOKIE_NAME,
  BOOTH_SHELL_PAPER_LINE,
  boothShellFor,
  parseBoothShell,
  stallShellPath,
} from "@/lib/booth-shell";
import {
  BOOTH_STICK_COOKIE_NAME,
  BOOTH_STICK_PAPER_LINE,
  boothStickFor,
  parseBoothStick,
  stallStickPath,
} from "@/lib/booth-stick";
import {
  BOOTH_DIG_COOKIE_NAME,
  BOOTH_DIG_PAPER_LINE,
  boothDigFor,
  parseBoothDig,
  stallDigPath,
} from "@/lib/booth-dig";
import {
  BOOTH_STACK_COOKIE_NAME,
  BOOTH_STACK_PAPER_LINE,
  boothStackFor,
  parseBoothStack,
  stallStackPath,
} from "@/lib/booth-stack";
import {
  BOOTH_MATCH_COOKIE_NAME,
  BOOTH_MATCH_PAPER_LINE,
  boothMatchFor,
  parseBoothMatch,
  stallMatchPath,
} from "@/lib/booth-match";
import {
  BOOTH_SEAT_COOKIE_NAME,
  BOOTH_SEAT_PAPER_LINE,
  boothSeatFor,
  parseBoothSeat,
  stallSeatPath,
} from "@/lib/booth-seat";
import {
  BOOTH_FIX_COOKIE_NAME,
  BOOTH_FIX_PAPER_LINE,
  boothFixFor,
  parseBoothFix,
  stallFixPath,
} from "@/lib/booth-fix";
import {
  BOOTH_BURN_COOKIE_NAME,
  BOOTH_BURN_PAPER_LINE,
  boothBurnFor,
  parseBoothBurn,
  stallBurnPath,
} from "@/lib/booth-burn";
import {
  BOOTH_DECK_COOKIE_NAME,
  BOOTH_DECK_PAPER_LINE,
  boothDeckFor,
  parseBoothDeck,
  stallDeckPath,
} from "@/lib/booth-deck";
import {
  BOOTH_SEW_COOKIE_NAME,
  BOOTH_SEW_PAPER_LINE,
  boothSewFor,
  parseBoothSew,
  stallSewPath,
} from "@/lib/booth-sew";
import {
  BOOTH_PRINT_COOKIE_NAME,
  BOOTH_PRINT_PAPER_LINE,
  boothPrintFor,
  parseBoothPrint,
  stallPrintPath,
} from "@/lib/booth-print";
import {
  BOOTH_CLAIM_COOKIE_NAME,
  BOOTH_CLAIM_PAPER_LINE,
  boothClaimFor,
  parseBoothClaim,
  stallClaimPath,
} from "@/lib/booth-claim";
import {
  BOOTH_NAME_COOKIE_NAME,
  BOOTH_NAME_PAPER_LINE,
  boothNameFor,
  parseBoothName,
  stallNamePath,
} from "@/lib/booth-name";
import {
  BOOTH_POSE_COOKIE_NAME,
  BOOTH_POSE_PAPER_LINE,
  boothPoseFor,
  parseBoothPose,
  stallPosePath,
} from "@/lib/booth-pose";
import {
  BOOTH_POUR_COOKIE_NAME,
  BOOTH_POUR_PAPER_LINE,
  boothPourFor,
  parseBoothPour,
  stallPourPath,
} from "@/lib/booth-pour";
import {
  BOOTH_BULB_COOKIE_NAME,
  BOOTH_BULB_PAPER_LINE,
  boothBulbFor,
  parseBoothBulb,
  stallBulbPath,
} from "@/lib/booth-bulb";
import {
  BOOTH_METER_COOKIE_NAME,
  BOOTH_METER_PAPER_LINE,
  boothMeterFor,
  parseBoothMeter,
  stallMeterPath,
} from "@/lib/booth-meter";
import {
  BOOTH_COPY_COOKIE_NAME,
  BOOTH_COPY_PAPER_LINE,
  boothCopyFor,
  parseBoothCopy,
  stallCopyPath,
} from "@/lib/booth-copy";
import {
  BOOTH_SHRINK_COOKIE_NAME,
  BOOTH_SHRINK_PAPER_LINE,
  boothShrinkFor,
  parseBoothShrink,
  stallShrinkPath,
} from "@/lib/booth-shrink";
import {
  BOOTH_DISHES_COOKIE_NAME,
  BOOTH_DISHES_PAPER_LINE,
  boothDishesFor,
  parseBoothDishes,
  stallDishesPath,
} from "@/lib/booth-dishes";
import {
  BOOTH_BUTTONS_COOKIE_NAME,
  BOOTH_BUTTONS_PAPER_LINE,
  boothButtonsFor,
  parseBoothButtons,
  stallButtonsPath,
} from "@/lib/booth-buttons";
import {
  BOOTH_HARP_COOKIE_NAME,
  BOOTH_HARP_PAPER_LINE,
  boothHarpFor,
  parseBoothHarp,
  stallHarpPath,
} from "@/lib/booth-harp";
import {
  BOOTH_SHADE_COOKIE_NAME,
  BOOTH_SHADE_PAPER_LINE,
  boothShadeFor,
  parseBoothShade,
} from "@/lib/booth-shade";
import {
  BOOTH_STAY_COOKIE_NAME,
  BOOTH_STAY_PAPER_LINE,
  boothStayFor,
  parseBoothStay,
} from "@/lib/booth-stay";
import {
  BREAK_BILLS_COOKIE_NAME,
  BREAK_BILLS_PAPER_LINE,
  breakBillsFor,
  parseBreakBills,
} from "@/lib/break-bills";
import {
  EARLY_FOLD_COOKIE_NAME,
  EARLY_FOLD_PAPER_LINE,
  earlyFoldFor,
  parseEarlyFold,
} from "@/lib/early-fold";
import {
  MOVED_SPOT_COOKIE_NAME,
  MOVED_SPOT_PAPER_LINE,
  movedSpotFor,
  parseMovedSpot,
} from "@/lib/moved-spot";
import { isStallPacked } from "@/lib/packed-stall";
import {
  lotPath,
  stallBackPath,
  stallBreakPath,
  stallCoverPath,
  stallFoldPath,
  stallPath,
  stallScrapPath,
  stallFilmPath,
  stallKidsPath,
  stallPolyPath,
  stallWrapPath,
  stallShadePath,
  stallSharePath,
  stallSpotPath,
  stallStayPath,
} from "@/lib/paths";
import {
  TABLE_SHARE_COOKIE_NAME,
  TABLE_SHARE_PAPER_LINE,
  parseTableShare,
  sharePartnerFor,
} from "@/lib/table-share";
import { missingStallMetadata, stallMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type StallPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ bag?: string | string[] }>;
};

export function generateStaticParams() {
  return stalls.map((stall) => ({ slug: stall.slug }));
}

export async function generateMetadata({
  params,
}: StallPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return stallMetadata(stall);
}

export default async function StallPage({
  params,
  searchParams,
}: StallPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const bag = parseStallBagNotice((await searchParams)?.bag);
  const inventory = listingsByStall(stall.id);
  const physical = inventory.filter(isPhysicalListing);
  const digital = inventory.filter(isDigitalListing);
  const jar = await cookies();
  const promo = resolveFeaturedForStall(
    featuredBookingsFromCookie(jar.get(AD_BOOKINGS_COOKIE)?.value),
    stall,
  );
  const lunch = backSoonFor(
    stall.id,
    parseBackSoon(jar.get(BACK_SOON_COOKIE_NAME)?.value),
  );
  const gravel = movedSpotFor(
    stall.id,
    parseMovedSpot(jar.get(MOVED_SPOT_COOKIE_NAME)?.value),
  );
  const sitter = coverSitterFor(
    stall.id,
    parseBoothCover(jar.get(BOOTH_COVER_COOKIE_NAME)?.value),
  );
  const lastCall = earlyFoldFor(
    stall.id,
    parseEarlyFold(jar.get(EARLY_FOLD_COOKIE_NAME)?.value),
  );
  const changeJar = breakBillsFor(
    stall.id,
    parseBreakBills(jar.get(BREAK_BILLS_COOKIE_NAME)?.value),
  );
  const sharer = sharePartnerFor(
    stall.id,
    parseTableShare(jar.get(TABLE_SHARE_COOKIE_NAME)?.value),
  );
  const hangers = boothStayFor(
    stall.id,
    parseBoothStay(jar.get(BOOTH_STAY_COOKIE_NAME)?.value),
  );
  const shade = boothShadeFor(
    stall.id,
    parseBoothShade(jar.get(BOOTH_SHADE_COOKIE_NAME)?.value),
  );
  const film = boothFilmFor(
    stall.id,
    parseBoothFilm(jar.get(BOOTH_FILM_COOKIE_NAME)?.value),
  );
  const kids = boothKidsFor(
    stall.id,
    parseBoothKids(jar.get(BOOTH_KIDS_COOKIE_NAME)?.value),
  );
  const poly = boothPolyFor(
    stall.id,
    parseBoothPoly(jar.get(BOOTH_POLY_COOKIE_NAME)?.value),
  );
  const wrap = boothWrapFor(
    stall.id,
    parseBoothWrap(jar.get(BOOTH_WRAP_COOKIE_NAME)?.value),
  );
  const shell = boothShellFor(
    stall.id,
    parseBoothShell(jar.get(BOOTH_SHELL_COOKIE_NAME)?.value),
  );
  const stick = boothStickFor(
    stall.id,
    parseBoothStick(jar.get(BOOTH_STICK_COOKIE_NAME)?.value),
  );
  const dig = boothDigFor(
    stall.id,
    parseBoothDig(jar.get(BOOTH_DIG_COOKIE_NAME)?.value),
  );
  const stack = boothStackFor(
    stall.id,
    parseBoothStack(jar.get(BOOTH_STACK_COOKIE_NAME)?.value),
  );
  const match = boothMatchFor(
    stall.id,
    parseBoothMatch(jar.get(BOOTH_MATCH_COOKIE_NAME)?.value),
  );
  const seat = boothSeatFor(
    stall.id,
    parseBoothSeat(jar.get(BOOTH_SEAT_COOKIE_NAME)?.value),
  );
  const fix = boothFixFor(
    stall.id,
    parseBoothFix(jar.get(BOOTH_FIX_COOKIE_NAME)?.value),
  );
  const burn = boothBurnFor(
    stall.id,
    parseBoothBurn(jar.get(BOOTH_BURN_COOKIE_NAME)?.value),
  );
  const deck = boothDeckFor(
    stall.id,
    parseBoothDeck(jar.get(BOOTH_DECK_COOKIE_NAME)?.value),
  );
  const sew = boothSewFor(
    stall.id,
    parseBoothSew(jar.get(BOOTH_SEW_COOKIE_NAME)?.value),
  );
  const printNote = boothPrintFor(
    stall.id,
    parseBoothPrint(jar.get(BOOTH_PRINT_COOKIE_NAME)?.value),
  );
  const claim = boothClaimFor(
    stall.id,
    parseBoothClaim(jar.get(BOOTH_CLAIM_COOKIE_NAME)?.value),
  );
  const nameNote = boothNameFor(
    stall.id,
    parseBoothName(jar.get(BOOTH_NAME_COOKIE_NAME)?.value),
  );
  const poseNote = boothPoseFor(
    stall.id,
    parseBoothPose(jar.get(BOOTH_POSE_COOKIE_NAME)?.value),
  );
  const pour = boothPourFor(
    stall.id,
    parseBoothPour(jar.get(BOOTH_POUR_COOKIE_NAME)?.value),
  );
  const bulb = boothBulbFor(
    stall.id,
    parseBoothBulb(jar.get(BOOTH_BULB_COOKIE_NAME)?.value),
  );
  const meter = boothMeterFor(
    stall.id,
    parseBoothMeter(jar.get(BOOTH_METER_COOKIE_NAME)?.value),
  );
  const copyNote = boothCopyFor(
    stall.id,
    parseBoothCopy(jar.get(BOOTH_COPY_COOKIE_NAME)?.value),
  );
  const shrink = boothShrinkFor(
    stall.id,
    parseBoothShrink(jar.get(BOOTH_SHRINK_COOKIE_NAME)?.value),
  );
  const dishes = boothDishesFor(
    stall.id,
    parseBoothDishes(jar.get(BOOTH_DISHES_COOKIE_NAME)?.value),
  );
  const buttons = boothButtonsFor(
    stall.id,
    parseBoothButtons(jar.get(BOOTH_BUTTONS_COOKIE_NAME)?.value),
  );
  const harp = boothHarpFor(
    stall.id,
    parseBoothHarp(jar.get(BOOTH_HARP_COOKIE_NAME)?.value),
  );

  return (
    <div>
      <section className="border-b border-border bg-[linear-gradient(180deg,var(--card),var(--background))]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 sm:py-16">
          <MallCrumb label="Stall location">
            <CrumbSep />
            <span className="text-foreground">{stall.boothName}</span>
          </MallCrumb>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              Independent stall
            </Badge>
            {promo ? (
              <Badge className="rounded-full">Paid the good corner</Badge>
            ) : null}
          </div>

          <StallCardCopy
            stallId={stall.id}
            slug={stall.slug}
            boothName={stall.boothName}
            blurb={stall.blurb}
          />

          {isStallPacked(stall.id) ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Packed up"
              title="This booth packed up."
              body="Files in the folder still exist. Come next weekend. The table went in the car. Not a refund. Not a sold sticker."
            >
              <Link
                href={lotPath()}
                className="text-sm underline-offset-4 hover:underline"
              >
                See the lot
              </Link>
            </MallNotice>
          ) : null}

          {lunch ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Back after lunch"
              title="Stepped away."
              body={
                <p data-back-soon-note={stall.id}>
                  {lunch.note} {BACK_SOON_PAPER_LINE}
                </p>
              }
            />
          ) : null}

          {gravel ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Moved two spots"
              title="New gravel."
              body={
                <p data-moved-spot-note={stall.id}>
                  {gravel.note} {MOVED_SPOT_PAPER_LINE}
                </p>
              }
            />
          ) : null}

          {sitter ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Neighbor is sitting"
              title="Covered."
              body={
                <p data-booth-cover-sitter={stall.id}>
                  {sitter.boothName} {BOOTH_COVER_PAPER_LINE}
                </p>
              }
            />
          ) : null}

          {lastCall ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Folding up at noon"
              title="Last call."
              body={
                <p data-early-fold-note={stall.id}>
                  {lastCall.note} {EARLY_FOLD_PAPER_LINE}
                </p>
              }
            />
          ) : null}

          {changeJar ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I can break a twenty"
              title="Change in the jar."
              body={
                <p data-break-bills-note={stall.id}>
                  {changeJar.note} {BREAK_BILLS_PAPER_LINE}
                </p>
              }
            />
          ) : null}

          {sharer ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Sharing this table"
              title="Two names."
              body={
                <p data-table-share-sharer={stall.id}>
                  {sharer.boothName} {TABLE_SHARE_PAPER_LINE}
                </p>
              }
            />
          ) : null}

          {hangers ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Hangers stay"
              title="The rack is furniture."
              body={
                <p data-booth-stay-note={stall.id}>
                  {hangers.note} {BOOTH_STAY_PAPER_LINE}
                </p>
              }
            />
          ) : null}

          {shade ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Keep it in the shade"
              title="The crate sits in the sun."
              body={
                <p data-booth-shade-note={stall.id}>
                  {shade.note} {BOOTH_SHADE_PAPER_LINE}
                </p>
              }
            />
          ) : null}

          {film ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Don't photograph the tags"
              title="Walkers still film every 3×5."
              body={
                <p data-booth-film-note={stall.id}>
                  {film.note} {BOOTH_FILM_PAPER_LINE}
                </p>
              }
            />
          ) : null}

          {kids ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Kids touch it, you buy it"
              title="If they pick it up, it walks."
              body={
                <p data-booth-kids-note={stall.id}>
                  {kids.note} {BOOTH_KIDS_PAPER_LINE}
                </p>
              }
            />
          ) : null}

          {poly ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Keep the poly on"
              title="The crate stays sealed."
              body={
                <p data-booth-poly-note={stall.id}>
                  {poly.note} {BOOTH_POLY_PAPER_LINE}
                </p>
              }
            />
          ) : null}

          {wrap ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I wrap breakables"
              title="The mug still walks naked."
              body={
                <p data-booth-wrap-note={stall.id}>
                  {wrap.note} {BOOTH_WRAP_PAPER_LINE}
                </p>
              }
            />
          ) : null}

          {shell ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Don't open the shell"
              title="Don't crack the blister."
              body={
                <p data-booth-shell-note={stall.id}>
                  {shell.note} {BOOTH_SHELL_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-shell-empty={stall.id} hidden />
          )}

          {stick ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't email the zip"
              title="Pay and open the folder."
              body={
                <p data-booth-stick-note={stall.id}>
                  {stick.note} {BOOTH_STICK_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-stick-empty={stall.id} hidden />
          )}

          {dig ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Don't dig under"
              title="The zips are not in the gravel."
              body={
                <p data-booth-dig-note={stall.id}>
                  {dig.note} {BOOTH_DIG_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-dig-empty={stall.id} hidden />
          )}

          {stack ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Don't unfold the pile"
              title="Ask what's on top."
              body={
                <p data-booth-stack-note={stall.id}>
                  {stack.note} {BOOTH_STACK_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-stack-empty={stall.id} hidden />
          )}

          {match ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Nothing matches"
              title="Ask what's on the table."
              body={
                <p data-booth-match-note={stall.id}>
                  {match.note} {BOOTH_MATCH_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-match-empty={stall.id} hidden />
          )}

          {seat ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Don't sit on the crate"
              title="The crate is stock, not a chair."
              body={
                <p data-booth-seat-note={stall.id}>
                  {seat.note} {BOOTH_SEAT_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-seat-empty={stall.id} hidden />
          )}

          {fix ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't fix"
              title="I sell it, I don't repair it."
              body={
                <p data-booth-fix-note={stall.id}>
                  {fix.note} {BOOTH_FIX_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-fix-empty={stall.id} hidden />
          )}

          {burn ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't burn a disc"
              title="Pay and open the folder."
              body={
                <p data-booth-burn-note={stall.id}>
                  {burn.note} {BOOTH_BURN_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-burn-empty={stall.id} hidden />
          )}

          {deck ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a deck"
              title="Spin it at home."
              body={
                <p data-booth-deck-note={stall.id}>
                  {deck.note} {BOOTH_DECK_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-deck-empty={stall.id} hidden />
          )}

          {sew ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't sew"
              title="I don't hem it."
              body={
                <p data-booth-sew-note={stall.id}>
                  {sew.note} {BOOTH_SEW_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-sew-empty={stall.id} hidden />
          )}

          {printNote ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't print"
              title="Take the file."
              body={
                <p data-booth-print-note={stall.id}>
                  {printNote.note} {BOOTH_PRINT_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-print-empty={stall.id} hidden />
          )}

          {claim ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't warranty"
              title="That's the sale."
              body={
                <p data-booth-claim-note={stall.id}>
                  {claim.note} {BOOTH_CLAIM_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-claim-empty={stall.id} hidden />
          )}

          {nameNote ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not name them"
              title="Side A still plays."
              body={
                <p data-booth-name-note={stall.id}>
                  {nameNote.note} {BOOTH_NAME_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-name-empty={stall.id} hidden />
          )}

          {poseNote ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Nothing with a lookbook"
              title="Clothes had a season."
              body={
                <p data-booth-pose-note={stall.id}>
                  {poseNote.note} {BOOTH_POSE_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-pose-empty={stall.id} hidden />
          )}

          {pour ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't pour"
              title="The mug is empty."
              body={
                <p data-booth-pour-note={stall.id}>
                  {pour.note} {BOOTH_POUR_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-pour-empty={stall.id} hidden />
          )}

          {bulb ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a bulb"
              title="Twist the neck anyway."
              body={
                <p data-booth-bulb-note={stall.id}>
                  {bulb.note} {BOOTH_BULB_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-bulb-empty={stall.id} hidden />
          )}

          {meter ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a meter"
              title="Sold as a pile."
              body={
                <p data-booth-meter-note={stall.id}>
                  {meter.note} {BOOTH_METER_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-meter-empty={stall.id} hidden />
          )}

          {copyNote ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not copy onto your stick"
              title="Folder after pay."
              body={
                <p data-booth-copy-note={stall.id}>
                  {copyNote.note} {BOOTH_COPY_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-copy-empty={stall.id} hidden />
          )}

          {shrink ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't shrink-wrap"
              title="Poly stays if it is on."
              body={
                <p data-booth-shrink-note={stall.id}>
                  {shrink.note} {BOOTH_SHRINK_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-shrink-empty={stall.id} hidden />
          )}

          {dishes ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't do dishes"
              title="Chip stays."
              body={
                <p data-booth-dishes-note={stall.id}>
                  {dishes.note} {BOOTH_DISHES_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-dishes-empty={stall.id} hidden />
          )}

          {buttons ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have buttons"
              title="Snaps stay."
              body={
                <p data-booth-buttons-note={stall.id}>
                  {buttons.note} {BOOTH_BUTTONS_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-buttons-empty={stall.id} hidden />
          )}

          {harp ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a harp"
              title="Shade stays in the box."
              body={
                <p data-booth-harp-note={stall.id}>
                  {harp.note} {BOOTH_HARP_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-harp-empty={stall.id} hidden />
          )}

          <WatchStallButton stallId={stall.id} returnTo={stallPath(stall.slug)} />

          <Link
            href={stallBackPath(stall.slug)}
            data-back-soon-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Back after lunch
          </Link>

          <Link
            href={stallSpotPath(stall.slug)}
            data-moved-spot-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Moved two spots
          </Link>

          <Link
            href={stallCoverPath(stall.slug)}
            data-booth-cover-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Neighbor is sitting
          </Link>

          <Link
            href={stallFoldPath(stall.slug)}
            data-early-fold-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Folding up at noon
          </Link>

          <Link
            href={stallBreakPath(stall.slug)}
            data-break-bills-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I can break a twenty
          </Link>

          <Link
            href={stallSharePath(stall.slug)}
            data-table-share-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Sharing this table
          </Link>

          <Link
            href={stallStayPath(stall.slug)}
            data-booth-stay-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Hangers stay
          </Link>

          <Link
            href={stallShadePath(stall.slug)}
            data-booth-shade-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Keep it in the shade
          </Link>

          <Link
            href={stallFilmPath(stall.slug)}
            data-booth-film-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Don&apos;t photograph the tags
          </Link>

          <Link
            href={stallKidsPath(stall.slug)}
            data-booth-kids-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Kids touch it, you buy it
          </Link>

          <Link
            href={stallPolyPath(stall.slug)}
            data-booth-poly-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Keep the poly on
          </Link>

          <Link
            href={stallWrapPath(stall.slug)}
            data-booth-wrap-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I wrap breakables
          </Link>

          <Link
            href={stallShellPath(stall.slug)}
            data-booth-shell-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Don&apos;t open the shell
          </Link>

          <Link
            href={stallStickPath(stall.slug)}
            data-booth-stick-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t email the zip
          </Link>

          <Link
            href={stallDigPath(stall.slug)}
            data-booth-dig-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Don&apos;t dig under
          </Link>

          <Link
            href={stallStackPath(stall.slug)}
            data-booth-stack-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Don&apos;t unfold the pile
          </Link>

          <Link
            href={stallMatchPath(stall.slug)}
            data-booth-match-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Nothing matches
          </Link>

          <Link
            href={stallSeatPath(stall.slug)}
            data-booth-seat-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Don&apos;t sit on the crate
          </Link>

          <Link
            href={stallFixPath(stall.slug)}
            data-booth-fix-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t fix
          </Link>

          <Link
            href={stallBurnPath(stall.slug)}
            data-booth-burn-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t burn a disc
          </Link>

          <Link
            href={stallDeckPath(stall.slug)}
            data-booth-deck-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a deck
          </Link>

          <Link
            href={stallSewPath(stall.slug)}
            data-booth-sew-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t sew
          </Link>

          <Link
            href={stallPrintPath(stall.slug)}
            data-booth-print-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t print
          </Link>

          <Link
            href={stallClaimPath(stall.slug)}
            data-booth-claim-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t warranty
          </Link>

          <Link
            href={stallNamePath(stall.slug)}
            data-booth-name-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I will not name them
          </Link>

          <Link
            href={stallPosePath(stall.slug)}
            data-booth-pose-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Nothing with a lookbook
          </Link>

          <Link
            href={stallPourPath(stall.slug)}
            data-booth-pour-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t pour
          </Link>

          <Link
            href={stallBulbPath(stall.slug)}
            data-booth-bulb-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a bulb
          </Link>

          <Link
            href={stallMeterPath(stall.slug)}
            data-booth-meter-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a meter
          </Link>

          <Link
            href={stallCopyPath(stall.slug)}
            data-booth-copy-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I will not copy onto your stick
          </Link>

          <Link
            href={stallShrinkPath(stall.slug)}
            data-booth-shrink-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t shrink-wrap
          </Link>

          <Link
            href={stallDishesPath(stall.slug)}
            data-booth-dishes-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t do dishes
          </Link>

          <Link
            href={stallButtonsPath(stall.slug)}
            data-booth-buttons-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have buttons
          </Link>

          <Link
            href={stallHarpPath(stall.slug)}
            data-booth-harp-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a harp
          </Link>

          <Link
            href={stallScrapPath(stall.slug)}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Tape a scrap on this table
          </Link>

          <BagThisTableButton stallId={stall.id} slug={stall.slug} bag={bag} />

          <TapeTableLink slug={stall.slug} />

          <YardSignLink slug={stall.slug} />

          <StashTableLink slug={stall.slug} />

          <FreeBoxLink slug={stall.slug} />

          <BoothLostLink slug={stall.slug} />

          <BoothBuysLink slug={stall.slug} />

          <StallMixBar physical={physical.length} digital={digital.length} />

          {physical.length > 0 ? (
            <PickupNote stall={stall} className="max-w-2xl" />
          ) : null}

          {promo ? (
            <aside className="max-w-2xl rounded-xl bg-secondary/60 p-4 ring-1 ring-primary/20">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Labeled ad · {promo.slot.packageName} · {promo.slot.window}
              </p>
              <p className="mt-2 font-heading text-xl tracking-tight">
                {promo.slot.headline}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {promo.slot.blurb} Not organic. The booth paid for this corner.
              </p>
            </aside>
          ) : null}
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="rounded-2xl bg-[linear-gradient(180deg,color-mix(in_oklch,var(--secondary)_55%,var(--background)),var(--background))] p-4 sm:p-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              On the table
            </p>
            <h2 className="mt-2 font-heading text-3xl tracking-tight">
              Things you can hold
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Condition is the listing. If it could sit on a folding table, it
              belongs here — not a lookbook.
            </p>
            {physical.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">
                Nothing physical on this table right now. The files are still
                downstairs.
              </p>
            ) : (
              <ul className="mt-6 grid gap-4 lg:grid-cols-2">
                {physical.map((listing) => (
                  <li key={listing.id}>
                    <StallListingCard listing={listing} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-[color-mix(in_oklch,var(--accent)_28%,var(--background))]">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div
            className={cn(
              "rounded-2xl p-4 sm:p-6",
              "bg-[linear-gradient(180deg,color-mix(in_oklch,var(--accent)_50%,var(--card)),transparent)]",
            )}
          >
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Under the table
            </p>
            <h2 className="mt-2 font-heading text-3xl tracking-tight">
              Files from the same stall
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Digital is a listing type, not a second storefront. Format
              stands in for condition.
            </p>
            {digital.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">
                No downloads from this stall right now. The objects are still
                on the table.
              </p>
            ) : (
              <ul className="mt-6 grid gap-4 lg:grid-cols-2">
                {digital.map((listing) => (
                  <li key={listing.id}>
                    <StallListingCard listing={listing} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
