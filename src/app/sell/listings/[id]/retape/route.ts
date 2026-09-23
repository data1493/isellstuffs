import { NextResponse, type NextRequest } from "next/server";

import { parseSellerListing } from "@/lib/seller-listing";
import { replaceSellerListing } from "@/lib/seller-overlay";
import { sellDeskPath, sellListingEditPath } from "@/lib/paths";

function safeOrigin(request: NextRequest) {
  const referer = request.headers.get("referer");
  return (
    request.headers.get("origin") ??
    (referer ? new URL(referer).origin : request.nextUrl.origin)
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const form = await request.formData();
  const parsed = parseSellerListing(form, { existingId: id });
  const origin = safeOrigin(request);

  if (!parsed.ok) {
    const next = new URL(sellListingEditPath(id), origin);
    next.searchParams.set("error", parsed.error);
    return NextResponse.redirect(next, 303);
  }

  const listing = replaceSellerListing(parsed.listing);
  if (!listing) {
    const next = new URL(sellListingEditPath(id), origin);
    next.searchParams.set(
      "error",
      "That listing is not on the overlay. List it first, then retape.",
    );
    return NextResponse.redirect(next, 303);
  }

  return NextResponse.redirect(new URL(sellDeskPath(), origin), 303);
}
