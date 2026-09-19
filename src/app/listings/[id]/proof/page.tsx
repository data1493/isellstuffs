import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingProofView,
  type ProofViewKind,
  type ProofViewSheet,
} from "@/components/listing-proof-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  PROOF_COOKIE_NAME,
  PROOF_HOST_ID,
  PROOF_REFUSE_COPY,
  canTapeProof,
  isListingProofOverlay,
  parseProofListingIds,
} from "@/lib/listing-proof";
import { listingProofPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ProofPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ProofViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (isDigitalListing(listing)) {
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    if (listing.id !== PROOF_HOST_ID || !canTapeProof(listing)) {
      return "owned";
    }
    return "digital";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  return "physical";
}

function proofSheetForId(id: string, proofIds: string[]): ProofViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isProof: listing ? isListingProofOverlay(listing.id, proofIds) : false,
    title: listing?.title ?? null,
    priceLabel: listing ? formatMoney(listing.price) : null,
    fact: listing
      ? isDigitalListing(listing)
        ? listing.fileFormat
        : listing.condition
      : null,
    stallName: stall?.boothName ?? listing?.stallId ?? null,
    stallSlug: stall?.slug ?? null,
    hubName: listing ? listingHubName(listing) : null,
    listing: listing ?? null,
  };
}

export async function generateMetadata({
  params,
}: ProofPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const proofIds = parseProofListingIds(jar.get(PROOF_COOKIE_NAME)?.value);
  const sheet = proofSheetForId(id, proofIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: PROOF_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a proof note on.",
      path: listingProofPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: PROOF_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a proof note."
          : sheet.kind === "owned"
            ? "A proof note is for the stained recipe cards. Another overlay already owns that listing."
            : "A lid does not take a proof note. A proof note is for three scanned cards.",
      path: listingProofPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not proof them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not proof them. Still three cards. Still vibes. Still tote. Not scale. Not cards. Not a shop. Not metric.`,
    path: listingProofPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingProofPage({ params }: ProofPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const proofIds = parseProofListingIds(jar.get(PROOF_COOKIE_NAME)?.value);
  const sheet = proofSheetForId(id, proofIds);

  return <ListingProofView sheet={sheet} proofIds={proofIds} />;
}
