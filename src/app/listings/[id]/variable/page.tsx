import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingVariableView,
  type VariableViewKind,
  type VariableViewSheet,
} from "@/components/listing-variable-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  VARIABLE_COOKIE_NAME,
  VARIABLE_REFUSE_COPY,
  isListingVariableOverlay,
  parseVariableListingIds,
} from "@/lib/listing-variable";
import { listingVariablePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type VariablePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): VariableViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (isDigitalListing(listing)) {
    return listing.status === "file-gone" ? "file-gone" : "digital";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  return "physical";
}

function variableSheetForId(
  id: string,
  variableIds: string[],
): VariableViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isVariable: listing
      ? isListingVariableOverlay(listing.id, variableIds)
      : false,
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
}: VariablePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const variableIds = parseVariableListingIds(
    jar.get(VARIABLE_COOKIE_NAME)?.value,
  );
  const sheet = variableSheetForId(id, variableIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: VARIABLE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a variable note on.",
      path: listingVariablePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: VARIABLE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a variable note."
          : "A Game Boy does not take a variable note. Variable honesty is for a file on the digital lot.",
      path: listingVariablePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not variable it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not variable it. Two weights. Still almost-bold. Still tote. Not foundry. Not slant. Not bold.`,
    path: listingVariablePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingVariablePage({
  params,
}: VariablePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const variableIds = parseVariableListingIds(
    jar.get(VARIABLE_COOKIE_NAME)?.value,
  );
  const sheet = variableSheetForId(id, variableIds);

  return <ListingVariableView sheet={sheet} variableIds={variableIds} />;
}
