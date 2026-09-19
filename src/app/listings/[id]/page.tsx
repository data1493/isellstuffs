import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { ListingMissing } from "@/components/mall-missing";
import { ListingBuyBox } from "@/components/listing-buy-box";
import { ListingMediaPlaceholder } from "@/components/listing-media-placeholder";
import { ListingTypeBadge } from "@/components/listing-type-badge";
import { ListingAskNotice } from "@/components/listing-ask-notice";
import { ListingFirmNotice } from "@/components/listing-firm-notice";
import { ListingHandsNotice } from "@/components/listing-hands-notice";
import { ListingHeavyNotice } from "@/components/listing-heavy-notice";
import { ListingCellsNotice } from "@/components/listing-cells-notice";
import { ListingPartsNotice } from "@/components/listing-parts-notice";
import { ListingPocketsNotice } from "@/components/listing-pockets-notice";
import { ListingPressNotice } from "@/components/listing-press-notice";
import { ListingSmokeNotice } from "@/components/listing-smoke-notice";
import { ListingFitsNotice } from "@/components/listing-fits-notice";
import { ListingPlaysNotice } from "@/components/listing-plays-notice";
import { ListingSizeNotice } from "@/components/listing-size-notice";
import { ListingLacesNotice } from "@/components/listing-laces-notice";
import { ListingCasesNotice } from "@/components/listing-cases-notice";
import { ListingHeatNotice } from "@/components/listing-heat-notice";
import { ListingBentNotice } from "@/components/listing-bent-notice";
import { ListingCordNotice } from "@/components/listing-cord-notice";
import { ListingWashNotice } from "@/components/listing-wash-notice";
import { ListingRemoteNotice } from "@/components/listing-remote-notice";
import { ListingSkipNotice } from "@/components/listing-skip-notice";
import { ListingGradeNotice } from "@/components/listing-grade-notice";
import { ListingWorkbookNotice } from "@/components/listing-workbook-notice";
import { ListingStemsNotice } from "@/components/listing-stems-notice";
import { ListingPileNotice } from "@/components/listing-pile-notice";
import { ListingStrapNotice } from "@/components/listing-strap-notice";
import { ListingRingNotice } from "@/components/listing-ring-notice";
import { ListingNeedleNotice } from "@/components/listing-needle-notice";
import { ListingBookNotice } from "@/components/listing-book-notice";
import { ListingHissNotice } from "@/components/listing-hiss-notice";
import { ListingToeNotice } from "@/components/listing-toe-notice";
import { ListingKeyNotice } from "@/components/listing-key-notice";
import { ListingHingeNotice } from "@/components/listing-hinge-notice";
import { ListingChipNotice } from "@/components/listing-chip-notice";
import { ListingKnobNotice } from "@/components/listing-knob-notice";
import { ListingBoxNotice } from "@/components/listing-box-notice";
import { ListingHairNotice } from "@/components/listing-hair-notice";
import { ListingLineNotice } from "@/components/listing-line-notice";
import { ListingSongsNotice } from "@/components/listing-songs-notice";
import { ListingVibeNotice } from "@/components/listing-vibe-notice";
import { ListingClipNotice } from "@/components/listing-clip-notice";
import { ListingWrongNotice } from "@/components/listing-wrong-notice";
import { ListingFoundryNotice } from "@/components/listing-foundry-notice";
import { ListingConvertNotice } from "@/components/listing-convert-notice";
import { ListingShotNotice } from "@/components/listing-shot-notice";
import { ListingWarmNotice } from "@/components/listing-warm-notice";
import { ListingBalanceNotice } from "@/components/listing-balance-notice";
import { ListingGrainNotice } from "@/components/listing-grain-notice";
import { ListingCubeNotice } from "@/components/listing-cube-notice";
import { ListingLogNotice } from "@/components/listing-log-notice";
import { ListingBpmNotice } from "@/components/listing-bpm-notice";
import { ListingManualNotice } from "@/components/listing-manual-notice";
import { ListingOilNotice } from "@/components/listing-oil-notice";
import { ListingSleeveNotice } from "@/components/listing-sleeve-notice";
import { ListingDustNotice } from "@/components/listing-dust-notice";
import { ListingCrackNotice } from "@/components/listing-crack-notice";
import { ListingInkNotice } from "@/components/listing-ink-notice";
import { ListingSoleNotice } from "@/components/listing-sole-notice";
import { ListingDumpNotice } from "@/components/listing-dump-notice";
import { ListingPhoneNotice } from "@/components/listing-phone-notice";
import { ListingRipNotice } from "@/components/listing-rip-notice";
import { ListingCardsNotice } from "@/components/listing-cards-notice";
import { ListingGreaseNotice } from "@/components/listing-grease-notice";
import { ListingZipNotice } from "@/components/listing-zip-notice";
import { ListingWhoseNotice } from "@/components/listing-whose-notice";
import { ListingTypesetNotice } from "@/components/listing-typeset-notice";
import { ListingReviseNotice } from "@/components/listing-revise-notice";
import { ListingGridNotice } from "@/components/listing-grid-notice";
import { ListingConsultNotice } from "@/components/listing-consult-notice";
import { ListingLoopNotice } from "@/components/listing-loop-notice";
import { ListingTwistNotice } from "@/components/listing-twist-notice";
import { ListingStretchNotice } from "@/components/listing-stretch-notice";
import { ListingRememberNotice } from "@/components/listing-remember-notice";
import { ListingGlueNotice } from "@/components/listing-glue-notice";
import { ListingSlantNotice } from "@/components/listing-slant-notice";
import { ListingVgNotice } from "@/components/listing-vg-notice";
import { ListingBakeNotice } from "@/components/listing-bake-notice";
import { ListingGlassNotice } from "@/components/listing-glass-notice";
import { ListingDoubleNotice } from "@/components/listing-double-notice";
import { ListingMinsNotice } from "@/components/listing-mins-notice";
import { ListingExpireNotice } from "@/components/listing-expire-notice";
import { ListingPolishNotice } from "@/components/listing-polish-notice";
import { ListingInsideNotice } from "@/components/listing-inside-notice";
import { ListingTinesNotice } from "@/components/listing-tines-notice";
import { ListingRustNotice } from "@/components/listing-rust-notice";
import { ListingCapNotice } from "@/components/listing-cap-notice";
import { ListingSaucerNotice } from "@/components/listing-saucer-notice";
import { ListingLedNotice } from "@/components/listing-led-notice";
import { ListingCastNotice } from "@/components/listing-cast-notice";
import { ListingSprayNotice } from "@/components/listing-spray-notice";
import { ListingLiningNotice } from "@/components/listing-lining-notice";
import { ListingHoodNotice } from "@/components/listing-hood-notice";
import { ListingDongleNotice } from "@/components/listing-dongle-notice";
import { ListingBeepNotice } from "@/components/listing-beep-notice";
import { ListingLabelNotice } from "@/components/listing-label-notice";
import { ListingRecapNotice } from "@/components/listing-recap-notice";
import { ListingEvenNotice } from "@/components/listing-even-notice";
import { ListingCementNotice } from "@/components/listing-cement-notice";
import { ListingLinkNotice } from "@/components/listing-link-notice";
import { ListingCenterNotice } from "@/components/listing-center-notice";
import { ListingWarpNotice } from "@/components/listing-warp-notice";
import { ListingSpliceNotice } from "@/components/listing-splice-notice";
import { ListingRadioNotice } from "@/components/listing-radio-notice";
import { ListingVentNotice } from "@/components/listing-vent-notice";
import { ListingGasketNotice } from "@/components/listing-gasket-notice";
import { ListingGlowNotice } from "@/components/listing-glow-notice";
import { ListingEtchNotice } from "@/components/listing-etch-notice";
import { ListingPadNotice } from "@/components/listing-pad-notice";
import { ListingShimNotice } from "@/components/listing-shim-notice";
import { ListingFillNotice } from "@/components/listing-fill-notice";
import { ListingWindNotice } from "@/components/listing-wind-notice";
import { ListingSocketNotice } from "@/components/listing-socket-notice";
import { ListingSpeakerNotice } from "@/components/listing-speaker-notice";
import { ListingCoilNotice } from "@/components/listing-coil-notice";
import { ListingFerriteNotice } from "@/components/listing-ferrite-notice";
import { ListingSandNotice } from "@/components/listing-sand-notice";
import { ListingContentsNotice } from "@/components/listing-contents-notice";
import { ListingDubNotice } from "@/components/listing-dub-notice";
import { ListingStitchNotice } from "@/components/listing-stitch-notice";
import { ListingWeltNotice } from "@/components/listing-welt-notice";
import { ListingCinchNotice } from "@/components/listing-cinch-notice";
import { ListingFinalizeNotice } from "@/components/listing-finalize-notice";
import { ListingAzimuthNotice } from "@/components/listing-azimuth-notice";
import { ListingNestNotice } from "@/components/listing-nest-notice";
import { ListingFoamNotice } from "@/components/listing-foam-notice";
import { ListingFlockNotice } from "@/components/listing-flock-notice";
import { ListingAnnealNotice } from "@/components/listing-anneal-notice";
import { ListingGrommetNotice } from "@/components/listing-grommet-notice";
import { ListingDartNotice } from "@/components/listing-dart-notice";
import { ListingTinNotice } from "@/components/listing-tin-notice";
import { ListingLatheNotice } from "@/components/listing-lathe-notice";
import { ListingHandleNotice } from "@/components/listing-handle-notice";
import { ListingDegaussNotice } from "@/components/listing-degauss-notice";
import { ListingKnurlNotice } from "@/components/listing-knurl-notice";
import { ListingScaleNotice } from "@/components/listing-scale-notice";
import { ListingRivetNotice } from "@/components/listing-rivet-notice";
import { ListingBushNotice } from "@/components/listing-bush-notice";
import { ListingBraidNotice } from "@/components/listing-braid-notice";
import { ListingSergeNotice } from "@/components/listing-serge-notice";
import { ListingPeenNotice } from "@/components/listing-peen-notice";
import { ListingGlazeNotice } from "@/components/listing-glaze-notice";
import { ListingPickleNotice } from "@/components/listing-pickle-notice";
import { ListingPuckNotice } from "@/components/listing-puck-notice";
import { ListingHoneNotice } from "@/components/listing-hone-notice";
import { ListingBevelNotice } from "@/components/listing-bevel-notice";
import { ListingDolbyNotice } from "@/components/listing-dolby-notice";
import { ListingPancakeNotice } from "@/components/listing-pancake-notice";
import { ListingFluxNotice } from "@/components/listing-flux-notice";
import { ListingTemperNotice } from "@/components/listing-temper-notice";
import { ListingScribeNotice } from "@/components/listing-scribe-notice";
import { ListingPaginateNotice } from "@/components/listing-paginate-notice";
import { ListingCollateNotice } from "@/components/listing-collate-notice";
import { ListingContrastNotice } from "@/components/listing-contrast-notice";
import { ListingReflowNotice } from "@/components/listing-reflow-notice";
import { ListingGateNotice } from "@/components/listing-gate-notice";
import { ListingQuantizeNotice } from "@/components/listing-quantize-notice";
import { ListingSubsetNotice } from "@/components/listing-subset-notice";
import { ListingProofNotice } from "@/components/listing-proof-notice";
import { ListingTrayNotice } from "@/components/listing-tray-notice";
import { ListingMasterNotice } from "@/components/listing-master-notice";
import { ListingGumNotice } from "@/components/listing-gum-notice";
import { ListingTuneNotice } from "@/components/listing-tune-notice";
import { ListingNormNotice } from "@/components/listing-norm-notice";
import { ListingCrushNotice } from "@/components/listing-crush-notice";
import { ListingRightsNotice } from "@/components/listing-rights-notice";
import { ListingVersoNotice } from "@/components/listing-verso-notice";
import { ListingYearNotice } from "@/components/listing-year-notice";
import { ListingIconsNotice } from "@/components/listing-icons-notice";
import { ListingHintNotice } from "@/components/listing-hint-notice";
import { ListingProfileNotice } from "@/components/listing-profile-notice";
import { ListingBoldNotice } from "@/components/listing-bold-notice";
import { ListingVariableNotice } from "@/components/listing-variable-notice";
import { ListingLigatureNotice } from "@/components/listing-ligature-notice";
import { ListingScanNotice } from "@/components/listing-scan-notice";
import { ListingVanNotice } from "@/components/listing-van-notice";
import { ListingWithNotice } from "@/components/listing-with-notice";
import { TestedKindaChip } from "@/components/sell/tested-kinda-chip";
import { PickupNote } from "@/components/pickup-note";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { Badge } from "@/components/ui/badge";
import {
  formatMoney,
  isDigitalListing,
  isPhysicalListing,
  listingById,
  listings,
  listingsByStall,
  stallById,
  type Listing,
} from "@/lib/commerce";
import {
  listingFact,
  listingHeroEyebrow,
  listingHub,
  listingSiblingKicker,
  listingStatusLabel,
} from "@/lib/listing-display";
import {
  listingAskPath,
  listingCellsPath,
  listingFitsPath,
  listingFirmPath,
  listingHandsPath,
  listingHeavyPath,
  listingLookPath,
  listingOfferPath,
  listingPath,
  listingPartsPath,
  listingPlaysPath,
  listingPocketsPath,
  listingPressPath,
  listingScanPath,
  listingLacesPath,
  listingCasesPath,
  listingHeatPath,
  listingBentPath,
  listingCordPath,
  listingWashPath,
  listingRemotePath,
  listingSkipPath,
  listingGradePath,
  listingWorkbookPath,
  listingStemsPath,
  listingPilePath,
  listingStrapPath,
  listingRingPath,
  listingNeedlePath,
  listingBookPath,
  listingHissPath,
  listingToePath,
  listingKeyPath,
  listingHingePath,
  listingChipPath,
  listingKnobPath,
  listingBoxPath,
  listingHairPath,
  listingLinePath,
  listingSongsPath,
  listingVibePath,
  listingClipPath,
  listingWrongPath,
  listingFoundryPath,
  listingConvertPath,
  listingShotPath,
  listingWarmPath,
  listingBalancePath,
  listingGrainPath,
  listingCubePath,
  listingLogPath,
  listingBpmPath,
  listingManualPath,
  listingOilPath,
  listingSleevePath,
  listingDustPath,
  listingCrackPath,
  listingInkPath,
  listingSolePath,
  listingDumpPath,
  listingPhonePath,
  listingRipPath,
  listingCardsPath,
  listingGreasePath,
  listingZipPath,
  listingWhosePath,
  listingTypesetPath,
  listingRevisePath,
  listingGridPath,
  listingConsultPath,
  listingLoopPath,
  listingTwistPath,
  listingStretchPath,
  listingRememberPath,
  listingGluePath,
  listingSlantPath,
  listingVgPath,
  listingBakePath,
  listingGlassPath,
  listingDoublePath,
  listingMinsPath,
  listingExpirePath,
  listingPolishPath,
  listingInsidePath,
  listingTinesPath,
  listingRustPath,
  listingCapPath,
  listingSaucerPath,
  listingLedPath,
  listingCastPath,
  listingSprayPath,
  listingLiningPath,
  listingHoodPath,
  listingDonglePath,
  listingBeepPath,
  listingLabelPath,
  listingRecapPath,
  listingEvenPath,
  listingCementPath,
  listingLinkPath,
  listingCenterPath,
  listingWarpPath,
  listingSplicePath,
  listingRadioPath,
  listingVentPath,
  listingGasketPath,
  listingGlowPath,
  listingEtchPath,
  listingPadPath,
  listingShimPath,
  listingFillPath,
  listingWindPath,
  listingSocketPath,
  listingSpeakerPath,
  listingCoilPath,
  listingFerritePath,
  listingSandPath,
  listingContentsPath,
  listingDubPath,
  listingStitchPath,
  listingWeltPath,
  listingCinchPath,
  listingFinalizePath,
  listingAzimuthPath,
  listingNestPath,
  listingFoamPath,
  listingAnnealPath,
  listingGrommetPath,
  listingDartPath,
  listingTinPath,
  listingLathePath,
  listingHandlePath,
  listingDegaussPath,
  listingKnurlPath,
  listingRivetPath,
  listingBushPath,
  listingBraidPath,
  listingSergePath,
  listingPeenPath,
  listingGlazePath,
  listingPicklePath,
  listingPuckPath,
  listingHonePath,
  listingBevelPath,
  listingDolbyPath,
  listingPancakePath,
  listingFluxPath,
  listingTemperPath,
  listingScribePath,
  listingPaginatePath,
  listingCollatePath,
  listingContrastPath,
  listingGatePath,
  listingQuantizePath,
  listingSubsetPath,
  listingFlockPath,
  listingTrayPath,
  listingMasterPath,
  listingGumPath,
  listingTunePath,
  listingNormPath,
  listingCrushPath,
  listingRightsPath,
  listingVersoPath,
  listingYearPath,
  listingIconsPath,
  listingHintPath,
  listingProfilePath,
  listingBoldPath,
  listingVariablePath,
  listingLigaturePath,
  listingSizePath,
  listingSmokePath,
  listingTagPath,
  listingVanPath,
  listingWithPath,
  stallPath,
} from "@/lib/paths";
import { listingMetadata, listingProductJsonLd, missingListingMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ListingPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return listings.map((listing) => ({ id: listing.id }));
}

