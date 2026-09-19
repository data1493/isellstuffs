import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  formatMoney,
  isDigitalListing,
  listingsByStall,
  type Listing,
} from "@/lib/commerce";
import { listingPath } from "@/lib/paths";

function statusCopy(listing: Listing) {
  if (listing.status === "sold") return "Sold";
  if (listing.status === "file-gone") return "File gone";
  return "On the table";
}

export function CampaignGoods({ stallId }: { stallId: string }) {
  const goods = listingsByStall(stallId);

  if (goods.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-current/20 px-5 py-10 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-current/55">
          Their table
        </p>
        <p className="mt-3 text-sm leading-6 text-current/70">
          Nothing on this booth right now. The placement still ran.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {goods.map((listing) => {
        const gone = listing.status !== "available";
        const spec = isDigitalListing(listing)
          ? listing.fileFormat
          : listing.condition;

        return (
          <li key={listing.id}>
            <Link
              href={listingPath(listing.id)}
              className="flex h-full flex-col gap-3 rounded-xl bg-card p-4 text-foreground ring-1 ring-foreground/10 transition-shadow hover:ring-foreground/25"
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline">
                  {listing.type === "physical" ? "Physical" : "Digital"}
                </Badge>
                <Badge variant={gone ? "secondary" : "default"}>
                  {statusCopy(listing)}
                </Badge>
              </div>
              <h3 className="font-heading text-lg leading-snug tracking-tight text-balance">
                {listing.title}
              </h3>
              <p className="text-sm leading-6 text-muted-foreground text-pretty">
                {listing.summary}
              </p>
              <div className="mt-auto flex items-baseline justify-between gap-3">
                <p
                  className={
                    gone
                      ? "text-sm text-muted-foreground line-through"
                      : "font-heading text-2xl tracking-tight"
                  }
                >
                  {formatMoney(listing.price)}
                </p>
                <p className="text-right text-xs leading-5 text-muted-foreground">
                  {spec}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
