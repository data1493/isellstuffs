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
  BOOTH_FLASH_COOKIE_NAME,
  BOOTH_FLASH_PAPER_LINE,
  boothFlashFor,
  parseBoothFlash,
  stallFlashPath,
} from "@/lib/booth-flash";
import {
  BOOTH_RELOAD_COOKIE_NAME,
  BOOTH_RELOAD_PAPER_LINE,
  boothReloadFor,
  parseBoothReload,
  stallReloadPath,
} from "@/lib/booth-reload";
import {
  BOOTH_INNERS_COOKIE_NAME,
  BOOTH_INNERS_PAPER_LINE,
  boothInnersFor,
  parseBoothInners,
  stallInnersPath,
} from "@/lib/booth-inners";
import {
  BOOTH_PINS_COOKIE_NAME,
  BOOTH_PINS_PAPER_LINE,
  boothPinsFor,
  parseBoothPins,
  stallPinsPath,
} from "@/lib/booth-pins";
import {
  BOOTH_FOIL_COOKIE_NAME,
  BOOTH_FOIL_PAPER_LINE,
  boothFoilFor,
  parseBoothFoil,
  stallFoilPath,
} from "@/lib/booth-foil";
import {
  BOOTH_WIFI_COOKIE_NAME,
  BOOTH_WIFI_PAPER_LINE,
  boothWifiFor,
  parseBoothWifi,
  stallWifiPath,
} from "@/lib/booth-wifi";
import {
  BOOTH_KIT_COOKIE_NAME,
  BOOTH_KIT_PAPER_LINE,
  boothKitFor,
  parseBoothKit,
  stallKitPath,
} from "@/lib/booth-kit";
import {
  BOOTH_DRIVER_COOKIE_NAME,
  BOOTH_DRIVER_PAPER_LINE,
  boothDriverFor,
  parseBoothDriver,
  stallDriverPath,
} from "@/lib/booth-driver";
import {
  BOOTH_PLAYER_COOKIE_NAME,
  BOOTH_PLAYER_PAPER_LINE,
  boothPlayerFor,
  parseBoothPlayer,
  stallPlayerPath,
} from "@/lib/booth-player";
import {
  BOOTH_SPIDER_COOKIE_NAME,
  BOOTH_SPIDER_PAPER_LINE,
  boothSpiderFor,
  parseBoothSpider,
  stallSpiderPath,
} from "@/lib/booth-spider";
import {
  BOOTH_MIRROR_COOKIE_NAME,
  BOOTH_MIRROR_PAPER_LINE,
  boothMirrorFor,
  parseBoothMirror,
  stallMirrorPath,
} from "@/lib/booth-mirror";
import {
  BOOTH_CLAMP_COOKIE_NAME,
  BOOTH_CLAMP_PAPER_LINE,
  boothClampFor,
  parseBoothClamp,
  stallClampPath,
} from "@/lib/booth-clamp";
import {
  BOOTH_SPONGE_COOKIE_NAME,
  BOOTH_SPONGE_PAPER_LINE,
  boothSpongeFor,
  parseBoothSponge,
  stallSpongePath,
} from "@/lib/booth-sponge";
import {
  BOOTH_SPINDLE_COOKIE_NAME,
  BOOTH_SPINDLE_PAPER_LINE,
  boothSpindleFor,
  parseBoothSpindle,
  stallSpindlePath,
} from "@/lib/booth-spindle";
import {
  BOOTH_SLIPMAT_COOKIE_NAME,
  BOOTH_SLIPMAT_PAPER_LINE,
  boothSlipmatFor,
  parseBoothSlipmat,
  stallSlipmatPath,
} from "@/lib/booth-slipmat";
import {
  BOOTH_TRIVET_COOKIE_NAME,
  BOOTH_TRIVET_PAPER_LINE,
  boothTrivetFor,
  parseBoothTrivet,
  stallTrivetPath,
} from "@/lib/booth-trivet";
import {
  BOOTH_THIMBLE_COOKIE_NAME,
  BOOTH_THIMBLE_PAPER_LINE,
  boothThimbleFor,
  parseBoothThimble,
  stallThimblePath,
} from "@/lib/booth-thimble";
import {
  BOOTH_SPUDGER_COOKIE_NAME,
  BOOTH_SPUDGER_PAPER_LINE,
  boothSpudgerFor,
  parseBoothSpudger,
  stallSpudgerPath,
} from "@/lib/booth-spudger";
import {
  BOOTH_FUNNEL_COOKIE_NAME,
  BOOTH_FUNNEL_PAPER_LINE,
  boothFunnelFor,
  parseBoothFunnel,
  stallFunnelPath,
} from "@/lib/booth-funnel";
import {
  BOOTH_PREAMP_COOKIE_NAME,
  BOOTH_PREAMP_PAPER_LINE,
  boothPreampFor,
  parseBoothPreamp,
  stallPreampPath,
} from "@/lib/booth-preamp";
import {
  BOOTH_SQUARE_COOKIE_NAME,
  BOOTH_SQUARE_PAPER_LINE,
  boothSquareFor,
  parseBoothSquare,
  stallSquarePath,
} from "@/lib/booth-square";
import {
  BOOTH_JIG_COOKIE_NAME,
  BOOTH_JIG_PAPER_LINE,
  boothJigFor,
  parseBoothJig,
  stallJigPath,
} from "@/lib/booth-jig";
import {
  BOOTH_WICK_COOKIE_NAME,
  BOOTH_WICK_PAPER_LINE,
  boothWickFor,
  parseBoothWick,
  stallWickPath,
} from "@/lib/booth-wick";
import {
  BOOTH_LAST_COOKIE_NAME,
  BOOTH_LAST_PAPER_LINE,
  boothLastFor,
  parseBoothLast,
  stallLastPath,
} from "@/lib/booth-last";
import {
  BOOTH_CALIPER_COOKIE_NAME,
  BOOTH_CALIPER_PAPER_LINE,
  boothCaliperFor,
  parseBoothCaliper,
  stallCaliperPath,
} from "@/lib/booth-caliper";
import {
  BOOTH_RICER_COOKIE_NAME,
  BOOTH_RICER_PAPER_LINE,
  boothRicerFor,
  parseBoothRicer,
  stallRicerPath,
} from "@/lib/booth-ricer";
import {
  BOOTH_MANDREL_COOKIE_NAME,
  BOOTH_MANDREL_PAPER_LINE,
  boothMandrelFor,
  parseBoothMandrel,
  stallMandrelPath,
} from "@/lib/booth-mandrel";
import {
  BOOTH_PONY_COOKIE_NAME,
  BOOTH_PONY_PAPER_LINE,
  boothPonyFor,
  parseBoothPony,
  stallPonyPath,
} from "@/lib/booth-pony";
import {
  BOOTH_MALLET_COOKIE_NAME,
  BOOTH_MALLET_PAPER_LINE,
  boothMalletFor,
  parseBoothMallet,
  stallMalletPath,
} from "@/lib/booth-mallet";
import {
  BOOTH_SNIPS_COOKIE_NAME,
  BOOTH_SNIPS_PAPER_LINE,
  boothSnipsFor,
  parseBoothSnips,
  stallSnipsPath,
} from "@/lib/booth-snips";
import {
  BOOTH_STROP_COOKIE_NAME,
  BOOTH_STROP_PAPER_LINE,
  boothStropFor,
  parseBoothStrop,
  stallStropPath,
} from "@/lib/booth-strop";
import {
  BOOTH_DRIFT_COOKIE_NAME,
  BOOTH_DRIFT_PAPER_LINE,
  boothDriftFor,
  parseBoothDrift,
  stallDriftPath,
} from "@/lib/booth-drift";
import {
  BOOTH_BONE_COOKIE_NAME,
  BOOTH_BONE_PAPER_LINE,
  boothBoneFor,
  parseBoothBone,
  stallBonePath,
} from "@/lib/booth-bone";
import {
  BOOTH_TWEEZERS_COOKIE_NAME,
  BOOTH_TWEEZERS_PAPER_LINE,
  boothTweezersFor,
  parseBoothTweezers,
  stallTweezersPath,
} from "@/lib/booth-tweezers";
import {
  BOOTH_CHALK_COOKIE_NAME,
  BOOTH_CHALK_PAPER_LINE,
  boothChalkFor,
  parseBoothChalk,
  stallChalkPath,
} from "@/lib/booth-chalk";
import {
  BOOTH_GOBO_COOKIE_NAME,
  BOOTH_GOBO_PAPER_LINE,
  boothGoboFor,
  parseBoothGobo,
  stallGoboPath,
} from "@/lib/booth-gobo";
import {
  BOOTH_FEELER_COOKIE_NAME,
  BOOTH_FEELER_PAPER_LINE,
  boothFeelerFor,
  parseBoothFeeler,
  stallFeelerPath,
} from "@/lib/booth-feeler";
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
  const flash = boothFlashFor(
    stall.id,
    parseBoothFlash(jar.get(BOOTH_FLASH_COOKIE_NAME)?.value),
  );
  const reload = boothReloadFor(
    stall.id,
    parseBoothReload(jar.get(BOOTH_RELOAD_COOKIE_NAME)?.value),
  );
  const innersNote = boothInnersFor(
    stall.id,
    parseBoothInners(jar.get(BOOTH_INNERS_COOKIE_NAME)?.value),
  );
  const pins = boothPinsFor(
    stall.id,
    parseBoothPins(jar.get(BOOTH_PINS_COOKIE_NAME)?.value),
  );
  const foil = boothFoilFor(
    stall.id,
    parseBoothFoil(jar.get(BOOTH_FOIL_COOKIE_NAME)?.value),
  );
  const wifiNote = boothWifiFor(
    stall.id,
    parseBoothWifi(jar.get(BOOTH_WIFI_COOKIE_NAME)?.value),
  );
  const kitNote = boothKitFor(
    stall.id,
    parseBoothKit(jar.get(BOOTH_KIT_COOKIE_NAME)?.value),
  );
  const driver = boothDriverFor(
    stall.id,
    parseBoothDriver(jar.get(BOOTH_DRIVER_COOKIE_NAME)?.value),
  );
  const player = boothPlayerFor(
    stall.id,
    parseBoothPlayer(jar.get(BOOTH_PLAYER_COOKIE_NAME)?.value),
  );
  const spider = boothSpiderFor(
    stall.id,
    parseBoothSpider(jar.get(BOOTH_SPIDER_COOKIE_NAME)?.value),
  );
  const mirror = boothMirrorFor(
    stall.id,
    parseBoothMirror(jar.get(BOOTH_MIRROR_COOKIE_NAME)?.value),
  );
  const clamp = boothClampFor(
    stall.id,
    parseBoothClamp(jar.get(BOOTH_CLAMP_COOKIE_NAME)?.value),
  );
  const sponge = boothSpongeFor(
    stall.id,
    parseBoothSponge(jar.get(BOOTH_SPONGE_COOKIE_NAME)?.value),
  );
  const spindle = boothSpindleFor(
    stall.id,
    parseBoothSpindle(jar.get(BOOTH_SPINDLE_COOKIE_NAME)?.value),
  );
  const slipmat = boothSlipmatFor(
    stall.id,
    parseBoothSlipmat(jar.get(BOOTH_SLIPMAT_COOKIE_NAME)?.value),
  );
  const trivet = boothTrivetFor(
    stall.id,
    parseBoothTrivet(jar.get(BOOTH_TRIVET_COOKIE_NAME)?.value),
  );
  const thimble = boothThimbleFor(
    stall.id,
    parseBoothThimble(jar.get(BOOTH_THIMBLE_COOKIE_NAME)?.value),
  );
  const spudger = boothSpudgerFor(
    stall.id,
    parseBoothSpudger(jar.get(BOOTH_SPUDGER_COOKIE_NAME)?.value),
  );
  const funnel = boothFunnelFor(
    stall.id,
    parseBoothFunnel(jar.get(BOOTH_FUNNEL_COOKIE_NAME)?.value),
  );
  const preamp = boothPreampFor(
    stall.id,
    parseBoothPreamp(jar.get(BOOTH_PREAMP_COOKIE_NAME)?.value),
  );
  const square = boothSquareFor(
    stall.id,
    parseBoothSquare(jar.get(BOOTH_SQUARE_COOKIE_NAME)?.value),
  );
  const jig = boothJigFor(
    stall.id,
    parseBoothJig(jar.get(BOOTH_JIG_COOKIE_NAME)?.value),
  );
  const wick = boothWickFor(
    stall.id,
    parseBoothWick(jar.get(BOOTH_WICK_COOKIE_NAME)?.value),
  );
  const last = boothLastFor(
    stall.id,
    parseBoothLast(jar.get(BOOTH_LAST_COOKIE_NAME)?.value),
  );
  const caliper = boothCaliperFor(
    stall.id,
    parseBoothCaliper(jar.get(BOOTH_CALIPER_COOKIE_NAME)?.value),
  );
  const ricer = boothRicerFor(
    stall.id,
    parseBoothRicer(jar.get(BOOTH_RICER_COOKIE_NAME)?.value),
  );
  const mandrel = boothMandrelFor(
    stall.id,
    parseBoothMandrel(jar.get(BOOTH_MANDREL_COOKIE_NAME)?.value),
  );
  const pony = boothPonyFor(
    stall.id,
    parseBoothPony(jar.get(BOOTH_PONY_COOKIE_NAME)?.value),
  );
  const mallet = boothMalletFor(
    stall.id,
    parseBoothMallet(jar.get(BOOTH_MALLET_COOKIE_NAME)?.value),
  );
  const snips = boothSnipsFor(
    stall.id,
    parseBoothSnips(jar.get(BOOTH_SNIPS_COOKIE_NAME)?.value),
  );
  const strop = boothStropFor(
    stall.id,
    parseBoothStrop(jar.get(BOOTH_STROP_COOKIE_NAME)?.value),
  );
  const drift = boothDriftFor(
    stall.id,
    parseBoothDrift(jar.get(BOOTH_DRIFT_COOKIE_NAME)?.value),
  );
  const bone = boothBoneFor(
    stall.id,
    parseBoothBone(jar.get(BOOTH_BONE_COOKIE_NAME)?.value),
  );
  const tweezers = boothTweezersFor(
    stall.id,
    parseBoothTweezers(jar.get(BOOTH_TWEEZERS_COOKIE_NAME)?.value),
  );
  const chalk = boothChalkFor(
    stall.id,
    parseBoothChalk(jar.get(BOOTH_CHALK_COOKIE_NAME)?.value),
  );
  const gobo = boothGoboFor(
    stall.id,
    parseBoothGobo(jar.get(BOOTH_GOBO_COOKIE_NAME)?.value),
  );
  const feeler = boothFeelerFor(
    stall.id,
    parseBoothFeeler(jar.get(BOOTH_FEELER_COOKIE_NAME)?.value),
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

          {flash ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't flash"
              title="What boots is what boots."
              body={
                <p data-booth-flash-note={stall.id}>
                  {flash.note} {BOOTH_FLASH_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-flash-empty={stall.id} hidden />
          )}

          {reload ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't reload"
              title="Face value."
              body={
                <p data-booth-reload-note={stall.id}>
                  {reload.note} {BOOTH_RELOAD_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-reload-empty={stall.id} hidden />
          )}

          {innersNote ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have inners"
              title="Grocery bag."
              body={
                <p data-booth-inners-note={stall.id}>
                  {innersNote.note} {BOOTH_INNERS_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-inners-empty={stall.id} hidden />
          )}

          {pins ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have pins"
              title="Hem stays."
              body={
                <p data-booth-pins-note={stall.id}>
                  {pins.note} {BOOTH_PINS_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-pins-empty={stall.id} hidden />
          )}

          {foil ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have foil"
              title="Drawer only."
              body={
                <p data-booth-foil-note={stall.id}>
                  {foil.note} {BOOTH_FOIL_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-foil-empty={stall.id} hidden />
          )}

          {wifiNote ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have wifi"
              title="Pay first."
              body={
                <p data-booth-wifi-note={stall.id}>
                  {wifiNote.note} {BOOTH_WIFI_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-wifi-empty={stall.id} hidden />
          )}

          {kitNote ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't assemble"
              title="Shade stays in the box."
              body={
                <p data-booth-kit-note={stall.id}>
                  {kitNote.note} {BOOTH_KIT_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-kit-empty={stall.id} hidden />
          )}

          {driver ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a driver"
              title="Blister stays closed."
              body={
                <p data-booth-driver-note={stall.id}>
                  {driver.note} {BOOTH_DRIVER_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-driver-empty={stall.id} hidden />
          )}

          {player ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a player"
              title="Still Sharpie. Still a table."
              body={
                <p data-booth-player-note={stall.id}>
                  {player.note} {BOOTH_PLAYER_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-player-empty={stall.id} hidden />
          )}

          {spider ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a spider"
              title="Still Side A."
              body={
                <p data-booth-spider-note={stall.id}>
                  {spider.note} {BOOTH_SPIDER_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-spider-empty={stall.id} hidden />
          )}

          {mirror ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a mirror"
              title="Still a rack."
              body={
                <p data-booth-mirror-note={stall.id}>
                  {mirror.note} {BOOTH_MIRROR_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-mirror-empty={stall.id} hidden />
          )}

          {clamp ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a clamp"
              title="Still a folding table."
              body={
                <p data-booth-clamp-note={stall.id}>
                  {clamp.note} {BOOTH_CLAMP_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-clamp-empty={stall.id} hidden />
          )}

          {sponge ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a sponge"
              title="Still dishes. Still a hose."
              body={
                <p data-booth-sponge-note={stall.id}>
                  {sponge.note} {BOOTH_SPONGE_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-sponge-empty={stall.id} hidden />
          )}

          {spindle ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a spindle"
              title="Still a jewel."
              body={
                <p data-booth-spindle-note={stall.id}>
                  {spindle.note} {BOOTH_SPINDLE_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-spindle-empty={stall.id} hidden />
          )}

          {slipmat ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a slipmat"
              title="Still a crate. Still no deck."
              body={
                <p data-booth-slipmat-note={stall.id}>
                  {slipmat.note} {BOOTH_SLIPMAT_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-slipmat-empty={stall.id} hidden />
          )}

          {trivet ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a trivet"
              title="Still a drawer. Still a chip."
              body={
                <p data-booth-trivet-note={stall.id}>
                  {trivet.note} {BOOTH_TRIVET_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-trivet-empty={stall.id} hidden />
          )}

          {thimble ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a thimble"
              title="Still a closet. Still worn twice."
              body={
                <p data-booth-thimble-note={stall.id}>
                  {thimble.note} {BOOTH_THIMBLE_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-thimble-empty={stall.id} hidden />
          )}

          {spudger ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a spudger"
              title="Still a blister. Still fused."
              body={
                <p data-booth-spudger-note={stall.id}>
                  {spudger.note} {BOOTH_SPUDGER_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-spudger-empty={stall.id} hidden />
          )}

          {funnel ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a funnel"
              title="Still a drawer. Still a table."
              body={
                <p data-booth-funnel-note={stall.id}>
                  {funnel.note} {BOOTH_FUNNEL_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-funnel-empty={stall.id} hidden />
          )}

          {preamp ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a preamp"
              title="Still a crate. Still a table."
              body={
                <p data-booth-preamp-note={stall.id}>
                  {preamp.note} {BOOTH_PREAMP_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-preamp-empty={stall.id} hidden />
          )}

          {square ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a square"
              title="Still a table."
              body={
                <p data-booth-square-note={stall.id}>
                  {square.note} {BOOTH_SQUARE_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-square-empty={stall.id} hidden />
          )}

          {jig ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a jig"
              title="Still a table."
              body={
                <p data-booth-jig-note={stall.id}>
                  {jig.note} {BOOTH_JIG_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-jig-empty={stall.id} hidden />
          )}

          {wick ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a wick"
              title="Still a table."
              body={
                <p data-booth-wick-note={stall.id}>
                  {wick.note} {BOOTH_WICK_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-wick-empty={stall.id} hidden />
          )}

          {last ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a last"
              title="Still a table."
              body={
                <p data-booth-last-note={stall.id}>
                  {last.note} {BOOTH_LAST_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-last-empty={stall.id} hidden />
          )}

          {caliper ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a caliper"
              title="Still a table."
              body={
                <p data-booth-caliper-note={stall.id}>
                  {caliper.note} {BOOTH_CALIPER_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-caliper-empty={stall.id} hidden />
          )}

          {ricer ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a ricer"
              title="Still a drawer."
              body={
                <p data-booth-ricer-note={stall.id}>
                  {ricer.note} {BOOTH_RICER_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-ricer-empty={stall.id} hidden />
          )}

          {mandrel ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a mandrel"
              title="Still a table."
              body={
                <p data-booth-mandrel-note={stall.id}>
                  {mandrel.note} {BOOTH_MANDREL_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-mandrel-empty={stall.id} hidden />
          )}

          {pony ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a pony"
              title="Still a closet."
              body={
                <p data-booth-pony-note={stall.id}>
                  {pony.note} {BOOTH_PONY_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-pony-empty={stall.id} hidden />
          )}

          {mallet ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a mallet"
              title="Still a driveway. Still a stain."
              body={
                <p data-booth-mallet-note={stall.id}>
                  {mallet.note} {BOOTH_MALLET_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-mallet-empty={stall.id} hidden />
          )}

          {snips ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have snips"
              title="Still a driveway. Still a tangle."
              body={
                <p data-booth-snips-note={stall.id}>
                  {snips.note} {BOOTH_SNIPS_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-snips-empty={stall.id} hidden />
          )}

          {strop ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a strop"
              title="Still a crate. Still a skip."
              body={
                <p data-booth-strop-note={stall.id}>
                  {strop.note} {BOOTH_STROP_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-strop-empty={stall.id} hidden />
          )}

          {drift ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a drift"
              title="Still a driveway. Still a crack."
              body={
                <p data-booth-drift-note={stall.id}>
                  {drift.note} {BOOTH_DRIFT_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-drift-empty={stall.id} hidden />
          )}

          {bone ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a bone"
              title="Still a driveway. Still a grocery bag."
              body={
                <p data-booth-bone-note={stall.id}>
                  {bone.note} {BOOTH_BONE_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-bone-empty={stall.id} hidden />
          )}

          {tweezers ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have tweezers"
              title="Still a driveway. Still a crack."
              body={
                <p data-booth-tweezers-note={stall.id}>
                  {tweezers.note} {BOOTH_TWEEZERS_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-tweezers-empty={stall.id} hidden />
          )}

          {chalk ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have chalk"
              title="Still a season. Still no lookbook."
              body={
                <p data-booth-chalk-note={stall.id}>
                  {chalk.note} {BOOTH_CHALK_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-chalk-empty={stall.id} hidden />
          )}

          {gobo ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a gobo"
              title="Still a folder. Still a jewel case."
              body={
                <p data-booth-gobo-note={stall.id}>
                  {gobo.note} {BOOTH_GOBO_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-gobo-empty={stall.id} hidden />
          )}

          {feeler ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a feeler"
              title="Still a crack. Still a stain."
              body={
                <p data-booth-feeler-note={stall.id}>
                  {feeler.note} {BOOTH_FEELER_PAPER_LINE}
                </p>
              }
            />
          ) : (
            <p data-booth-feeler-empty={stall.id} hidden />
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
            href={stallFlashPath(stall.slug)}
            data-booth-flash-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t flash
          </Link>

          <Link
            href={stallReloadPath(stall.slug)}
            data-booth-reload-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t reload
          </Link>

          <Link
            href={stallInnersPath(stall.slug)}
            data-booth-inners-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have inners
          </Link>

          <Link
            href={stallPinsPath(stall.slug)}
            data-booth-pins-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have pins
          </Link>

          <Link
            href={stallFoilPath(stall.slug)}
            data-booth-foil-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have foil
          </Link>

          <Link
            href={stallWifiPath(stall.slug)}
            data-booth-wifi-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have wifi
          </Link>

          <Link
            href={stallKitPath(stall.slug)}
            data-booth-kit-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t assemble
          </Link>

          <Link
            href={stallDriverPath(stall.slug)}
            data-booth-driver-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a driver
          </Link>

          <Link
            href={stallPlayerPath(stall.slug)}
            data-booth-player-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a player
          </Link>

          <Link
            href={stallSpiderPath(stall.slug)}
            data-booth-spider-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a spider
          </Link>

          <Link
            href={stallMirrorPath(stall.slug)}
            data-booth-mirror-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a mirror
          </Link>

          <Link
            href={stallClampPath(stall.slug)}
            data-booth-clamp-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a clamp
          </Link>

          <Link
            href={stallSpongePath(stall.slug)}
            data-booth-sponge-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a sponge
          </Link>

          <Link
            href={stallSpindlePath(stall.slug)}
            data-booth-spindle-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a spindle
          </Link>

          <Link
            href={stallSlipmatPath(stall.slug)}
            data-booth-slipmat-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a slipmat
          </Link>

          <Link
            href={stallTrivetPath(stall.slug)}
            data-booth-trivet-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a trivet
          </Link>

          <Link
            href={stallThimblePath(stall.slug)}
            data-booth-thimble-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a thimble
          </Link>

          <Link
            href={stallSpudgerPath(stall.slug)}
            data-booth-spudger-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a spudger
          </Link>

          <Link
            href={stallFunnelPath(stall.slug)}
            data-booth-funnel-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a funnel
          </Link>

          <Link
            href={stallPreampPath(stall.slug)}
            data-booth-preamp-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a preamp
          </Link>

          <Link
            href={stallSquarePath(stall.slug)}
            data-booth-square-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a square
          </Link>

          <Link
            href={stallJigPath(stall.slug)}
            data-booth-jig-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a jig
          </Link>

          <Link
            href={stallWickPath(stall.slug)}
            data-booth-wick-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a wick
          </Link>

          <Link
            href={stallLastPath(stall.slug)}
            data-booth-last-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a last
          </Link>

          <Link
            href={stallCaliperPath(stall.slug)}
            data-booth-caliper-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a caliper
          </Link>

          <Link
            href={stallRicerPath(stall.slug)}
            data-booth-ricer-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a ricer
          </Link>

          <Link
            href={stallMandrelPath(stall.slug)}
            data-booth-mandrel-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a mandrel
          </Link>

          <Link
            href={stallPonyPath(stall.slug)}
            data-booth-pony-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a pony
          </Link>

          <Link
            href={stallMalletPath(stall.slug)}
            data-booth-mallet-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a mallet
          </Link>

          <Link
            href={stallSnipsPath(stall.slug)}
            data-booth-snips-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have snips
          </Link>

          <Link
            href={stallStropPath(stall.slug)}
            data-booth-strop-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a strop
          </Link>

          <Link
            href={stallDriftPath(stall.slug)}
            data-booth-drift-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a drift
          </Link>

          <Link
            href={stallBonePath(stall.slug)}
            data-booth-bone-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a bone
          </Link>

          <Link
            href={stallTweezersPath(stall.slug)}
            data-booth-tweezers-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have tweezers
          </Link>

          <Link
            href={stallChalkPath(stall.slug)}
            data-booth-chalk-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have chalk
          </Link>

          <Link
            href={stallGoboPath(stall.slug)}
            data-booth-gobo-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a gobo
          </Link>

          <Link
            href={stallFeelerPath(stall.slug)}
            data-booth-feeler-link={stall.slug}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            I don&apos;t have a feeler
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
