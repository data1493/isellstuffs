import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingRegisterView,
  type RegisterViewKind,
  type RegisterViewSheet,
} from "@/components/listing-register-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  REGISTER_COOKIE_NAME,
  REGISTER_HOST_ID,
  REGISTER_REFUSE_COPY,
  canTapeRegister,
  isListingRegisterOverlay,
  parseRegisterListingIds,
} from "@/lib/listing-register";
import { listingRegisterPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RegisterPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): RegisterViewKind {
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
    if (listing.id !== REGISTER_HOST_ID || !canTapeRegister(listing)) {
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

function registerSheetForId(id: string, registerIds: string[]): RegisterViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isRegister: listing ? isListingRegisterOverlay(listing.id, registerIds) : false,
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
}: RegisterPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const registerIds = parseRegisterListingIds(
    jar.get(REGISTER_COOKIE_NAME)?.value,
  );
  const sheet = registerSheetForId(id, registerIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: REGISTER_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a register note on.",
      path: listingRegisterPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: REGISTER_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a register note."
          : sheet.kind === "owned"
            ? "A register note is for the stained recipe cards. Another overlay already owns that listing."
            : "A jacket does not take a register note. A register note is for three scanned cards.",
      path: listingRegisterPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not register it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not register it. Still three cards. Still vibes. Still tote. Not proof. Not scale. Not a shop. Not bleed. Not an account.`,
    path: listingRegisterPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingRegisterPage({ params }: RegisterPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const registerIds = parseRegisterListingIds(
    jar.get(REGISTER_COOKIE_NAME)?.value,
  );
  const sheet = registerSheetForId(id, registerIds);

  return <ListingRegisterView sheet={sheet} registerIds={registerIds} />;
}
