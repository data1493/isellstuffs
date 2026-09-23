import { ListingGrid } from "@/components/browse/cards";
import { MallNotice } from "@/components/mall-notice";
import { listingsByStall } from "@/lib/commerce";

export function CampaignGoods({ stallId }: { stallId: string }) {
  const goods = listingsByStall(stallId);

  if (goods.length === 0) {
    return (
      <MallNotice
        padded={false}
        titleAs="h2"
        tone="empty"
        eyebrow="Their table"
        title="The booth is empty this window."
        body="Nothing on this booth right now. The placement still ran."
      />
    );
  }

  return <ListingGrid listings={goods} />;
}
