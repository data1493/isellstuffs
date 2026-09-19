import { FileDown, Gift, Hand } from "lucide-react";

import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";
import {
  listingFact,
  listingHubName,
  listingKindEyebrow,
  listingMediaKicker,
  listingMediaPreviewLine,
  listingTypeLabel,
} from "@/lib/listing-display";
import { cn } from "@/lib/utils";

export function ListingMediaPlaceholder({
  listing,
  compact = false,
  className,
}: {
  listing: Listing;
  compact?: boolean;
  className?: string;
}) {
  const physical = isPhysicalListing(listing);
  const gift = isGiftListing(listing);
  const Icon = physical ? Hand : gift ? Gift : FileDown;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-dashed",
        physical
          ? "border-primary/25 bg-[linear-gradient(165deg,var(--secondary),color-mix(in_oklch,var(--card)_70%,var(--secondary)))]"
          : "border-accent-foreground/20 bg-[linear-gradient(165deg,var(--accent),color-mix(in_oklch,var(--card)_55%,var(--accent)))]",
        compact ? "aspect-[16/10]" : "aspect-[4/3] sm:aspect-square",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 opacity-[0.18]",
          physical
            ? "bg-[repeating-linear-gradient(-12deg,transparent,transparent_12px,var(--primary)_12px,var(--primary)_13px)]"
            : "bg-[linear-gradient(90deg,color-mix(in_oklch,var(--accent-foreground)_18%,transparent)_1px,transparent_1px),linear-gradient(color-mix(in_oklch,var(--accent-foreground)_18%,transparent)_1px,transparent_1px)] bg-size-[18px_18px]",
        )}
      />
      <div
        className={cn(
          "relative flex h-full flex-col justify-between",
          compact ? "p-4" : "p-6 sm:p-8",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {listingTypeLabel(listing)} · {listingHubName(listing)}
          </p>
          <Icon
            aria-hidden
            className={cn(
              "shrink-0 text-foreground/70",
              compact ? "size-5" : "size-6",
            )}
          />
        </div>

        <div className={cn("max-w-sm", compact ? "mt-4" : "mt-8")}>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {listingKindEyebrow(listing)}
          </p>
          <p
            className={cn(
              "font-heading leading-snug tracking-tight",
              compact ? "mt-1 text-xl" : "mt-2 text-3xl sm:text-4xl",
            )}
          >
            {listingFact(listing)}
          </p>
          <p
            className={cn(
              "text-muted-foreground",
              compact ? "mt-2 text-xs" : "mt-3 text-sm leading-6",
            )}
          >
            {listingMediaKicker(listing)}. {listingMediaPreviewLine(listing)}
          </p>
        </div>
      </div>
    </div>
  );
}
