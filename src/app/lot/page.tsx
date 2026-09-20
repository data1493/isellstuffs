import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";

import { LotEmpty } from "@/app/lot/empty";
import { LotBoothCard } from "@/components/lot/lot-booth-card";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BACK_SOON_COOKIE_NAME,
  BACK_SOON_MIRROR_SCRIPT,
  parseBackSoon,
} from "@/lib/back-soon";
import {
  BOOTH_COVER_COOKIE_NAME,
  BOOTH_COVER_MIRROR_SCRIPT,
  coverSitterFor,
  parseBoothCover,
} from "@/lib/booth-cover";
import {
  BOOTH_FILM_COOKIE_NAME,
  BOOTH_FILM_MIRROR_SCRIPT,
  parseBoothFilm,
} from "@/lib/booth-film";
import {
  BOOTH_KIDS_COOKIE_NAME,
  BOOTH_KIDS_MIRROR_SCRIPT,
  parseBoothKids,
} from "@/lib/booth-kids";
import {
  BOOTH_POLY_COOKIE_NAME,
  BOOTH_POLY_MIRROR_SCRIPT,
  parseBoothPoly,
} from "@/lib/booth-poly";
import {
  BOOTH_WRAP_COOKIE_NAME,
  BOOTH_WRAP_MIRROR_SCRIPT,
  parseBoothWrap,
} from "@/lib/booth-wrap";
import {
  BOOTH_SHELL_COOKIE_NAME,
  BOOTH_SHELL_MIRROR_SCRIPT,
  parseBoothShell,
} from "@/lib/booth-shell";
import {
  BOOTH_STICK_COOKIE_NAME,
  BOOTH_STICK_MIRROR_SCRIPT,
  parseBoothStick,
} from "@/lib/booth-stick";
import {
  BOOTH_DIG_COOKIE_NAME,
  BOOTH_DIG_MIRROR_SCRIPT,
  parseBoothDig,
} from "@/lib/booth-dig";
import {
  BOOTH_STACK_COOKIE_NAME,
  BOOTH_STACK_MIRROR_SCRIPT,
  parseBoothStack,
} from "@/lib/booth-stack";
import {
  BOOTH_MATCH_COOKIE_NAME,
  BOOTH_MATCH_MIRROR_SCRIPT,
  parseBoothMatch,
} from "@/lib/booth-match";
import {
  BOOTH_SEAT_COOKIE_NAME,
  BOOTH_SEAT_MIRROR_SCRIPT,
  parseBoothSeat,
} from "@/lib/booth-seat";
import {
  BOOTH_FIX_COOKIE_NAME,
  BOOTH_FIX_MIRROR_SCRIPT,
  parseBoothFix,
} from "@/lib/booth-fix";
import {
  BOOTH_BURN_COOKIE_NAME,
  BOOTH_BURN_MIRROR_SCRIPT,
  parseBoothBurn,
} from "@/lib/booth-burn";
import {
  BOOTH_DECK_COOKIE_NAME,
  BOOTH_DECK_MIRROR_SCRIPT,
  parseBoothDeck,
} from "@/lib/booth-deck";
import {
  BOOTH_SEW_COOKIE_NAME,
  BOOTH_SEW_MIRROR_SCRIPT,
  parseBoothSew,
} from "@/lib/booth-sew";
import {
  BOOTH_PRINT_COOKIE_NAME,
  BOOTH_PRINT_MIRROR_SCRIPT,
  parseBoothPrint,
} from "@/lib/booth-print";
import {
  BOOTH_CLAIM_COOKIE_NAME,
  BOOTH_CLAIM_MIRROR_SCRIPT,
  parseBoothClaim,
} from "@/lib/booth-claim";
import {
  BOOTH_NAME_COOKIE_NAME,
  BOOTH_NAME_MIRROR_SCRIPT,
  parseBoothName,
} from "@/lib/booth-name";
import {
  BOOTH_POSE_COOKIE_NAME,
  BOOTH_POSE_MIRROR_SCRIPT,
  parseBoothPose,
} from "@/lib/booth-pose";
import {
  BOOTH_POUR_COOKIE_NAME,
  BOOTH_POUR_MIRROR_SCRIPT,
  parseBoothPour,
} from "@/lib/booth-pour";
import {
  BOOTH_BULB_COOKIE_NAME,
  BOOTH_BULB_MIRROR_SCRIPT,
  parseBoothBulb,
} from "@/lib/booth-bulb";
import {
  BOOTH_METER_COOKIE_NAME,
  BOOTH_METER_MIRROR_SCRIPT,
  parseBoothMeter,
} from "@/lib/booth-meter";
import {
  BOOTH_COPY_COOKIE_NAME,
  BOOTH_COPY_MIRROR_SCRIPT,
  parseBoothCopy,
} from "@/lib/booth-copy";
import {
  BOOTH_SHRINK_COOKIE_NAME,
  BOOTH_SHRINK_MIRROR_SCRIPT,
  parseBoothShrink,
} from "@/lib/booth-shrink";
import {
  BOOTH_DISHES_COOKIE_NAME,
  BOOTH_DISHES_MIRROR_SCRIPT,
  parseBoothDishes,
} from "@/lib/booth-dishes";
import {
  BOOTH_BUTTONS_COOKIE_NAME,
  BOOTH_BUTTONS_MIRROR_SCRIPT,
  parseBoothButtons,
} from "@/lib/booth-buttons";
import {
  BOOTH_HARP_COOKIE_NAME,
  BOOTH_HARP_MIRROR_SCRIPT,
  parseBoothHarp,
} from "@/lib/booth-harp";
import {
  BOOTH_FLASH_COOKIE_NAME,
  BOOTH_FLASH_MIRROR_SCRIPT,
  parseBoothFlash,
} from "@/lib/booth-flash";
import {
  BOOTH_RELOAD_COOKIE_NAME,
  BOOTH_RELOAD_MIRROR_SCRIPT,
  parseBoothReload,
} from "@/lib/booth-reload";
import {
  BOOTH_INNERS_COOKIE_NAME,
  BOOTH_INNERS_MIRROR_SCRIPT,
  parseBoothInners,
} from "@/lib/booth-inners";
import {
  BOOTH_PINS_COOKIE_NAME,
  BOOTH_PINS_MIRROR_SCRIPT,
  parseBoothPins,
} from "@/lib/booth-pins";
import {
  BOOTH_FOIL_COOKIE_NAME,
  BOOTH_FOIL_MIRROR_SCRIPT,
  parseBoothFoil,
} from "@/lib/booth-foil";
import {
  BOOTH_WIFI_COOKIE_NAME,
  BOOTH_WIFI_MIRROR_SCRIPT,
  parseBoothWifi,
} from "@/lib/booth-wifi";
import {
  BOOTH_KIT_COOKIE_NAME,
  BOOTH_KIT_MIRROR_SCRIPT,
  parseBoothKit,
} from "@/lib/booth-kit";
import {
  BOOTH_DRIVER_COOKIE_NAME,
  BOOTH_DRIVER_MIRROR_SCRIPT,
  parseBoothDriver,
} from "@/lib/booth-driver";
import {
  BOOTH_PLAYER_COOKIE_NAME,
  BOOTH_PLAYER_MIRROR_SCRIPT,
  parseBoothPlayer,
} from "@/lib/booth-player";
import {
  BOOTH_SPIDER_COOKIE_NAME,
  BOOTH_SPIDER_MIRROR_SCRIPT,
  parseBoothSpider,
} from "@/lib/booth-spider";
import {
  BOOTH_MIRROR_COOKIE_NAME,
  BOOTH_MIRROR_MIRROR_SCRIPT,
  parseBoothMirror,
} from "@/lib/booth-mirror";
import {
  BOOTH_CLAMP_COOKIE_NAME,
  BOOTH_CLAMP_MIRROR_SCRIPT,
  parseBoothClamp,
} from "@/lib/booth-clamp";
import {
  BOOTH_SPONGE_COOKIE_NAME,
  BOOTH_SPONGE_MIRROR_SCRIPT,
  parseBoothSponge,
} from "@/lib/booth-sponge";
import {
  BOOTH_SPINDLE_COOKIE_NAME,
  BOOTH_SPINDLE_MIRROR_SCRIPT,
  parseBoothSpindle,
} from "@/lib/booth-spindle";
import {
  BOOTH_SLIPMAT_COOKIE_NAME,
  BOOTH_SLIPMAT_MIRROR_SCRIPT,
  parseBoothSlipmat,
} from "@/lib/booth-slipmat";
import {
  BOOTH_TRIVET_COOKIE_NAME,
  BOOTH_TRIVET_MIRROR_SCRIPT,
  parseBoothTrivet,
} from "@/lib/booth-trivet";
import {
  BOOTH_THIMBLE_COOKIE_NAME,
  BOOTH_THIMBLE_MIRROR_SCRIPT,
  parseBoothThimble,
} from "@/lib/booth-thimble";
import {
  BOOTH_SPUDGER_COOKIE_NAME,
  BOOTH_SPUDGER_MIRROR_SCRIPT,
  parseBoothSpudger,
} from "@/lib/booth-spudger";
import {
  BOOTH_FUNNEL_COOKIE_NAME,
  BOOTH_FUNNEL_MIRROR_SCRIPT,
  parseBoothFunnel,
} from "@/lib/booth-funnel";
import {
  BOOTH_PREAMP_COOKIE_NAME,
  BOOTH_PREAMP_MIRROR_SCRIPT,
  parseBoothPreamp,
} from "@/lib/booth-preamp";
import {
  BOOTH_SQUARE_COOKIE_NAME,
  BOOTH_SQUARE_MIRROR_SCRIPT,
  parseBoothSquare,
} from "@/lib/booth-square";
import {
  BOOTH_JIG_COOKIE_NAME,
  BOOTH_JIG_MIRROR_SCRIPT,
  parseBoothJig,
} from "@/lib/booth-jig";
import {
  BOOTH_WICK_COOKIE_NAME,
  BOOTH_WICK_MIRROR_SCRIPT,
  parseBoothWick,
} from "@/lib/booth-wick";
import {
  BOOTH_LAST_COOKIE_NAME,
  BOOTH_LAST_MIRROR_SCRIPT,
  parseBoothLast,
} from "@/lib/booth-last";
import {
  BOOTH_CALIPER_COOKIE_NAME,
  BOOTH_CALIPER_MIRROR_SCRIPT,
  parseBoothCaliper,
} from "@/lib/booth-caliper";
import {
  BOOTH_RICER_COOKIE_NAME,
  BOOTH_RICER_MIRROR_SCRIPT,
  parseBoothRicer,
} from "@/lib/booth-ricer";
import {
  BOOTH_MANDREL_COOKIE_NAME,
  BOOTH_MANDREL_MIRROR_SCRIPT,
  parseBoothMandrel,
} from "@/lib/booth-mandrel";
import {
  BOOTH_PONY_COOKIE_NAME,
  BOOTH_PONY_MIRROR_SCRIPT,
  parseBoothPony,
} from "@/lib/booth-pony";
import {
  BOOTH_MALLET_COOKIE_NAME,
  BOOTH_MALLET_MIRROR_SCRIPT,
  parseBoothMallet,
} from "@/lib/booth-mallet";
import {
  BOOTH_SNIPS_COOKIE_NAME,
  BOOTH_SNIPS_MIRROR_SCRIPT,
  parseBoothSnips,
} from "@/lib/booth-snips";
import {
  BOOTH_STROP_COOKIE_NAME,
  BOOTH_STROP_MIRROR_SCRIPT,
  parseBoothStrop,
} from "@/lib/booth-strop";
import {
  BOOTH_DRIFT_COOKIE_NAME,
  BOOTH_DRIFT_MIRROR_SCRIPT,
  parseBoothDrift,
} from "@/lib/booth-drift";
import {
  BOOTH_BONE_COOKIE_NAME,
  BOOTH_BONE_MIRROR_SCRIPT,
  parseBoothBone,
} from "@/lib/booth-bone";
import {
  BOOTH_TWEEZERS_COOKIE_NAME,
  BOOTH_TWEEZERS_MIRROR_SCRIPT,
  parseBoothTweezers,
} from "@/lib/booth-tweezers";
import {
  BOOTH_SHADE_COOKIE_NAME,
  BOOTH_SHADE_MIRROR_SCRIPT,
  parseBoothShade,
} from "@/lib/booth-shade";
import {
  BOOTH_STAY_COOKIE_NAME,
  BOOTH_STAY_MIRROR_SCRIPT,
  parseBoothStay,
} from "@/lib/booth-stay";
import {
  BREAK_BILLS_COOKIE_NAME,
  BREAK_BILLS_MIRROR_SCRIPT,
  parseBreakBills,
} from "@/lib/break-bills";
import {
  EARLY_FOLD_COOKIE_NAME,
  EARLY_FOLD_MIRROR_SCRIPT,
  parseEarlyFold,
} from "@/lib/early-fold";
import {
  TABLE_SHARE_COOKIE_NAME,
  TABLE_SHARE_MIRROR_SCRIPT,
  parseTableShare,
  sharePartnerFor,
} from "@/lib/table-share";
import {
  MOVED_SPOT_COOKIE_NAME,
  MOVED_SPOT_MIRROR_SCRIPT,
  parseMovedSpot,
} from "@/lib/moved-spot";
import { PACKED_COOKIE_NAME, PACKED_MIRROR_SCRIPT } from "@/lib/packed-stall";
import { lotBoard, lotOff, lotOn } from "@/lib/lot-board";
import { lotPath, thisWeekPath } from "@/lib/paths";
import { lotMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = lotMetadata();

export default async function LotPage() {
  const jar = await cookies();
  const rows = lotBoard(jar.get(PACKED_COOKIE_NAME)?.value);
  const lunchMap = parseBackSoon(jar.get(BACK_SOON_COOKIE_NAME)?.value);
  const spotMap = parseMovedSpot(jar.get(MOVED_SPOT_COOKIE_NAME)?.value);
  const coverMap = parseBoothCover(jar.get(BOOTH_COVER_COOKIE_NAME)?.value);
  const foldMap = parseEarlyFold(jar.get(EARLY_FOLD_COOKIE_NAME)?.value);
  const breakMap = parseBreakBills(jar.get(BREAK_BILLS_COOKIE_NAME)?.value);
  const shareMap = parseTableShare(jar.get(TABLE_SHARE_COOKIE_NAME)?.value);
  const stayMap = parseBoothStay(jar.get(BOOTH_STAY_COOKIE_NAME)?.value);
  const shadeMap = parseBoothShade(jar.get(BOOTH_SHADE_COOKIE_NAME)?.value);
  const filmMap = parseBoothFilm(jar.get(BOOTH_FILM_COOKIE_NAME)?.value);
  const kidsMap = parseBoothKids(jar.get(BOOTH_KIDS_COOKIE_NAME)?.value);
  const polyMap = parseBoothPoly(jar.get(BOOTH_POLY_COOKIE_NAME)?.value);
  const wrapMap = parseBoothWrap(jar.get(BOOTH_WRAP_COOKIE_NAME)?.value);
  const shellMap = parseBoothShell(jar.get(BOOTH_SHELL_COOKIE_NAME)?.value);
  const stickMap = parseBoothStick(jar.get(BOOTH_STICK_COOKIE_NAME)?.value);
  const digMap = parseBoothDig(jar.get(BOOTH_DIG_COOKIE_NAME)?.value);
  const stackMap = parseBoothStack(jar.get(BOOTH_STACK_COOKIE_NAME)?.value);
  const matchMap = parseBoothMatch(jar.get(BOOTH_MATCH_COOKIE_NAME)?.value);
  const seatMap = parseBoothSeat(jar.get(BOOTH_SEAT_COOKIE_NAME)?.value);
  const fixMap = parseBoothFix(jar.get(BOOTH_FIX_COOKIE_NAME)?.value);
  const burnMap = parseBoothBurn(jar.get(BOOTH_BURN_COOKIE_NAME)?.value);
  const deckMap = parseBoothDeck(jar.get(BOOTH_DECK_COOKIE_NAME)?.value);
  const sewMap = parseBoothSew(jar.get(BOOTH_SEW_COOKIE_NAME)?.value);
  const printMap = parseBoothPrint(jar.get(BOOTH_PRINT_COOKIE_NAME)?.value);
  const claimMap = parseBoothClaim(jar.get(BOOTH_CLAIM_COOKIE_NAME)?.value);
  const nameMap = parseBoothName(jar.get(BOOTH_NAME_COOKIE_NAME)?.value);
  const poseMap = parseBoothPose(jar.get(BOOTH_POSE_COOKIE_NAME)?.value);
  const pourMap = parseBoothPour(jar.get(BOOTH_POUR_COOKIE_NAME)?.value);
  const bulbMap = parseBoothBulb(jar.get(BOOTH_BULB_COOKIE_NAME)?.value);
  const meterMap = parseBoothMeter(jar.get(BOOTH_METER_COOKIE_NAME)?.value);
  const copyMap = parseBoothCopy(jar.get(BOOTH_COPY_COOKIE_NAME)?.value);
  const shrinkMap = parseBoothShrink(jar.get(BOOTH_SHRINK_COOKIE_NAME)?.value);
  const dishesMap = parseBoothDishes(jar.get(BOOTH_DISHES_COOKIE_NAME)?.value);
  const buttonsMap = parseBoothButtons(jar.get(BOOTH_BUTTONS_COOKIE_NAME)?.value);
  const harpMap = parseBoothHarp(jar.get(BOOTH_HARP_COOKIE_NAME)?.value);
  const flashMap = parseBoothFlash(jar.get(BOOTH_FLASH_COOKIE_NAME)?.value);
  const reloadMap = parseBoothReload(jar.get(BOOTH_RELOAD_COOKIE_NAME)?.value);
  const innersMap = parseBoothInners(jar.get(BOOTH_INNERS_COOKIE_NAME)?.value);
  const pinsMap = parseBoothPins(jar.get(BOOTH_PINS_COOKIE_NAME)?.value);
  const foilMap = parseBoothFoil(jar.get(BOOTH_FOIL_COOKIE_NAME)?.value);
  const wifiMap = parseBoothWifi(jar.get(BOOTH_WIFI_COOKIE_NAME)?.value);
  const kitMap = parseBoothKit(jar.get(BOOTH_KIT_COOKIE_NAME)?.value);
  const driverMap = parseBoothDriver(jar.get(BOOTH_DRIVER_COOKIE_NAME)?.value);
  const playerMap = parseBoothPlayer(jar.get(BOOTH_PLAYER_COOKIE_NAME)?.value);
  const spiderMap = parseBoothSpider(jar.get(BOOTH_SPIDER_COOKIE_NAME)?.value);
  const mirrorMap = parseBoothMirror(jar.get(BOOTH_MIRROR_COOKIE_NAME)?.value);
  const clampMap = parseBoothClamp(jar.get(BOOTH_CLAMP_COOKIE_NAME)?.value);
  const spongeMap = parseBoothSponge(jar.get(BOOTH_SPONGE_COOKIE_NAME)?.value);
  const spindleMap = parseBoothSpindle(jar.get(BOOTH_SPINDLE_COOKIE_NAME)?.value);
  const slipmatMap = parseBoothSlipmat(jar.get(BOOTH_SLIPMAT_COOKIE_NAME)?.value);
  const trivetMap = parseBoothTrivet(jar.get(BOOTH_TRIVET_COOKIE_NAME)?.value);
  const thimbleMap = parseBoothThimble(jar.get(BOOTH_THIMBLE_COOKIE_NAME)?.value);
  const spudgerMap = parseBoothSpudger(jar.get(BOOTH_SPUDGER_COOKIE_NAME)?.value);
  const funnelMap = parseBoothFunnel(jar.get(BOOTH_FUNNEL_COOKIE_NAME)?.value);
  const preampMap = parseBoothPreamp(jar.get(BOOTH_PREAMP_COOKIE_NAME)?.value);
  const squareMap = parseBoothSquare(jar.get(BOOTH_SQUARE_COOKIE_NAME)?.value);
  const jigMap = parseBoothJig(jar.get(BOOTH_JIG_COOKIE_NAME)?.value);
  const wickMap = parseBoothWick(jar.get(BOOTH_WICK_COOKIE_NAME)?.value);
  const lastMap = parseBoothLast(jar.get(BOOTH_LAST_COOKIE_NAME)?.value);
  const caliperMap = parseBoothCaliper(jar.get(BOOTH_CALIPER_COOKIE_NAME)?.value);
  const ricerMap = parseBoothRicer(jar.get(BOOTH_RICER_COOKIE_NAME)?.value);
  const mandrelMap = parseBoothMandrel(jar.get(BOOTH_MANDREL_COOKIE_NAME)?.value);
  const ponyMap = parseBoothPony(jar.get(BOOTH_PONY_COOKIE_NAME)?.value);
  const malletMap = parseBoothMallet(jar.get(BOOTH_MALLET_COOKIE_NAME)?.value);
  const snipsMap = parseBoothSnips(jar.get(BOOTH_SNIPS_COOKIE_NAME)?.value);
  const stropMap = parseBoothStrop(jar.get(BOOTH_STROP_COOKIE_NAME)?.value);
  const driftMap = parseBoothDrift(jar.get(BOOTH_DRIFT_COOKIE_NAME)?.value);
  const boneMap = parseBoothBone(jar.get(BOOTH_BONE_COOKIE_NAME)?.value);
  const tweezersMap = parseBoothTweezers(
    jar.get(BOOTH_TWEEZERS_COOKIE_NAME)?.value,
  );
  const on = lotOn(rows);
  const off = lotOff(rows);

  if (rows.length === 0) {
    return (
      <>
        <script dangerouslySetInnerHTML={{ __html: PACKED_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BACK_SOON_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: MOVED_SPOT_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_COVER_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: EARLY_FOLD_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BREAK_BILLS_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: TABLE_SHARE_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_STAY_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_SHADE_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_FILM_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_KIDS_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_POLY_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_WRAP_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_SHELL_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_STICK_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_DIG_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_STACK_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_MATCH_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_SEAT_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_FIX_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_BURN_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_DECK_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_SEW_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_PRINT_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_CLAIM_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_NAME_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_POSE_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_POUR_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_BULB_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_METER_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_COPY_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_SHRINK_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_DISHES_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_BUTTONS_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_HARP_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_FLASH_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_RELOAD_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_INNERS_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_PINS_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_FOIL_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_WIFI_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_KIT_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_DRIVER_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_PLAYER_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_SPIDER_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_MIRROR_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_CLAMP_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_SPONGE_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_SPINDLE_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_SLIPMAT_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_TRIVET_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_THIMBLE_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_SPUDGER_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_FUNNEL_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_PREAMP_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_SQUARE_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_JIG_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_WICK_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_LAST_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_CALIPER_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_RICER_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_MANDREL_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_PONY_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_MALLET_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_SNIPS_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_STROP_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_DRIFT_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_BONE_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_TWEEZERS_MIRROR_SCRIPT }} />
        <LotEmpty />
      </>
    );
  }

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: PACKED_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BACK_SOON_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: MOVED_SPOT_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_COVER_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: EARLY_FOLD_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BREAK_BILLS_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: TABLE_SHARE_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_STAY_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_SHADE_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_FILM_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_KIDS_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_POLY_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_WRAP_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_SHELL_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_STICK_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_DIG_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_STACK_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_MATCH_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_SEAT_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_FIX_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_BURN_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_DECK_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_SEW_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_PRINT_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_CLAIM_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_NAME_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_POSE_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_POUR_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_BULB_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_METER_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_COPY_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_SHRINK_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_DISHES_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_BUTTONS_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_HARP_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_FLASH_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_RELOAD_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_INNERS_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_PINS_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_FOIL_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_WIFI_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_KIT_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_DRIVER_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_PLAYER_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_SPIDER_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_MIRROR_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_CLAMP_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_SPONGE_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_SPINDLE_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_SLIPMAT_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_TRIVET_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_THIMBLE_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_SPUDGER_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_FUNNEL_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_PREAMP_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_SQUARE_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_JIG_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_WICK_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_LAST_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_CALIPER_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_RICER_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_MANDREL_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_PONY_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_MALLET_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_SNIPS_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_STROP_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_DRIFT_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_BONE_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_TWEEZERS_MIRROR_SCRIPT }} />
      <div>
        <MallHero>
          <MallCrumb label="Lot location">
            <CrumbSep />
            <span className="text-foreground">Who set up</span>
          </MallCrumb>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              This weekend
            </Badge>
            <Badge variant="outline" className="rounded-full">
              Not a lookbook
            </Badge>
            <Badge variant="outline" className="rounded-full">
              Not this week&apos;s picks
            </Badge>
          </div>

          <div className="max-w-2xl space-y-4">
            <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
              Who set up.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              The lot map. Which folding tables came, which went in the car.
              Not a lookbook. Not this week&apos;s picks.
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            {on.length} {on.length === 1 ? "booth" : "booths"} on the lot
            {off.length > 0
              ? ` · ${off.length} ${off.length === 1 ? "booth" : "booths"} off the lot`
              : null}
          </p>
        </MallHero>

        <MallSection>
          <div className="max-w-2xl">
            <MallEyebrow>On the lot</MallEyebrow>
            <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
              Tables that came.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Still-here is a count, not a grid of lamps. Open the stall if you
              want the junk.
            </p>
          </div>

          {on.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">
              Every table went in the car. Files in the folder still exist.
            </p>
          ) : (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {on.map((row) => (
                <li key={row.stall.id} className="min-w-0">
                  <LotBoothCard
                    row={row}
                    lunchNote={lunchMap[row.stall.id]?.note}
                    spotNote={spotMap[row.stall.id]?.note}
                    sitterName={coverSitterFor(row.stall.id, coverMap)?.boothName}
                    foldNote={foldMap[row.stall.id]?.note}
                    breakNote={breakMap[row.stall.id]?.note}
                    sharerName={sharePartnerFor(row.stall.id, shareMap)?.boothName}
                    stayNote={stayMap[row.stall.id]?.note}
                    shadeNote={shadeMap[row.stall.id]?.note}
                    filmNote={filmMap[row.stall.id]?.note}
                    kidsNote={kidsMap[row.stall.id]?.note}
                    polyNote={polyMap[row.stall.id]?.note}
                    wrapNote={wrapMap[row.stall.id]?.note}
                    shellNote={shellMap[row.stall.id]?.note}
                    stickNote={stickMap[row.stall.id]?.note}
                    digNote={digMap[row.stall.id]?.note}
                    stackNote={stackMap[row.stall.id]?.note}
                    matchNote={matchMap[row.stall.id]?.note}
                    seatNote={seatMap[row.stall.id]?.note}
                    fixNote={fixMap[row.stall.id]?.note}
                    burnNote={burnMap[row.stall.id]?.note}
                    deckNote={deckMap[row.stall.id]?.note}
                    sewNote={sewMap[row.stall.id]?.note}
                    printNote={printMap[row.stall.id]?.note}
                    claimNote={claimMap[row.stall.id]?.note}
                    nameNote={nameMap[row.stall.id]?.note}
                    poseNote={poseMap[row.stall.id]?.note}
                    pourNote={pourMap[row.stall.id]?.note}
                    bulbNote={bulbMap[row.stall.id]?.note}
                    meterNote={meterMap[row.stall.id]?.note}
                    copyNote={copyMap[row.stall.id]?.note}
                    shrinkNote={shrinkMap[row.stall.id]?.note}
                    dishesNote={dishesMap[row.stall.id]?.note}
                    buttonsNote={buttonsMap[row.stall.id]?.note}
                    harpNote={harpMap[row.stall.id]?.note}
                    flashNote={flashMap[row.stall.id]?.note}
                    reloadNote={reloadMap[row.stall.id]?.note}
                    innersNote={innersMap[row.stall.id]?.note}
                    pinsNote={pinsMap[row.stall.id]?.note}
                    foilNote={foilMap[row.stall.id]?.note}
                    wifiNote={wifiMap[row.stall.id]?.note}
                    kitNote={kitMap[row.stall.id]?.note}
                    driverNote={driverMap[row.stall.id]?.note}
                    playerNote={playerMap[row.stall.id]?.note}
                    spiderNote={spiderMap[row.stall.id]?.note}
                    mirrorNote={mirrorMap[row.stall.id]?.note}
                    clampNote={clampMap[row.stall.id]?.note}
                    spongeNote={spongeMap[row.stall.id]?.note}
                    spindleNote={spindleMap[row.stall.id]?.note}
                    slipmatNote={slipmatMap[row.stall.id]?.note}
                    trivetNote={trivetMap[row.stall.id]?.note}
                    thimbleNote={thimbleMap[row.stall.id]?.note}
                    spudgerNote={spudgerMap[row.stall.id]?.note}
                    funnelNote={funnelMap[row.stall.id]?.note}
                    preampNote={preampMap[row.stall.id]?.note}
                    squareNote={squareMap[row.stall.id]?.note}
                    jigNote={jigMap[row.stall.id]?.note}
                    wickNote={wickMap[row.stall.id]?.note}
                    lastNote={lastMap[row.stall.id]?.note}
                    caliperNote={caliperMap[row.stall.id]?.note}
                    ricerNote={ricerMap[row.stall.id]?.note}
                    mandrelNote={mandrelMap[row.stall.id]?.note}
                    ponyNote={ponyMap[row.stall.id]?.note}
                    malletNote={malletMap[row.stall.id]?.note}
                    snipsNote={snipsMap[row.stall.id]?.note}
                    stropNote={stropMap[row.stall.id]?.note}
                    driftNote={driftMap[row.stall.id]?.note}
                    boneNote={boneMap[row.stall.id]?.note}
                    tweezersNote={tweezersMap[row.stall.id]?.note}
                  />
                </li>
              ))}
            </ul>
          )}
        </MallSection>

        {off.length > 0 ? (
          <MallSection className="border-t border-border bg-card/60">
            <div className="max-w-2xl">
              <MallEyebrow>Off the lot</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
                In the car.
              </h2>
              <p className="mt-3 text-muted-foreground">
                Packed for the week. Not a sold sticker. Not a refund.
              </p>
            </div>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {off.map((row) => (
                <li key={row.stall.id} className="min-w-0">
                  <LotBoothCard
                    row={row}
                    lunchNote={lunchMap[row.stall.id]?.note}
                    spotNote={spotMap[row.stall.id]?.note}
                    sitterName={coverSitterFor(row.stall.id, coverMap)?.boothName}
                    foldNote={foldMap[row.stall.id]?.note}
                    breakNote={breakMap[row.stall.id]?.note}
                    sharerName={sharePartnerFor(row.stall.id, shareMap)?.boothName}
                    stayNote={stayMap[row.stall.id]?.note}
                    shadeNote={shadeMap[row.stall.id]?.note}
                    filmNote={filmMap[row.stall.id]?.note}
                    kidsNote={kidsMap[row.stall.id]?.note}
                    polyNote={polyMap[row.stall.id]?.note}
                    wrapNote={wrapMap[row.stall.id]?.note}
                    shellNote={shellMap[row.stall.id]?.note}
                    stickNote={stickMap[row.stall.id]?.note}
                    digNote={digMap[row.stall.id]?.note}
                    stackNote={stackMap[row.stall.id]?.note}
                    matchNote={matchMap[row.stall.id]?.note}
                    seatNote={seatMap[row.stall.id]?.note}
                    fixNote={fixMap[row.stall.id]?.note}
                    burnNote={burnMap[row.stall.id]?.note}
                    deckNote={deckMap[row.stall.id]?.note}
                    sewNote={sewMap[row.stall.id]?.note}
                    printNote={printMap[row.stall.id]?.note}
                    claimNote={claimMap[row.stall.id]?.note}
                    nameNote={nameMap[row.stall.id]?.note}
                    poseNote={poseMap[row.stall.id]?.note}
                    pourNote={pourMap[row.stall.id]?.note}
                    bulbNote={bulbMap[row.stall.id]?.note}
                    meterNote={meterMap[row.stall.id]?.note}
                    copyNote={copyMap[row.stall.id]?.note}
                    shrinkNote={shrinkMap[row.stall.id]?.note}
                    dishesNote={dishesMap[row.stall.id]?.note}
                    buttonsNote={buttonsMap[row.stall.id]?.note}
                    harpNote={harpMap[row.stall.id]?.note}
                    flashNote={flashMap[row.stall.id]?.note}
                    reloadNote={reloadMap[row.stall.id]?.note}
                    innersNote={innersMap[row.stall.id]?.note}
                    pinsNote={pinsMap[row.stall.id]?.note}
                    foilNote={foilMap[row.stall.id]?.note}
                    wifiNote={wifiMap[row.stall.id]?.note}
                    kitNote={kitMap[row.stall.id]?.note}
                    driverNote={driverMap[row.stall.id]?.note}
                    playerNote={playerMap[row.stall.id]?.note}
                    spiderNote={spiderMap[row.stall.id]?.note}
                    mirrorNote={mirrorMap[row.stall.id]?.note}
                    clampNote={clampMap[row.stall.id]?.note}
                    spongeNote={spongeMap[row.stall.id]?.note}
                    spindleNote={spindleMap[row.stall.id]?.note}
                    slipmatNote={slipmatMap[row.stall.id]?.note}
                    trivetNote={trivetMap[row.stall.id]?.note}
                    thimbleNote={thimbleMap[row.stall.id]?.note}
                    spudgerNote={spudgerMap[row.stall.id]?.note}
                    funnelNote={funnelMap[row.stall.id]?.note}
                    preampNote={preampMap[row.stall.id]?.note}
                    squareNote={squareMap[row.stall.id]?.note}
                    jigNote={jigMap[row.stall.id]?.note}
                    wickNote={wickMap[row.stall.id]?.note}
                    lastNote={lastMap[row.stall.id]?.note}
                    caliperNote={caliperMap[row.stall.id]?.note}
                    ricerNote={ricerMap[row.stall.id]?.note}
                    mandrelNote={mandrelMap[row.stall.id]?.note}
                    ponyNote={ponyMap[row.stall.id]?.note}
                    malletNote={malletMap[row.stall.id]?.note}
                    snipsNote={snipsMap[row.stall.id]?.note}
                    stropNote={stropMap[row.stall.id]?.note}
                    driftNote={driftMap[row.stall.id]?.note}
                    boneNote={boneMap[row.stall.id]?.note}
                    tweezersNote={tweezersMap[row.stall.id]?.note}
                  />
                </li>
              ))}
            </ul>
          </MallSection>
        ) : null}

        <MallSection className="border-t border-border bg-card/60">
          <MallEyebrow>Not this map</MallEyebrow>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Explore is still the concourse. This week is an editorial rack.
            The lot is who came.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="rounded-full px-5"
              render={<Link href="/explore" />}
            >
              Walk the concourse
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-5"
              render={<Link href={thisWeekPath()} />}
            >
              This week&apos;s picks
            </Button>
            <Button
              className="rounded-full px-5"
              render={<Link href={lotPath()} />}
            >
              Stay on the lot
            </Button>
          </div>
        </MallSection>
      </div>
    </>
  );
}