export async function generateMetadata({
  params,
}: ListingPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = listingById(id);

  if (!listing) {
    return missingListingMetadata();
  }

  return listingMetadata(listing);
}

function SiblingRow({
  title,
  items,
}: {
  title: string;
  items: Listing[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={listingPath(item.id)}
              className={cn(
                "flex h-full flex-col overflow-hidden rounded-xl bg-card ring-1 transition-shadow hover:ring-foreground/20",
                isPhysicalListing(item)
                  ? "ring-primary/12"
                  : "ring-accent-foreground/12",
              )}
            >
              <ListingMediaPlaceholder
                listing={item}
                compact
                className="rounded-none rounded-t-xl border-0 border-b border-dashed"
              />
              <div className="flex flex-col gap-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <ListingTypeBadge listing={item} />
                  <span className="text-xs text-muted-foreground">
                    {listingStatusLabel(item)}
                  </span>
                </div>
                <p className="font-heading text-lg leading-snug">{item.title}</p>
                <p className="text-sm text-muted-foreground">
                  {formatMoney(item.price)} · {listingFact(item)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  const listing = listingById(id);

  if (!listing) {
    return <ListingMissing />;
  }

  const stall = stallById(listing.stallId);
  const hub = listingHub(listing);
  const physical = isPhysicalListing(listing);
  const siblings = listingsByStall(listing.stallId).filter(
    (item) => item.id !== listing.id,
  );
  const siblingPhysical = siblings.filter(isPhysicalListing);
  const siblingDigital = siblings.filter(isDigitalListing);

  return (
    <div data-listing-type={listing.type}>
      <JsonLd data={listingProductJsonLd(listing)} />
      <section
        className={cn(
          "border-b border-border",
          physical
            ? "bg-[linear-gradient(180deg,var(--card),var(--background))]"
            : "bg-[linear-gradient(180deg,color-mix(in_oklch,var(--accent)_40%,var(--card)),var(--background))]",
        )}
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <MallCrumb label="Listing location">
            <CrumbSep />
            {stall ? (
              <Link
                href={stallPath(stall.slug)}
                className="hover:text-foreground hover:underline"
              >
                {stall.boothName}
              </Link>
            ) : (
              <span>Unknown stall</span>
            )}
            <CrumbSep />
            <span className="text-foreground">{listing.title}</span>
          </MallCrumb>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
            <ListingMediaPlaceholder listing={listing} />

            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <ListingTypeBadge listing={listing} />
                <Badge
                  variant={
                    listing.status === "available" ? "ghost" : "destructive"
                  }
                >
                  {listingStatusLabel(listing)}
                </Badge>
                <Badge variant="outline">{hub.name}</Badge>
                <TestedKindaChip listingId={listing.id} />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {listingHeroEyebrow(listing)}
                </p>
                <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-5xl">
                  {listing.title}
                </h1>
                <p className="text-base leading-7 text-muted-foreground sm:text-lg">
                  {listing.summary}
                </p>
              </div>

              <ListingBuyBox listing={listing} />

              {physical ? <ListingVanNotice listingId={listing.id} /> : null}
              {physical ? <ListingFirmNotice listingId={listing.id} /> : null}
              {physical ? <ListingHandsNotice listingId={listing.id} /> : null}
              {physical ? <ListingWithNotice listingId={listing.id} /> : null}
              {physical ? <ListingAskNotice listingId={listing.id} /> : null}
              <ListingScanNotice listingId={listing.id} />
              {physical ? <ListingHeavyNotice listingId={listing.id} /> : null}
              {physical ? <ListingPocketsNotice listingId={listing.id} /> : null}
              {physical ? <ListingPressNotice listingId={listing.id} /> : null}
              {physical ? <ListingPartsNotice listingId={listing.id} /> : null}
              {physical ? <ListingCellsNotice listingId={listing.id} /> : null}
              {physical ? <ListingSmokeNotice listingId={listing.id} /> : null}
              {physical ? <ListingSizeNotice listingId={listing.id} /> : null}
              {physical ? <ListingFitsNotice listingId={listing.id} /> : null}
              {physical ? <ListingPlaysNotice listingId={listing.id} /> : null}
              {physical ? <ListingLacesNotice listingId={listing.id} /> : null}
              {physical ? <ListingCasesNotice listingId={listing.id} /> : null}
              {physical ? <ListingHeatNotice listingId={listing.id} /> : null}
              {physical ? <ListingBentNotice listingId={listing.id} /> : null}
              {physical ? <ListingCordNotice listingId={listing.id} /> : null}
              {physical ? <ListingWashNotice listingId={listing.id} /> : null}
              {physical ? <ListingRemoteNotice listingId={listing.id} /> : null}
              {physical ? <ListingSkipNotice listingId={listing.id} /> : null}
              {!physical ? <ListingGradeNotice listingId={listing.id} /> : null}
              {!physical ? (
                <ListingWorkbookNotice listingId={listing.id} />
              ) : null}
              {!physical ? (
                <ListingTypesetNotice listingId={listing.id} />
              ) : null}
              {!physical ? (
                <ListingReviseNotice listingId={listing.id} />
              ) : null}
              {!physical ? (
                <ListingGridNotice listingId={listing.id} />
              ) : null}
              {!physical ? (
                <ListingPaginateNotice listingId={listing.id} />
              ) : null}
              {!physical ? (
                <ListingCollateNotice listingId={listing.id} />
              ) : null}
              {!physical ? (
                <ListingConsultNotice listingId={listing.id} />
              ) : null}
              {!physical ? (
                <ListingRememberNotice listingId={listing.id} />
              ) : null}
              {!physical ? <ListingVersoNotice listingId={listing.id} /> : null}
              {!physical ? <ListingYearNotice listingId={listing.id} /> : null}
              {!physical ? <ListingStemsNotice listingId={listing.id} /> : null}
              {!physical ? <ListingVibeNotice listingId={listing.id} /> : null}
              {!physical ? <ListingClipNotice listingId={listing.id} /> : null}
              {!physical ? <ListingCardsNotice listingId={listing.id} /> : null}
              {!physical ? <ListingScaleNotice listingId={listing.id} /> : null}
              {!physical ? <ListingProofNotice listingId={listing.id} /> : null}
              {!physical ? <ListingGreaseNotice listingId={listing.id} /> : null}
              {!physical ? <ListingDoubleNotice listingId={listing.id} /> : null}
              {!physical ? <ListingMinsNotice listingId={listing.id} /> : null}
              {!physical ? <ListingExpireNotice listingId={listing.id} /> : null}
              {!physical ? <ListingWrongNotice listingId={listing.id} /> : null}
              {!physical ? (
                <ListingFoundryNotice listingId={listing.id} />
              ) : null}
              {!physical ? (
                <ListingConvertNotice listingId={listing.id} />
              ) : null}
              {!physical ? <ListingShotNotice listingId={listing.id} /> : null}
              {!physical ? <ListingWarmNotice listingId={listing.id} /> : null}
              {!physical ? <ListingBalanceNotice listingId={listing.id} /> : null}
              {!physical ? <ListingGrainNotice listingId={listing.id} /> : null}
              {!physical ? <ListingCubeNotice listingId={listing.id} /> : null}
              {!physical ? <ListingLogNotice listingId={listing.id} /> : null}
              {!physical ? <ListingProfileNotice listingId={listing.id} /> : null}
              {!physical ? <ListingBpmNotice listingId={listing.id} /> : null}
              {!physical ? <ListingLoopNotice listingId={listing.id} /> : null}
              {!physical ? <ListingTuneNotice listingId={listing.id} /> : null}
              {!physical ? <ListingNormNotice listingId={listing.id} /> : null}
              {!physical ? <ListingCrushNotice listingId={listing.id} /> : null}
              {!physical ? <ListingGateNotice listingId={listing.id} /> : null}
              {!physical ? <ListingQuantizeNotice listingId={listing.id} /> : null}
              {!physical ? <ListingSubsetNotice listingId={listing.id} /> : null}
              {!physical ? <ListingRightsNotice listingId={listing.id} /> : null}
              {!physical ? <ListingSlantNotice listingId={listing.id} /> : null}
              {!physical ? <ListingIconsNotice listingId={listing.id} /> : null}
              {!physical ? <ListingHintNotice listingId={listing.id} /> : null}
              {!physical ? <ListingBoldNotice listingId={listing.id} /> : null}
              {!physical ? (
                <ListingVariableNotice listingId={listing.id} />
              ) : null}
              {!physical ? (
                <ListingLigatureNotice listingId={listing.id} />
              ) : null}
              {physical ? <ListingPileNotice listingId={listing.id} /> : null}
              {physical ? <ListingStrapNotice listingId={listing.id} /> : null}
              {physical ? <ListingRingNotice listingId={listing.id} /> : null}
              {physical ? <ListingNeedleNotice listingId={listing.id} /> : null}
              {physical ? <ListingBookNotice listingId={listing.id} /> : null}
              {physical ? <ListingHissNotice listingId={listing.id} /> : null}
              {physical ? <ListingToeNotice listingId={listing.id} /> : null}
              {physical ? <ListingKeyNotice listingId={listing.id} /> : null}
              {physical ? <ListingHingeNotice listingId={listing.id} /> : null}
              {physical ? <ListingChipNotice listingId={listing.id} /> : null}
              {physical ? <ListingKnobNotice listingId={listing.id} /> : null}
              {physical ? <ListingManualNotice listingId={listing.id} /> : null}
              {physical ? <ListingBoxNotice listingId={listing.id} /> : null}
              {physical ? <ListingOilNotice listingId={listing.id} /> : null}
              {physical ? <ListingHairNotice listingId={listing.id} /> : null}
              {physical ? <ListingLineNotice listingId={listing.id} /> : null}
              {physical ? <ListingSongsNotice listingId={listing.id} /> : null}
              {physical ? <ListingSleeveNotice listingId={listing.id} /> : null}
              {physical ? <ListingDustNotice listingId={listing.id} /> : null}
              {physical ? <ListingCrackNotice listingId={listing.id} /> : null}
              {physical ? <ListingInkNotice listingId={listing.id} /> : null}
              {physical ? <ListingSoleNotice listingId={listing.id} /> : null}
              {physical ? <ListingStretchNotice listingId={listing.id} /> : null}
              {physical ? <ListingDumpNotice listingId={listing.id} /> : null}
              {physical ? <ListingGlueNotice listingId={listing.id} /> : null}
              {physical ? <ListingGlassNotice listingId={listing.id} /> : null}
              {physical ? <ListingPhoneNotice listingId={listing.id} /> : null}
              {physical ? <ListingRipNotice listingId={listing.id} /> : null}
              {physical ? <ListingZipNotice listingId={listing.id} /> : null}
              {physical ? <ListingPolishNotice listingId={listing.id} /> : null}
              {physical ? <ListingWhoseNotice listingId={listing.id} /> : null}
              {physical ? <ListingTwistNotice listingId={listing.id} /> : null}
              {physical ? <ListingVgNotice listingId={listing.id} /> : null}
              {physical ? <ListingBakeNotice listingId={listing.id} /> : null}
              {physical ? <ListingInsideNotice listingId={listing.id} /> : null}
              {physical ? <ListingTinesNotice listingId={listing.id} /> : null}
              {physical ? <ListingRustNotice listingId={listing.id} /> : null}
              {physical ? <ListingCapNotice listingId={listing.id} /> : null}
              {physical ? <ListingSaucerNotice listingId={listing.id} /> : null}
              {physical ? <ListingLedNotice listingId={listing.id} /> : null}
              {physical ? <ListingCastNotice listingId={listing.id} /> : null}
              {physical ? <ListingSprayNotice listingId={listing.id} /> : null}
              {physical ? <ListingLiningNotice listingId={listing.id} /> : null}
              {physical ? <ListingHoodNotice listingId={listing.id} /> : null}
              {physical ? <ListingDongleNotice listingId={listing.id} /> : null}
              {physical ? <ListingBeepNotice listingId={listing.id} /> : null}
              {physical ? <ListingLabelNotice listingId={listing.id} /> : null}
              {physical ? <ListingRecapNotice listingId={listing.id} /> : null}
              {physical ? <ListingGlowNotice listingId={listing.id} /> : null}
              {physical ? <ListingEvenNotice listingId={listing.id} /> : null}
              {physical ? <ListingCementNotice listingId={listing.id} /> : null}
              {physical ? <ListingPadNotice listingId={listing.id} /> : null}
              {physical ? <ListingLinkNotice listingId={listing.id} /> : null}
              {physical ? <ListingCenterNotice listingId={listing.id} /> : null}
              {physical ? <ListingWarpNotice listingId={listing.id} /> : null}
              {physical ? <ListingPuckNotice listingId={listing.id} /> : null}
              {physical ? <ListingHoneNotice listingId={listing.id} /> : null}
              {physical ? <ListingEtchNotice listingId={listing.id} /> : null}
              {physical ? <ListingShimNotice listingId={listing.id} /> : null}
              {physical ? <ListingSpliceNotice listingId={listing.id} /> : null}
              {physical ? <ListingRadioNotice listingId={listing.id} /> : null}
              {physical ? <ListingVentNotice listingId={listing.id} /> : null}
              {physical ? <ListingGasketNotice listingId={listing.id} /> : null}
              {physical ? <ListingTrayNotice listingId={listing.id} /> : null}
              {physical ? <ListingMasterNotice listingId={listing.id} /> : null}
              {physical ? <ListingGumNotice listingId={listing.id} /> : null}
              {physical ? <ListingFillNotice listingId={listing.id} /> : null}
              {physical ? <ListingWindNotice listingId={listing.id} /> : null}
              {physical ? <ListingSocketNotice listingId={listing.id} /> : null}
              {physical ? <ListingSpeakerNotice listingId={listing.id} /> : null}
              {physical ? <ListingCoilNotice listingId={listing.id} /> : null}
              {physical ? <ListingFerriteNotice listingId={listing.id} /> : null}
              {physical ? <ListingSandNotice listingId={listing.id} /> : null}
              {physical ? <ListingContentsNotice listingId={listing.id} /> : null}
              {physical ? <ListingDubNotice listingId={listing.id} /> : null}
              {physical ? <ListingStitchNotice listingId={listing.id} /> : null}
              {physical ? <ListingWeltNotice listingId={listing.id} /> : null}
              {physical ? <ListingCinchNotice listingId={listing.id} /> : null}
              {physical ? <ListingFinalizeNotice listingId={listing.id} /> : null}
              {physical ? <ListingAzimuthNotice listingId={listing.id} /> : null}
              {physical ? <ListingNestNotice listingId={listing.id} /> : null}
              {physical ? <ListingFoamNotice listingId={listing.id} /> : null}
              {physical ? <ListingFlockNotice listingId={listing.id} /> : null}
              {physical ? <ListingAnnealNotice listingId={listing.id} /> : null}
              {physical ? <ListingGrommetNotice listingId={listing.id} /> : null}
              {physical ? <ListingDartNotice listingId={listing.id} /> : null}
              {physical ? <ListingSergeNotice listingId={listing.id} /> : null}
              {physical ? <ListingContrastNotice listingId={listing.id} /> : null}
              {physical ? <ListingReflowNotice listingId={listing.id} /> : null}
              {physical ? <ListingTinNotice listingId={listing.id} /> : null}
              {physical ? <ListingLatheNotice listingId={listing.id} /> : null}
              {physical ? <ListingHandleNotice listingId={listing.id} /> : null}
              {physical ? <ListingDegaussNotice listingId={listing.id} /> : null}
              {physical ? <ListingDolbyNotice listingId={listing.id} /> : null}
              {physical ? <ListingPancakeNotice listingId={listing.id} /> : null}
              {physical ? <ListingFluxNotice listingId={listing.id} /> : null}
              {physical ? <ListingTemperNotice listingId={listing.id} /> : null}
              {physical ? <ListingScribeNotice listingId={listing.id} /> : null}
              {physical ? <ListingKnurlNotice listingId={listing.id} /> : null}
              {physical ? <ListingRivetNotice listingId={listing.id} /> : null}
              {physical ? <ListingBushNotice listingId={listing.id} /> : null}
              {physical ? <ListingBraidNotice listingId={listing.id} /> : null}
              {physical ? <ListingPeenNotice listingId={listing.id} /> : null}
              {physical ? <ListingGlazeNotice listingId={listing.id} /> : null}
              {physical ? <ListingPickleNotice listingId={listing.id} /> : null}
              {physical ? <ListingBevelNotice listingId={listing.id} /> : null}

              {physical ? (
                <p className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-4">
                  <Link
                    href={listingTagPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Print a driveway tag
                  </Link>
                  <Link
                    href={listingOfferPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Tape an offer
                  </Link>
                  <Link
                    href={listingLookPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Look, don't bag
                  </Link>
                  <Link
                    href={listingVanPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    More in the van
                  </Link>
                  <Link
                    href={listingFirmPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    That&apos;s the price
                  </Link>
                  <Link
                    href={listingHandsPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    In someone&apos;s hands
                  </Link>
                  <Link
                    href={listingWithPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    These two go together
                  </Link>
                  <Link
                    href={listingAskPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Ask before you flip it
                  </Link>
                  <Link
                    href={listingScanPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Scan the liner
                  </Link>
                  <Link
                    href={listingHeavyPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Needs two people
                  </Link>
                  <Link
                    href={listingPocketsPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Pockets are empty
                  </Link>
                  <Link
                    href={listingPressPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Which press
                  </Link>
                  <Link
                    href={listingPartsPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Sold for parts
                  </Link>
                  <Link
                    href={listingCellsPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Batteries not included
                  </Link>
                  <Link
                    href={listingSmokePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Smells like smoke
                  </Link>
                  <Link
                    href={listingSizePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Tag says L
                  </Link>
                  <Link
                    href={listingFitsPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Fits a 3-quart
                  </Link>
                  <Link
                    href={listingPlaysPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I played it once
                  </Link>
                  <Link
                    href={listingLacesPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I kept the good laces
                  </Link>
                  <Link
                    href={listingCasesPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The discs walked
                  </Link>
                  <Link
                    href={listingHeatPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Not for the microwave
                  </Link>
                  <Link
                    href={listingBentPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Leave it bent
                  </Link>
                  <Link
                    href={listingCordPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Rewired
                  </Link>
                  <Link
                    href={listingWashPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I washed it
                  </Link>
                  <Link
                    href={listingRemotePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The remote walked
                  </Link>
                  <Link
                    href={listingSkipPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The skip stays
                  </Link>
                  <Link
                    href={listingPilePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Won&apos;t split the pile
                  </Link>
                  <Link
                    href={listingStrapPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The strap walked
                  </Link>
                  <Link
                    href={listingRingPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The water ring stays
                  </Link>
                  <Link
                    href={listingNeedlePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The needle walked
                  </Link>
                  <Link
                    href={listingBookPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The booklet walked
                  </Link>
                  <Link
                    href={listingHissPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The hiss stays
                  </Link>
                  <Link
                    href={listingToePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The peel stays
                  </Link>
                  <Link
                    href={listingKeyPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The key walked
                  </Link>
                  <Link
                    href={listingHingePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The hinge stays gone
                  </Link>
                  <Link
                    href={listingChipPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The chip stays
                  </Link>
                  <Link
                    href={listingKnobPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The knob stays loose
                  </Link>
                  <Link
                    href={listingManualPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    There is no manual
                  </Link>
                  <Link
                    href={listingBoxPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The shade stays in the box
                  </Link>
                  <Link
                    href={listingOilPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Needs a drop of oil
                  </Link>
                  <Link
                    href={listingHairPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Pet hair stays
                  </Link>
                  <Link
                    href={listingLinePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The line stays
                  </Link>
                  <Link
                    href={listingSongsPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not title the songs
                  </Link>
                  <Link
                    href={listingSleevePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The grocery bag is the sleeve
                  </Link>
                  <Link
                    href={listingDustPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The dust stays
                  </Link>
                  <Link
                    href={listingCrackPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The crack stays
                  </Link>
                  <Link
                    href={listingInkPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The Sharpie stays
                  </Link>
                  <Link
                    href={listingSolePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not resole
                  </Link>
                  <Link
                    href={listingStretchPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not stretch
                  </Link>
                  <Link
                    href={listingDumpPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I don't dump
                  </Link>
                  <Link
                    href={listingGluePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not glue
                  </Link>
                  <Link
                    href={listingGlassPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not replace the glass
                  </Link>
                  <Link
                    href={listingPhonePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I don't know the phone
                  </Link>
                  <Link
                    href={listingRipPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I don't rip
                  </Link>
                  <Link
                    href={listingZipPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I don't have the zip
                  </Link>
                  <Link
                    href={listingPolishPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not polish
                  </Link>
                  <Link
                    href={listingWhosePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not say whose
                  </Link>
                  <Link
                    href={listingTwistPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Twist the neck
                  </Link>
                  <Link
                    href={listingVgPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not VG it
                  </Link>
                  <Link
                    href={listingBakePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not bake
                  </Link>
                  <Link
                    href={listingInsidePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not say what was inside
                  </Link>
                  <Link
                    href={listingTinesPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not replace a tine
                  </Link>
                  <Link
                    href={listingRustPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The rust stays
                  </Link>
                  <Link
                    href={listingCapPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I don't have a cap
                  </Link>
                  <Link
                    href={listingSaucerPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I don't have a saucer
                  </Link>
                  <Link
                    href={listingLedPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not LED it
                  </Link>
                  <Link
                    href={listingCastPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not recast
                  </Link>
                  <Link
                    href={listingSprayPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not spray it
                  </Link>
                  <Link
                    href={listingLiningPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I don’t have a lining
                  </Link>
                  <Link
                    href={listingHoodPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I don’t have a hood
                  </Link>
                  <Link
                    href={listingDonglePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I don't have a dongle
                  </Link>
                  <Link
                    href={listingBeepPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not beep it
                  </Link>
                  <Link
                    href={listingLabelPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not label them
                  </Link>
                  <Link
                    href={listingRecapPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not recap
                  </Link>
                  <Link
                    href={listingGlowPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I don't have a backlight
                  </Link>
                  <Link
                    href={listingEvenPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not even the wear
                  </Link>
                  <Link
                    href={listingCementPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not cement
                  </Link>
                  <Link
                    href={listingPadPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not pad them
                  </Link>
                  <Link
                    href={listingLinkPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I don't have a link
                  </Link>
                  <Link
                    href={listingCenterPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not center it
                  </Link>
                  <Link
                    href={listingWarpPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not flatten
                  </Link>
                  <Link
                    href={listingPuckPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not puck it
                  </Link>
                  <Link
                    href={listingHonePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not hone it
                  </Link>
                  <Link
                    href={listingEtchPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not read the runout
                  </Link>
                  <Link
                    href={listingShimPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not shim it
                  </Link>
                  <Link
                    href={listingSplicePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not splice
                  </Link>
                  <Link
                    href={listingRadioPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The radio edit stays
                  </Link>
                  <Link
                    href={listingVentPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not vent
                  </Link>
                  <Link
                    href={listingGasketPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not gasket
                  </Link>
                  <Link
                    href={listingTrayPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not tray it
                  </Link>
                  <Link
                    href={listingMasterPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I don't have the master
                  </Link>
                  <Link
                    href={listingGumPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The stickers stay
                  </Link>
                  <Link
                    href={listingFillPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not fill it
                  </Link>
                  <Link
                    href={listingWindPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not wind it
                  </Link>
                  <Link
                    href={listingSocketPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not socket it
                  </Link>
                  <Link
                    href={listingSpeakerPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not speaker it
                  </Link>
                  <Link
                    href={listingCoilPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not coil them
                  </Link>
                  <Link
                    href={listingFerritePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not ferrite them
                  </Link>
                  <Link
                    href={listingSandPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not sand it
                  </Link>
                  <Link
                    href={listingContentsPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not list what’s on it
                  </Link>
                  <Link
                    href={listingDubPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not dub it
                  </Link>
                  <Link
                    href={listingStitchPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not stitch them
                  </Link>
                  <Link
                    href={listingWeltPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not welt them
                  </Link>
                  <Link
                    href={listingCinchPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not cinch it
                  </Link>
                  <Link
                    href={listingFinalizePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not finalize it
                  </Link>
                  <Link
                    href={listingAzimuthPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not azimuth it
                  </Link>
                  <Link
                    href={listingNestPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not nest them
                  </Link>
                  <Link
                    href={listingFoamPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not foam them
                  </Link>
                  <Link
                    href={listingFlockPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not flock them
                  </Link>
                  <Link
                    href={listingAnnealPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not anneal it
                  </Link>
                  <Link
                    href={listingGrommetPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not grommet it
                  </Link>
                  <Link
                    href={listingDartPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not dart it
                  </Link>
                  <Link
                    href={listingSergePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not serge it
                  </Link>
                  <Link
                    href={listingContrastPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not contrast it
                  </Link>
                  <Link
                    href={listingTinPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not tin them
                  </Link>
                  <Link
                    href={listingLathePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not lathe it
                  </Link>
                  <Link
                    href={listingHandlePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not handle it
                  </Link>
                  <Link
                    href={listingGlazePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not glaze it
                  </Link>
                  <Link
                    href={listingPicklePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not pickle it
                  </Link>
                  <Link
                    href={listingBevelPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not bevel it
                  </Link>
                  <Link
                    href={listingDegaussPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not degauss it
                  </Link>
                  <Link
                    href={listingDolbyPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not Dolby it
                  </Link>
                  <Link
                    href={listingPancakePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not pancake it
                  </Link>
                  <Link
                    href={listingFluxPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not flux them
                  </Link>
                  <Link
                    href={listingTemperPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not temper it
                  </Link>
                  <Link
                    href={listingScribePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not scribe it
                  </Link>
                  <Link
                    href={listingKnurlPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not knurl it
                  </Link>
                  <Link
                    href={listingRivetPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not rivet it
                  </Link>
                  <Link
                    href={listingBushPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not bush it
                  </Link>
                  <Link
                    href={listingBraidPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not braid them
                  </Link>
                  <Link
                    href={listingPeenPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not peen it
                  </Link>
                </p>
              ) : listing.fileFormat.toUpperCase().includes("GIFT") ? (
                <p className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-4">
                  <Link
                    href={listingExpirePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not expire it
                  </Link>
                </p>
              ) : (
                <p className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-4">
                  <Link
                    href={listingScanPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Scan the liner
                  </Link>
                  <Link
                    href={listingGradePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I don't grade your lot
                  </Link>
                  <Link
                    href={listingWorkbookPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    There is no workbook
                  </Link>
                  <Link
                    href={listingTypesetPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not typeset
                  </Link>
                  <Link
                    href={listingRevisePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not revise
                  </Link>
                  <Link
                    href={listingGridPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not spreadsheet
                  </Link>
                  <Link
                    href={listingPaginatePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not paginate it
                  </Link>
                  <Link
                    href={listingCollatePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not collate them
                  </Link>
                  <Link
                    href={listingConsultPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I don't consult
                  </Link>
                  <Link
                    href={listingRememberPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not remember better
                  </Link>
                  <Link
                    href={listingVersoPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not write Side B
                  </Link>
                  <Link
                    href={listingYearPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not date it
                  </Link>
                  <Link
                    href={listingStemsPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    These twelve shots
                  </Link>
                  <Link
                    href={listingVibePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Measurements are vibes
                  </Link>
                  <Link
                    href={listingClipPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The clip walked
                  </Link>
                  <Link
                    href={listingCardsPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not type the cards
                  </Link>
                  <Link
                    href={listingGreasePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The grease stays
                  </Link>
                  <Link
                    href={listingDoublePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not double it
                  </Link>
                  <Link
                    href={listingMinsPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not time it
                  </Link>
                  <Link
                    href={listingWrongPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Wrong on purpose
                  </Link>
                  <Link
                    href={listingFoundryPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Not a foundry seat
                  </Link>
                  <Link
                    href={listingConvertPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I don't convert
                  </Link>
                  <Link
                    href={listingShotPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I don't shoot
                  </Link>
                  <Link
                    href={listingWarmPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Warm stays warm
                  </Link>
                  <Link
                    href={listingBalancePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not balance it
                  </Link>
                  <Link
                    href={listingGrainPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not grain them
                  </Link>
                  <Link
                    href={listingCubePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not cube them
                  </Link>
                  <Link
                    href={listingLogPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not unlog
                  </Link>
                  <Link
                    href={listingProfilePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not profile it
                  </Link>
                  <Link
                    href={listingBpmPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    BPM is a guess
                  </Link>
                  <Link
                    href={listingLoopPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not slice the loop
                  </Link>
                  <Link
                    href={listingTunePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not tune it
                  </Link>
                  <Link
                    href={listingNormPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not normalize
                  </Link>
                  <Link
                    href={listingCrushPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not crush it
                  </Link>
                  <Link
                    href={listingGatePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not gate it
                  </Link>
                  <Link
                    href={listingQuantizePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not quantize them
                  </Link>
                  <Link
                    href={listingRightsPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not clear it
                  </Link>
                  <Link
                    href={listingSlantPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not cut a slant
                  </Link>
                  <Link
                    href={listingIconsPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not draw the icons
                  </Link>
                  <Link
                    href={listingHintPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not hint it
                  </Link>
                  <Link
                    href={listingBoldPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not bold it
                  </Link>
                  <Link
                    href={listingVariablePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not variable it
                  </Link>
                  <Link
                    href={listingLigaturePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not ligature it
                  </Link>
                  <Link
                    href={listingSubsetPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not subset it
                  </Link>
                </p>
              )}

              {physical && stall ? <PickupNote stall={stall} /> : null}

              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-card/80 p-4 ring-1 ring-foreground/10">
                  <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Stall
                  </dt>
                  <dd className="mt-1 text-base text-foreground">
                    {stall ? (
                      <Link
                        href={stallPath(stall.slug)}
                        className="underline-offset-4 hover:underline"
                      >
                        {stall.boothName}
                      </Link>
                    ) : (
                      listing.stallId
                    )}
                  </dd>
                  {stall ? (
                    <dd className="mt-2 text-sm leading-6 text-muted-foreground">
                      {stall.blurb}
                    </dd>
                  ) : null}
                </div>
                <div className="rounded-xl bg-card/80 p-4 ring-1 ring-foreground/10">
                  <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Aisle rule
                  </dt>
                  <dd className="mt-1 font-heading text-lg tracking-tight">
                    {hub.name}
                  </dd>
                  <dd className="mt-2 text-sm leading-6 text-muted-foreground">
                    {hub.rule}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {stall ? (
        <section>
          <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-12 sm:px-6 sm:py-16">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Same stall · {listingSiblingKicker(listing)}
                </p>
                <h2 className="mt-2 font-heading text-3xl tracking-tight">
                  Also on {stall.boothName}
                </h2>
              </div>
              <Link
                href={stallPath(stall.slug)}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Open the whole stall
              </Link>
            </div>

            {siblings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                This is the only SKU on the table right now.
              </p>
            ) : (
              <div className="space-y-8">
                <SiblingRow
                  title="Things you can hold"
                  items={siblingPhysical}
                />
                <SiblingRow
                  title="Files from the same stall"
                  items={siblingDigital}
                />
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
