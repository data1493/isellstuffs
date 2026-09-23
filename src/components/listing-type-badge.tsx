import { Badge } from "@/components/ui/badge";
import { isGiftListing, isPhysicalListing, type Listing } from "@/lib/commerce";
import { listingTypeLabel } from "@/lib/listing-display";

export function ListingTypeBadge({ listing }: { listing: Listing }) {
  if (isPhysicalListing(listing)) {
    return <Badge variant="secondary">{listingTypeLabel(listing)}</Badge>;
  }

  if (isGiftListing(listing)) {
    return <Badge variant="secondary">{listingTypeLabel(listing)}</Badge>;
  }

  return (
    <Badge
      variant="outline"
      className="border-accent-foreground/25 bg-accent/50 text-accent-foreground"
    >
      {listingTypeLabel(listing)}
    </Badge>
  );
}
