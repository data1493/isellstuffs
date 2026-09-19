import { NextResponse, type NextRequest } from "next/server";

import { stallById } from "@/lib/commerce";
import { parseSellerListing } from "@/lib/seller-listing";
import { addSellerListing } from "@/lib/seller-overlay";
import { listingPath, sellNewPath, stallPath } from "@/lib/paths";

function safeOrigin(request: NextRequest) {
  const referer = request.headers.get("referer");
  return (
    request.headers.get("origin") ??
    (referer ? new URL(referer).origin : request.nextUrl.origin)
  );
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const parsed = parseSellerListing(form);
  const origin = safeOrigin(request);

  if (!parsed.ok) {
    const next = new URL(sellNewPath(), origin);
    next.searchParams.set("error", parsed.error);
    return NextResponse.redirect(next, 303);
  }

  const listing = addSellerListing(parsed.listing);
  const stall = stallById(listing.stallId);
  const dest = stall ? stallPath(stall.slug) : listingPath(listing.id);
  return NextResponse.redirect(new URL(dest, origin), 303);
}
