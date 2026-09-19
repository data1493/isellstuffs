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
  canTapeGrease,
  isListingGreaseOverlay,
  readGreaseListingIds,
  subscribeGrease,
} from "@/lib/listing-grease";
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
  canTapeLog,
  isListingLogOverlay,
  readLogListingIds,
  subscribeLog,
} from "@/lib/listing-log";
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
  canTapeConsult,
  isListingConsultOverlay,
  readConsultListingIds,
  subscribeConsult,
} from "@/lib/listing-consult";
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
  canTapeMaster,
  isListingMasterOverlay,
  readMasterListingIds,
  subscribeMaster,
} from "@/lib/listing-master";
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
  canTapeLining,
  isListingLiningOverlay,
  readLiningListingIds,
  subscribeLining,
} from "@/lib/listing-lining";
import {
  canTapeHood,
  isListingHoodOverlay,
  readHoodListingIds,
  subscribeHood,
} from "@/lib/listing-hood";
import {
  canTapeDongle,
  isListingDongleOverlay,
  readDongleListingIds,
  subscribeDongle,
} from "@/lib/listing-dongle";
import {
  canTapeBeep,
  isListingBeepOverlay,
  readBeepListingIds,
  subscribeBeep,
} from "@/lib/listing-beep";
import {
  canTapeLabel,
  isListingLabelOverlay,
  readLabelListingIds,
  subscribeLabel,
} from "@/lib/listing-label";
import {
  canTapeRecap,
  isListingRecapOverlay,
  readRecapListingIds,
  subscribeRecap,
} from "@/lib/listing-recap";
import {
  canTapeEven,
  isListingEvenOverlay,
  readEvenListingIds,
  subscribeEven,
} from "@/lib/listing-even";
import {
  canTapeCement,
  isListingCementOverlay,
  readCementListingIds,
  subscribeCement,
} from "@/lib/listing-cement";
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
  canTapeWarp,
  isListingWarpOverlay,
  readWarpListingIds,
  subscribeWarp,
} from "@/lib/listing-warp";
import {
  canTapeSplice,
  isListingSpliceOverlay,
  readSpliceListingIds,
  subscribeSplice,
} from "@/lib/listing-splice";
import {
  canTapeRadio,
  isListingRadioOverlay,
  readRadioListingIds,
  subscribeRadio,
} from "@/lib/listing-radio";
import {
  canTapeVent,
  isListingVentOverlay,
  readVentListingIds,
  subscribeVent,
} from "@/lib/listing-vent";
import {
  canTapeGasket,
  isListingGasketOverlay,
  readGasketListingIds,
  subscribeGasket,
} from "@/lib/listing-gasket";
import {
  canTapeGlow,
  isListingGlowOverlay,
  readGlowListingIds,
  subscribeGlow,
} from "@/lib/listing-glow";
import {
  canTapeEtch,
  isListingEtchOverlay,
  readEtchListingIds,
  subscribeEtch,
} from "@/lib/listing-etch";
import {
  canTapePad,
  isListingPadOverlay,
  readPadListingIds,
  subscribePad,
} from "@/lib/listing-pad";
import {
  canTapeShim,
  isListingShimOverlay,
  readShimListingIds,
  subscribeShim,
} from "@/lib/listing-shim";
import {
  canTapeFill,
  isListingFillOverlay,
  readFillListingIds,
  subscribeFill,
} from "@/lib/listing-fill";
import {
  canTapeWind,
  isListingWindOverlay,
  readWindListingIds,
  subscribeWind,
} from "@/lib/listing-wind";
import {
  canTapeSocket,
  isListingSocketOverlay,
  readSocketListingIds,
  subscribeSocket,
} from "@/lib/listing-socket";
import {
  canTapeSpeaker,
  isListingSpeakerOverlay,
  readSpeakerListingIds,
  subscribeSpeaker,
} from "@/lib/listing-speaker";
import {
  canTapeCoil,
  isListingCoilOverlay,
  readCoilListingIds,
  subscribeCoil,
} from "@/lib/listing-coil";
import {
  canTapeFerrite,
  isListingFerriteOverlay,
  readFerriteListingIds,
  subscribeFerrite,
} from "@/lib/listing-ferrite";
import {
  canTapeSand,
  isListingSandOverlay,
  readSandListingIds,
  subscribeSand,
} from "@/lib/listing-sand";
import {
  canTapeContents,
  isListingContentsOverlay,
  readContentsListingIds,
  subscribeContents,
} from "@/lib/listing-contents";
import {
  canTapeDub,
  isListingDubOverlay,
  readDubListingIds,
  subscribeDub,
} from "@/lib/listing-dub";
import {
  canTapeStitch,
  isListingStitchOverlay,
  readStitchListingIds,
  subscribeStitch,
} from "@/lib/listing-stitch";
import {
  canTapeCinch,
  isListingCinchOverlay,
  readCinchListingIds,
  subscribeCinch,
} from "@/lib/listing-cinch";
import {
  canTapeFinalize,
  isListingFinalizeOverlay,
  readFinalizeListingIds,
  subscribeFinalize,
} from "@/lib/listing-finalize";
import {
  canTapeAzimuth,
  isListingAzimuthOverlay,
  readAzimuthListingIds,
  subscribeAzimuth,
} from "@/lib/listing-azimuth";
import {
  canTapeNest,
  isListingNestOverlay,
  readNestListingIds,
  subscribeNest,
} from "@/lib/listing-nest";
import {
  canTapeFoam,
  isListingFoamOverlay,
  readFoamListingIds,
  subscribeFoam,
} from "@/lib/listing-foam";
import {
  canTapeAnneal,
  isListingAnnealOverlay,
  readAnnealListingIds,
  subscribeAnneal,
} from "@/lib/listing-anneal";
import {
  canTapeGrommet,
  isListingGrommetOverlay,
  readGrommetListingIds,
  subscribeGrommet,
} from "@/lib/listing-grommet";
import {
  canTapeDart,
  isListingDartOverlay,
  readDartListingIds,
  subscribeDart,
} from "@/lib/listing-dart";
import {
  canTapeContrast,
  isListingContrastOverlay,
  readContrastListingIds,
  subscribeContrast,
} from "@/lib/listing-contrast";
import {
  canTapeTin,
  isListingTinOverlay,
  readTinListingIds,
  subscribeTin,
} from "@/lib/listing-tin";
import {
  canTapeLathe,
  isListingLatheOverlay,
  readLatheListingIds,
  subscribeLathe,
} from "@/lib/listing-lathe";
import {
  canTapeHandle,
  isListingHandleOverlay,
  readHandleListingIds,
  subscribeHandle,
} from "@/lib/listing-handle";
import {
  canTapeDegauss,
  isListingDegaussOverlay,
  readDegaussListingIds,
  subscribeDegauss,
} from "@/lib/listing-degauss";
import {
  canTapeKnurl,
  isListingKnurlOverlay,
  readKnurlListingIds,
  subscribeKnurl,
} from "@/lib/listing-knurl";
import {
  canTapeRivet,
  isListingRivetOverlay,
  readRivetListingIds,
  subscribeRivet,
} from "@/lib/listing-rivet";
import {
  canTapeBraid,
  isListingBraidOverlay,
  readBraidListingIds,
  subscribeBraid,
} from "@/lib/listing-braid";
import {
  canTapePaginate,
  isListingPaginateOverlay,
  readPaginateListingIds,
  subscribePaginate,
} from "@/lib/listing-paginate";
import {
  canTapeScale,
  isListingScaleOverlay,
  readScaleListingIds,
  subscribeScale,
} from "@/lib/listing-scale";
import {
  canTapeGate,
  isListingGateOverlay,
  readGateListingIds,
  subscribeGate,
} from "@/lib/listing-gate";
import {
  canTapeTune,
  isListingTuneOverlay,
  readTuneListingIds,
  subscribeTune,
} from "@/lib/listing-tune";
import {
  canTapeNorm,
  isListingNormOverlay,
  readNormListingIds,
  subscribeNorm,
} from "@/lib/listing-norm";
import {
  canTapeCrush,
  isListingCrushOverlay,
  readCrushListingIds,
  subscribeCrush,
} from "@/lib/listing-crush";
import {
  canTapeVariable,
  isListingVariableOverlay,
  readVariableListingIds,
  subscribeVariable,
} from "@/lib/listing-variable";
import {
  canTapeLigature,
  isListingLigatureOverlay,
  readLigatureListingIds,
  subscribeLigature,
} from "@/lib/listing-ligature";
import {
  canTapeRights,
  isListingRightsOverlay,
  readRightsListingIds,
  subscribeRights,
} from "@/lib/listing-rights";
import {
  canTapeVerso,
  isListingVersoOverlay,
  readVersoListingIds,
  subscribeVerso,
} from "@/lib/listing-verso";
import {
  canTapeYear,
  isListingYearOverlay,
  readYearListingIds,
  subscribeYear,
} from "@/lib/listing-year";
import {
  canTapeIcons,
  isListingIconsOverlay,
  readIconsListingIds,
  subscribeIcons,
} from "@/lib/listing-icons";
import {
  canTapeHint,
  isListingHintOverlay,
  readHintListingIds,
  subscribeHint,
} from "@/lib/listing-hint";
import {
  canTapeProfile,
  isListingProfileOverlay,
  readProfileListingIds,
  subscribeProfile,
} from "@/lib/listing-profile";
import {
  canTapeBold,
  isListingBoldOverlay,
  readBoldListingIds,
  subscribeBold,
} from "@/lib/listing-bold";
import {
  canTapeGum,
  isListingGumOverlay,
  readGumListingIds,
  subscribeGum,
} from "@/lib/listing-gum";
import {
  listingCardsWritePath,
  listingGreaseWritePath,
  listingDoubleWritePath,
  listingMinsWritePath,
  listingDumpWritePath,
  listingGlueWritePath,
  listingGlassWritePath,
  listingPolishWritePath,
  listingTrayWritePath,
  listingMasterWritePath,
  listingGumWritePath,
  listingInsideWritePath,
  listingTinesWritePath,
  listingRustWritePath,
  listingCapWritePath,
  listingSaucerWritePath,
  listingLedWritePath,
  listingCastWritePath,
  listingSprayWritePath,
  listingLiningWritePath,
  listingHoodWritePath,
  listingDongleWritePath,
  listingBeepWritePath,
  listingLabelWritePath,
  listingRecapWritePath,
  listingGlowWritePath,
  listingEtchWritePath,
  listingPadWritePath,
  listingShimWritePath,
  listingFillWritePath,
  listingWindWritePath,
  listingSocketWritePath,
  listingSpeakerWritePath,
  listingCoilWritePath,
  listingFerriteWritePath,
  listingSandWritePath,
  listingContentsWritePath,
  listingDubWritePath,
  listingStitchWritePath,
  listingCinchWritePath,
  listingFinalizeWritePath,
  listingAzimuthWritePath,
  listingNestWritePath,
  listingFoamWritePath,
  listingAnnealWritePath,
  listingGrommetWritePath,
  listingDartWritePath,
  listingTinWritePath,
  listingLatheWritePath,
  listingHandleWritePath,
  listingDegaussWritePath,
  listingKnurlWritePath,
  listingRivetWritePath,
  listingBraidWritePath,
  listingPaginateWritePath,
  listingScaleWritePath,
  listingGateWritePath,
  listingContrastWritePath,
  listingEvenWritePath,
  listingCementWritePath,
  listingLinkWritePath,
  listingCenterWritePath,
  listingWarpWritePath,
  listingSpliceWritePath,
  listingRadioWritePath,
  listingVentWritePath,
  listingGasketWritePath,
  listingLoopWritePath,
  listingTuneWritePath,
  listingNormWritePath,
  listingCrushWritePath,
  listingRightsWritePath,
  listingVersoWritePath,
  listingYearWritePath,
  listingIconsWritePath,
  listingHintWritePath,
  listingProfileWritePath,
  listingBoldWritePath,
  listingVariableWritePath,
  listingLigatureWritePath,
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
  listingLogWritePath,
  listingTypesetWritePath,
  listingReviseWritePath,
  listingGridWritePath,
  listingConsultWritePath,
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
  const [greaseIds, setGreaseIds] = useState<string[]>([]);
  const [zipIds, setZipIds] = useState<string[]>([]);
  const [shotIds, setShotIds] = useState<string[]>([]);
  const [warmIds, setWarmIds] = useState<string[]>([]);
  const [balanceIds, setBalanceIds] = useState<string[]>([]);
  const [logIds, setLogIds] = useState<string[]>([]);
  const [whoseIds, setWhoseIds] = useState<string[]>([]);
  const [typesetIds, setTypesetIds] = useState<string[]>([]);
  const [reviseIds, setReviseIds] = useState<string[]>([]);
  const [gridIds, setGridIds] = useState<string[]>([]);
  const [consultIds, setConsultIds] = useState<string[]>([]);
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
  const [masterIds, setMasterIds] = useState<string[]>([]);
  const [gumIds, setGumIds] = useState<string[]>([]);
  const [insideIds, setInsideIds] = useState<string[]>([]);
  const [tinesIds, setTinesIds] = useState<string[]>([]);
  const [rustIds, setRustIds] = useState<string[]>([]);
  const [capIds, setCapIds] = useState<string[]>([]);
  const [saucerIds, setSaucerIds] = useState<string[]>([]);
  const [ledIds, setLedIds] = useState<string[]>([]);
  const [castIds, setCastIds] = useState<string[]>([]);
  const [sprayIds, setSprayIds] = useState<string[]>([]);
  const [liningIds, setLiningIds] = useState<string[]>([]);
  const [hoodIds, setHoodIds] = useState<string[]>([]);
  const [dongleIds, setDongleIds] = useState<string[]>([]);
  const [beepIds, setBeepIds] = useState<string[]>([]);
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [recapIds, setRecapIds] = useState<string[]>([]);
  const [glowIds, setGlowIds] = useState<string[]>([]);
  const [evenIds, setEvenIds] = useState<string[]>([]);
  const [cementIds, setCementIds] = useState<string[]>([]);
  const [linkIds, setLinkIds] = useState<string[]>([]);
  const [centerIds, setCenterIds] = useState<string[]>([]);
  const [warpIds, setWarpIds] = useState<string[]>([]);
  const [etchIds, setEtchIds] = useState<string[]>([]);
  const [padIds, setPadIds] = useState<string[]>([]);
  const [shimIds, setShimIds] = useState<string[]>([]);
  const [fillIds, setFillIds] = useState<string[]>([]);
  const [windIds, setWindIds] = useState<string[]>([]);
  const [socketIds, setSocketIds] = useState<string[]>([]);
  const [speakerIds, setSpeakerIds] = useState<string[]>([]);
  const [coilIds, setCoilIds] = useState<string[]>([]);
  const [ferriteIds, setFerriteIds] = useState<string[]>([]);
  const [sandIds, setSandIds] = useState<string[]>([]);
  const [contentsIds, setContentsIds] = useState<string[]>([]);
  const [dubIds, setDubIds] = useState<string[]>([]);
  const [stitchIds, setStitchIds] = useState<string[]>([]);
  const [cinchIds, setCinchIds] = useState<string[]>([]);
  const [finalizeIds, setFinalizeIds] = useState<string[]>([]);
  const [azimuthIds, setAzimuthIds] = useState<string[]>([]);
  const [nestIds, setNestIds] = useState<string[]>([]);
  const [foamIds, setFoamIds] = useState<string[]>([]);
  const [annealIds, setAnnealIds] = useState<string[]>([]);
  const [grommetIds, setGrommetIds] = useState<string[]>([]);
  const [dartIds, setDartIds] = useState<string[]>([]);
  const [contrastIds, setContrastIds] = useState<string[]>([]);
  const [tinIds, setTinIds] = useState<string[]>([]);
  const [latheIds, setLatheIds] = useState<string[]>([]);
  const [handleIds, setHandleIds] = useState<string[]>([]);
  const [degaussIds, setDegaussIds] = useState<string[]>([]);
  const [knurlIds, setKnurlIds] = useState<string[]>([]);
  const [rivetIds, setRivetIds] = useState<string[]>([]);
  const [braidIds, setBraidIds] = useState<string[]>([]);
  const [spliceIds, setSpliceIds] = useState<string[]>([]);
  const [radioIds, setRadioIds] = useState<string[]>([]);
  const [ventIds, setVentIds] = useState<string[]>([]);
  const [gasketIds, setGasketIds] = useState<string[]>([]);
  const [tuneIds, setTuneIds] = useState<string[]>([]);
  const [normIds, setNormIds] = useState<string[]>([]);
  const [crushIds, setCrushIds] = useState<string[]>([]);
  const [rightsIds, setRightsIds] = useState<string[]>([]);
  const [versoIds, setVersoIds] = useState<string[]>([]);
  const [yearIds, setYearIds] = useState<string[]>([]);
  const [iconsIds, setIconsIds] = useState<string[]>([]);
  const [hintIds, setHintIds] = useState<string[]>([]);
  const [profileIds, setProfileIds] = useState<string[]>([]);
  const [boldIds, setBoldIds] = useState<string[]>([]);
  const [variableIds, setVariableIds] = useState<string[]>([]);
  const [ligatureIds, setLigatureIds] = useState<string[]>([]);
  const [paginateIds, setPaginateIds] = useState<string[]>([]);
  const [scaleIds, setScaleIds] = useState<string[]>([]);
  const [gateIds, setGateIds] = useState<string[]>([]);
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
      setGreaseIds(readGreaseListingIds());
      setZipIds(readZipListingIds());
      setShotIds(readShotListingIds());
      setWarmIds(readWarmListingIds());
      setBalanceIds(readBalanceListingIds());
      setLogIds(readLogListingIds());
      setWhoseIds(readWhoseListingIds());
      setTypesetIds(readTypesetListingIds());
      setReviseIds(readReviseListingIds());
      setGridIds(readGridListingIds());
      setConsultIds(readConsultListingIds());
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
      setMasterIds(readMasterListingIds());
      setGumIds(readGumListingIds());
      setInsideIds(readInsideListingIds());
      setTinesIds(readTinesListingIds());
      setRustIds(readRustListingIds());
      setCapIds(readCapListingIds());
      setSaucerIds(readSaucerListingIds());
      setLedIds(readLedListingIds());
      setCastIds(readCastListingIds());
      setSprayIds(readSprayListingIds());
      setLiningIds(readLiningListingIds());
      setHoodIds(readHoodListingIds());
      setDongleIds(readDongleListingIds());
      setBeepIds(readBeepListingIds());
      setLabelIds(readLabelListingIds());
      setRecapIds(readRecapListingIds());
      setGlowIds(readGlowListingIds());
      setEvenIds(readEvenListingIds());
      setCementIds(readCementListingIds());
      setLinkIds(readLinkListingIds());
      setCenterIds(readCenterListingIds());
      setWarpIds(readWarpListingIds());
      setEtchIds(readEtchListingIds());
      setPadIds(readPadListingIds());
      setShimIds(readShimListingIds());
      setFillIds(readFillListingIds());
      setWindIds(readWindListingIds());
      setSocketIds(readSocketListingIds());
      setSpeakerIds(readSpeakerListingIds());
      setCoilIds(readCoilListingIds());
      setFerriteIds(readFerriteListingIds());
      setSandIds(readSandListingIds());
      setContentsIds(readContentsListingIds());
      setDubIds(readDubListingIds());
      setStitchIds(readStitchListingIds());
      setCinchIds(readCinchListingIds());
      setFinalizeIds(readFinalizeListingIds());
      setAzimuthIds(readAzimuthListingIds());
      setNestIds(readNestListingIds());
      setFoamIds(readFoamListingIds());
      setAnnealIds(readAnnealListingIds());
      setGrommetIds(readGrommetListingIds());
      setDartIds(readDartListingIds());
      setContrastIds(readContrastListingIds());
      setTinIds(readTinListingIds());
      setLatheIds(readLatheListingIds());
      setHandleIds(readHandleListingIds());
      setDegaussIds(readDegaussListingIds());
      setKnurlIds(readKnurlListingIds());
      setRivetIds(readRivetListingIds());
      setBraidIds(readBraidListingIds());
      setSpliceIds(readSpliceListingIds());
      setRadioIds(readRadioListingIds());
      setVentIds(readVentListingIds());
      setGasketIds(readGasketListingIds());
      setTuneIds(readTuneListingIds());
      setNormIds(readNormListingIds());
      setCrushIds(readCrushListingIds());
      setRightsIds(readRightsListingIds());
      setVersoIds(readVersoListingIds());
      setYearIds(readYearListingIds());
      setIconsIds(readIconsListingIds());
      setHintIds(readHintListingIds());
      setProfileIds(readProfileListingIds());
      setBoldIds(readBoldListingIds());
      setVariableIds(readVariableListingIds());
      setLigatureIds(readLigatureListingIds());
      setPaginateIds(readPaginateListingIds());
      setScaleIds(readScaleListingIds());
      setGateIds(readGateListingIds());
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
    const unsubGrease = subscribeGrease(apply);
    const unsubZip = subscribeZip(apply);
    const unsubShot = subscribeShot(apply);
    const unsubWarm = subscribeWarm(apply);
    const unsubBalance = subscribeBalance(apply);
    const unsubLog = subscribeLog(apply);
    const unsubWhose = subscribeWhose(apply);
    const unsubTypeset = subscribeTypeset(apply);
    const unsubRevise = subscribeRevise(apply);
    const unsubGrid = subscribeGrid(apply);
    const unsubConsult = subscribeConsult(apply);
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
    const unsubMaster = subscribeMaster(apply);
    const unsubGum = subscribeGum(apply);
    const unsubInside = subscribeInside(apply);
    const unsubTines = subscribeTines(apply);
    const unsubRust = subscribeRust(apply);
    const unsubCap = subscribeCap(apply);
    const unsubSaucer = subscribeSaucer(apply);
    const unsubLed = subscribeLed(apply);
    const unsubCast = subscribeCast(apply);
    const unsubSpray = subscribeSpray(apply);
    const unsubLining = subscribeLining(apply);
    const unsubHood = subscribeHood(apply);
    const unsubDongle = subscribeDongle(apply);
    const unsubBeep = subscribeBeep(apply);
    const unsubLabel = subscribeLabel(apply);
    const unsubRecap = subscribeRecap(apply);
    const unsubGlow = subscribeGlow(apply);
    const unsubEven = subscribeEven(apply);
    const unsubCement = subscribeCement(apply);
    const unsubLink = subscribeLink(apply);
    const unsubCenter = subscribeCenter(apply);
    const unsubWarp = subscribeWarp(apply);
    const unsubEtch = subscribeEtch(apply);
    const unsubPad = subscribePad(apply);
    const unsubShim = subscribeShim(apply);
    const unsubFill = subscribeFill(apply);
    const unsubWind = subscribeWind(apply);
    const unsubSocket = subscribeSocket(apply);
    const unsubSpeaker = subscribeSpeaker(apply);
    const unsubCoil = subscribeCoil(apply);
    const unsubFerrite = subscribeFerrite(apply);
    const unsubSand = subscribeSand(apply);
    const unsubContents = subscribeContents(apply);
    const unsubDub = subscribeDub(apply);
    const unsubStitch = subscribeStitch(apply);
    const unsubCinch = subscribeCinch(apply);
    const unsubFinalize = subscribeFinalize(apply);
    const unsubAzimuth = subscribeAzimuth(apply);
    const unsubNest = subscribeNest(apply);
    const unsubFoam = subscribeFoam(apply);
    const unsubAnneal = subscribeAnneal(apply);
    const unsubGrommet = subscribeGrommet(apply);
    const unsubDart = subscribeDart(apply);
    const unsubContrast = subscribeContrast(apply);
    const unsubTin = subscribeTin(apply);
    const unsubLathe = subscribeLathe(apply);
    const unsubHandle = subscribeHandle(apply);
    const unsubDegauss = subscribeDegauss(apply);
    const unsubKnurl = subscribeKnurl(apply);
    const unsubRivet = subscribeRivet(apply);
    const unsubBraid = subscribeBraid(apply);
    const unsubSplice = subscribeSplice(apply);
    const unsubRadio = subscribeRadio(apply);
    const unsubVent = subscribeVent(apply);
    const unsubGasket = subscribeGasket(apply);
    const unsubTune = subscribeTune(apply);
    const unsubNorm = subscribeNorm(apply);
    const unsubCrush = subscribeCrush(apply);
    const unsubRights = subscribeRights(apply);
    const unsubVerso = subscribeVerso(apply);
    const unsubYear = subscribeYear(apply);
    const unsubIcons = subscribeIcons(apply);
    const unsubHint = subscribeHint(apply);
    const unsubProfile = subscribeProfile(apply);
    const unsubBold = subscribeBold(apply);
    const unsubVariable = subscribeVariable(apply);
    const unsubLigature = subscribeLigature(apply);
    const unsubPaginate = subscribePaginate(apply);
    const unsubScale = subscribeScale(apply);
    const unsubGate = subscribeGate(apply);
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
      unsubGrease();
      unsubZip();
      unsubShot();
      unsubWarm();
      unsubBalance();
      unsubLog();
      unsubWhose();
      unsubTypeset();
      unsubRevise();
      unsubGrid();
      unsubConsult();
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
      unsubMaster();
      unsubGum();
      unsubInside();
      unsubTines();
      unsubRust();
      unsubCap();
      unsubSaucer();
      unsubLed();
      unsubCast();
      unsubSpray();
      unsubLining();
      unsubHood();
      unsubDongle();
      unsubBeep();
      unsubLabel();
      unsubRecap();
      unsubGlow();
      unsubEven();
      unsubCement();
      unsubLink();
      unsubCenter();
      unsubWarp();
      unsubEtch();
      unsubPad();
      unsubShim();
      unsubFill();
      unsubWind();
      unsubSocket();
      unsubSpeaker();
      unsubCoil();
      unsubFerrite();
      unsubSand();
      unsubContents();
      unsubDub();
      unsubStitch();
      unsubCinch();
      unsubFinalize();
      unsubAzimuth();
      unsubNest();
      unsubFoam();
      unsubAnneal();
      unsubGrommet();
      unsubDart();
      unsubContrast();
      unsubTin();
      unsubLathe();
      unsubHandle();
      unsubDegauss();
      unsubKnurl();
      unsubRivet();
      unsubBraid();
      unsubSplice();
      unsubRadio();
      unsubVent();
      unsubGasket();
      unsubTune();
      unsubNorm();
      unsubCrush();
      unsubRights();
      unsubVerso();
      unsubYear();
      unsubIcons();
      unsubHint();
      unsubProfile();
      unsubBold();
      unsubVariable();
      unsubLigature();
      unsubPaginate();
      unsubScale();
      unsubGate();
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
                      {canTapeMaster(listing) ? (
                        <form
                          method="post"
                          action={listingMasterWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingMasterOverlay(listing.id, masterIds)
                                ? "open"
                                : "master"
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
                            {isListingMasterOverlay(listing.id, masterIds)
                              ? "Leave this burn"
                              : "I don't have the master"}
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
                      {canTapeLining(listing) ? (
                        <form
                          method="post"
                          action={listingLiningWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingLiningOverlay(listing.id, liningIds)
                                ? "open"
                                : "lining"
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
                            {isListingLiningOverlay(listing.id, liningIds)
                              ? "Leave the shell"
                              : "I don’t have a lining"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeHood(listing) ? (
                        <form
                          method="post"
                          action={listingHoodWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingHoodOverlay(listing.id, hoodIds)
                                ? "open"
                                : "hood"
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
                            {isListingHoodOverlay(listing.id, hoodIds)
                              ? "Leave the shell"
                              : "I don’t have a hood"}
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
                      {canTapeBeep(listing) ? (
                        <form
                          method="post"
                          action={listingBeepWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingBeepOverlay(listing.id, beepIds)
                                ? "open"
                                : "beep"
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
                            {isListingBeepOverlay(listing.id, beepIds)
                              ? "Leave the tangle"
                              : "I will not beep it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeLabel(listing) ? (
                        <form
                          method="post"
                          action={listingLabelWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingLabelOverlay(listing.id, labelIds)
                                ? "open"
                                : "label"
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
                            {isListingLabelOverlay(listing.id, labelIds)
                              ? "Leave the tangle"
                              : "I will not label them"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeRecap(listing) ? (
                        <form
                          method="post"
                          action={listingRecapWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingRecapOverlay(listing.id, recapIds)
                                ? "open"
                                : "recap"
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
                            {isListingRecapOverlay(listing.id, recapIds)
                              ? "Leave the save luck"
                              : "I will not recap"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeGlow(listing) ? (
                        <form
                          method="post"
                          action={listingGlowWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingGlowOverlay(listing.id, glowIds)
                                ? "open"
                                : "glow"
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
                            {isListingGlowOverlay(listing.id, glowIds)
                              ? "Leave the line"
                              : "I don't have a backlight"}
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
                      {canTapeCement(listing) ? (
                        <form
                          method="post"
                          action={listingCementWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingCementOverlay(listing.id, cementIds)
                                ? "open"
                                : "cement"
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
                            {isListingCementOverlay(listing.id, cementIds)
                              ? "Leave the peel"
                              : "I will not cement"}
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
                      {canTapeWarp(listing) ? (
                        <form
                          method="post"
                          action={listingWarpWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingWarpOverlay(listing.id, warpIds)
                                ? "open"
                                : "warp"
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
                            {isListingWarpOverlay(listing.id, warpIds)
                              ? "Leave the warp"
                              : "I will not flatten"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeEtch(listing) ? (
                        <form
                          method="post"
                          action={listingEtchWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingEtchOverlay(listing.id, etchIds)
                                ? "open"
                                : "etch"
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
                            {isListingEtchOverlay(listing.id, etchIds)
                              ? "Leave the skip"
                              : "I will not read the runout"}
                          </button>
                        </form>
                      ) : null}
                      {canTapePad(listing) ? (
                        <form
                          method="post"
                          action={listingPadWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingPadOverlay(listing.id, padIds)
                                ? "open"
                                : "pad"
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
                            {isListingPadOverlay(listing.id, padIds)
                              ? "Leave the peel"
                              : "I will not pad them"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeShim(listing) ? (
                        <form
                          method="post"
                          action={listingShimWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingShimOverlay(listing.id, shimIds)
                                ? "open"
                                : "shim"
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
                            {isListingShimOverlay(listing.id, shimIds)
                              ? "Leave the wobble"
                              : "I will not shim it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeFill(listing) ? (
                        <form
                          method="post"
                          action={listingFillWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingFillOverlay(listing.id, fillIds)
                                ? "open"
                                : "fill"
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
                            {isListingFillOverlay(listing.id, fillIds)
                              ? "Leave the empty jewel"
                              : "I will not fill it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeWind(listing) ? (
                        <form
                          method="post"
                          action={listingWindWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingWindOverlay(listing.id, windIds)
                                ? "open"
                                : "wind"
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
                            {isListingWindOverlay(listing.id, windIds)
                              ? "Leave the hiss"
                              : "I will not wind it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeSocket(listing) ? (
                        <form
                          method="post"
                          action={listingSocketWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingSocketOverlay(listing.id, socketIds)
                                ? "open"
                                : "socket"
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
                            {isListingSocketOverlay(listing.id, socketIds)
                              ? "Leave the neck"
                              : "I will not socket it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeSpeaker(listing) ? (
                        <form
                          method="post"
                          action={listingSpeakerWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingSpeakerOverlay(listing.id, speakerIds)
                                ? "open"
                                : "speaker"
                            }
                          />
                          <input
                            type="hidden"
                            name="returnTo"
                            value={sellDeskStallPath(stall.slug)}
                          />
                          <button
                            type="submit"
                            className="inline-flex h-11 w-full items-center justify-center text-sm font-medium text-foreground underline-offset-4 hover:text-foreground hover:underline sm:w-auto"
                          >
                            {isListingSpeakerOverlay(listing.id, speakerIds)
                              ? "Leave the line"
                              : "I will not speaker it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeCoil(listing) ? (
                        <form
                          method="post"
                          action={listingCoilWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingCoilOverlay(listing.id, coilIds)
                                ? "open"
                                : "coil"
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
                            {isListingCoilOverlay(listing.id, coilIds)
                              ? "Leave the tangle"
                              : "I will not coil them"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeFerrite(listing) ? (
                        <form
                          method="post"
                          action={listingFerriteWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingFerriteOverlay(listing.id, ferriteIds)
                                ? "open"
                                : "ferrite"
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
                            {isListingFerriteOverlay(listing.id, ferriteIds)
                              ? "Leave the noise"
                              : "I will not ferrite them"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeTin(listing) ? (
                        <form
                          method="post"
                          action={listingTinWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingTinOverlay(listing.id, tinIds)
                                ? "open"
                                : "tin"
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
                            {isListingTinOverlay(listing.id, tinIds)
                              ? "Leave the ends"
                              : "I will not tin them"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeBraid(listing) ? (
                        <form
                          method="post"
                          action={listingBraidWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingBraidOverlay(listing.id, braidIds)
                                ? "open"
                                : "braid"
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
                            {isListingBraidOverlay(listing.id, braidIds)
                              ? "Leave the tangle"
                              : "I will not braid them"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeLathe(listing) ? (
                        <form
                          method="post"
                          action={listingLatheWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingLatheOverlay(listing.id, latheIds)
                                ? "open"
                                : "lathe"
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
                            {isListingLatheOverlay(listing.id, latheIds)
                              ? "Leave the scratch"
                              : "I will not lathe it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeHandle(listing) ? (
                        <form
                          method="post"
                          action={listingHandleWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingHandleOverlay(listing.id, handleIds)
                                ? "open"
                                : "handle"
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
                            {isListingHandleOverlay(listing.id, handleIds)
                              ? "Leave the mug"
                              : "I will not handle it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeDegauss(listing) ? (
                        <form
                          method="post"
                          action={listingDegaussWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingDegaussOverlay(listing.id, degaussIds)
                                ? "open"
                                : "degauss"
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
                            {isListingDegaussOverlay(listing.id, degaussIds)
                              ? "Leave the tape"
                              : "I will not degauss it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeKnurl(listing) ? (
                        <form
                          method="post"
                          action={listingKnurlWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingKnurlOverlay(listing.id, knurlIds)
                                ? "open"
                                : "knurl"
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
                            {isListingKnurlOverlay(listing.id, knurlIds)
                              ? "Leave the lid"
                              : "I will not knurl it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeRivet(listing) ? (
                        <form
                          method="post"
                          action={listingRivetWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingRivetOverlay(listing.id, rivetIds)
                                ? "open"
                                : "rivet"
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
                            {isListingRivetOverlay(listing.id, rivetIds)
                              ? "Leave the shade"
                              : "I will not rivet it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeSand(listing) ? (
                        <form
                          method="post"
                          action={listingSandWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingSandOverlay(listing.id, sandIds)
                                ? "open"
                                : "sand"
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
                            {isListingSandOverlay(listing.id, sandIds)
                              ? "Leave the chip"
                              : "I will not sand it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeContents(listing) ? (
                        <form
                          method="post"
                          action={listingContentsWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingContentsOverlay(listing.id, contentsIds)
                                ? "open"
                                : "contents"
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
                            {isListingContentsOverlay(listing.id, contentsIds)
                              ? "Leave the Sharpie"
                              : "I will not list what’s on it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeDub(listing) ? (
                        <form
                          method="post"
                          action={listingDubWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingDubOverlay(listing.id, dubIds)
                                ? "open"
                                : "dub"
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
                            {isListingDubOverlay(listing.id, dubIds)
                              ? "Leave the hiss"
                              : "I will not dub it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeStitch(listing) ? (
                        <form
                          method="post"
                          action={listingStitchWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingStitchOverlay(listing.id, stitchIds)
                                ? "open"
                                : "stitch"
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
                            {isListingStitchOverlay(listing.id, stitchIds)
                              ? "Leave the split"
                              : "I will not stitch them"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeCinch(listing) ? (
                        <form
                          method="post"
                          action={listingCinchWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingCinchOverlay(listing.id, cinchIds)
                                ? "open"
                                : "cinch"
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
                            {isListingCinchOverlay(listing.id, cinchIds)
                              ? "Leave the waist"
                              : "I will not cinch it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeFinalize(listing) ? (
                        <form
                          method="post"
                          action={listingFinalizeWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingFinalizeOverlay(listing.id, finalizeIds)
                                ? "open"
                                : "finalize"
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
                            {isListingFinalizeOverlay(listing.id, finalizeIds)
                              ? "Leave the session"
                              : "I will not finalize it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeAzimuth(listing) ? (
                        <form
                          method="post"
                          action={listingAzimuthWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingAzimuthOverlay(listing.id, azimuthIds)
                                ? "open"
                                : "azimuth"
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
                            {isListingAzimuthOverlay(listing.id, azimuthIds)
                              ? "Leave the heading"
                              : "I will not azimuth it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeNest(listing) ? (
                        <form
                          method="post"
                          action={listingNestWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingNestOverlay(listing.id, nestIds)
                                ? "open"
                                : "nest"
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
                            {isListingNestOverlay(listing.id, nestIds)
                              ? "Leave the pile"
                              : "I will not nest them"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeFoam(listing) ? (
                        <form
                          method="post"
                          action={listingFoamWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingFoamOverlay(listing.id, foamIds)
                                ? "open"
                                : "foam"
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
                            {isListingFoamOverlay(listing.id, foamIds)
                              ? "Leave the pile"
                              : "I will not foam them"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeAnneal(listing) ? (
                        <form
                          method="post"
                          action={listingAnnealWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingAnnealOverlay(listing.id, annealIds)
                                ? "open"
                                : "anneal"
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
                            {isListingAnnealOverlay(listing.id, annealIds)
                              ? "Leave the splay"
                              : "I will not anneal it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeGrommet(listing) ? (
                        <form
                          method="post"
                          action={listingGrommetWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingGrommetOverlay(listing.id, grommetIds)
                                ? "open"
                                : "grommet"
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
                            {isListingGrommetOverlay(listing.id, grommetIds)
                              ? "Leave the shade"
                              : "I will not grommet it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeDart(listing) ? (
                        <form
                          method="post"
                          action={listingDartWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingDartOverlay(listing.id, dartIds)
                                ? "open"
                                : "dart"
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
                            {isListingDartOverlay(listing.id, dartIds)
                              ? "Leave the hang"
                              : "I will not dart it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeContrast(listing) ? (
                        <form
                          method="post"
                          action={listingContrastWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingContrastOverlay(listing.id, contrastIds)
                                ? "open"
                                : "contrast"
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
                            {isListingContrastOverlay(listing.id, contrastIds)
                              ? "Leave the dim"
                              : "I will not contrast it"}
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
                      {canTapeRadio(listing) ? (
                        <form
                          method="post"
                          action={listingRadioWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingRadioOverlay(listing.id, radioIds)
                                ? "open"
                                : "radio"
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
                            {isListingRadioOverlay(listing.id, radioIds)
                              ? "Leave the radio edit"
                              : "The radio edit stays"}
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
                      {canTapeGasket(listing) ? (
                        <form
                          method="post"
                          action={listingGasketWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingGasketOverlay(listing.id, gasketIds)
                                ? "open"
                                : "gasket"
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
                            {isListingGasketOverlay(listing.id, gasketIds)
                              ? "Leave the knob"
                              : "I will not gasket"}
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
                      {canTapeGrease(listing) ? (
                        <form
                          method="post"
                          action={listingGreaseWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingGreaseOverlay(listing.id, greaseIds)
                                ? "open"
                                : "grease"
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
                            {isListingGreaseOverlay(listing.id, greaseIds)
                              ? "Leave the grease"
                              : "The grease stays"}
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
                      {canTapeScale(listing) ? (
                        <form
                          method="post"
                          action={listingScaleWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingScaleOverlay(listing.id, scaleIds)
                                ? "open"
                                : "scale"
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
                            {isListingScaleOverlay(listing.id, scaleIds)
                              ? "Leave the vibes"
                              : "I will not scale them"}
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
                      {canTapeLog(listing) ? (
                        <form
                          method="post"
                          action={listingLogWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingLogOverlay(listing.id, logIds)
                                ? "open"
                                : "log"
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
                            {isListingLogOverlay(listing.id, logIds)
                              ? "Leave the parking-lot looks"
                              : "I will not unlog"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeProfile(listing) ? (
                        <form
                          method="post"
                          action={listingProfileWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingProfileOverlay(listing.id, profileIds)
                                ? "open"
                                : "profile"
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
                            {isListingProfileOverlay(listing.id, profileIds)
                              ? "Leave the three looks"
                              : "I will not profile it"}
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
                      {canTapeConsult(listing) ? (
                        <form
                          method="post"
                          action={listingConsultWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingConsultOverlay(listing.id, consultIds)
                                ? "open"
                                : "consult"
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
                            {isListingConsultOverlay(listing.id, consultIds)
                              ? "Leave the rule of thumb"
                              : "I don't consult"}
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
                      {canTapeNorm(listing) ? (
                        <form
                          method="post"
                          action={listingNormWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingNormOverlay(listing.id, normIds)
                                ? "open"
                                : "norm"
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
                            {isListingNormOverlay(listing.id, normIds)
                              ? "Leave it as recorded"
                              : "I will not normalize"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeCrush(listing) ? (
                        <form
                          method="post"
                          action={listingCrushWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingCrushOverlay(listing.id, crushIds)
                                ? "open"
                                : "crush"
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
                            {isListingCrushOverlay(listing.id, crushIds)
                              ? "Leave the twelve shots"
                              : "I will not crush it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeGate(listing) ? (
                        <form
                          method="post"
                          action={listingGateWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingGateOverlay(listing.id, gateIds)
                                ? "open"
                                : "gate"
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
                            {isListingGateOverlay(listing.id, gateIds)
                              ? "Leave the shots"
                              : "I will not gate it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeRights(listing) ? (
                        <form
                          method="post"
                          action={listingRightsWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingRightsOverlay(listing.id, rightsIds)
                                ? "open"
                                : "rights"
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
                            {isListingRightsOverlay(listing.id, rightsIds)
                              ? "Leave it as recorded"
                              : "I will not clear it"}
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
                      {canTapeYear(listing) ? (
                        <form
                          method="post"
                          action={listingYearWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingYearOverlay(listing.id, yearIds)
                                ? "open"
                                : "year"
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
                            {isListingYearOverlay(listing.id, yearIds)
                              ? "Leave it summer-ish"
                              : "I will not date it"}
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
                      {canTapeHint(listing) ? (
                        <form
                          method="post"
                          action={listingHintWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingHintOverlay(listing.id, hintIds)
                                ? "open"
                                : "hint"
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
                            {isListingHintOverlay(listing.id, hintIds)
                              ? "Leave the two weights"
                              : "I will not hint it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeBold(listing) ? (
                        <form
                          method="post"
                          action={listingBoldWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingBoldOverlay(listing.id, boldIds)
                                ? "open"
                                : "bold"
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
                            {isListingBoldOverlay(listing.id, boldIds)
                              ? "Leave the two weights"
                              : "I will not bold it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeVariable(listing) ? (
                        <form
                          method="post"
                          action={listingVariableWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingVariableOverlay(listing.id, variableIds)
                                ? "open"
                                : "variable"
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
                            {isListingVariableOverlay(listing.id, variableIds)
                              ? "Leave the two weights"
                              : "I will not variable it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapeLigature(listing) ? (
                        <form
                          method="post"
                          action={listingLigatureWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingLigatureOverlay(listing.id, ligatureIds)
                                ? "open"
                                : "ligature"
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
                            {isListingLigatureOverlay(listing.id, ligatureIds)
                              ? "Leave the food court"
                              : "I will not ligature it"}
                          </button>
                        </form>
                      ) : null}
                      {canTapePaginate(listing) ? (
                        <form
                          method="post"
                          action={listingPaginateWritePath()}
                          className="block"
                        >
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value={
                              isListingPaginateOverlay(listing.id, paginateIds)
                                ? "open"
                                : "paginate"
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
                            {isListingPaginateOverlay(listing.id, paginateIds)
                              ? "Leave the one page"
                              : "I will not paginate it"}
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
