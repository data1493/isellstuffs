import { readFile } from "node:fs/promises";
import path from "node:path";

import { isDigitalListing } from "@/lib/commerce";
import {
  standInDownloadName,
  standInMimeType,
  standInPublicFile,
} from "@/lib/digital-folder";
import { liveListingById } from "@/lib/live-catalog";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ listingId: string }> },
) {
  const { listingId: rawId } = await params;
  const listingId = decodeURIComponent(rawId);
  const listing = liveListingById(listingId);

  if (!listing || !isDigitalListing(listing) || listing.status === "file-gone") {
    return new Response("No file on this slip.\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const relative = standInPublicFile(listing);
  const filePath = path.join(process.cwd(), "public", relative);

  try {
    const body = await readFile(filePath);
    const filename = standInDownloadName(listing);
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": standInMimeType(listing),
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Stand-in file is missing from the booth.\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
