import type { Metadata } from "next";

import { PriceTagView } from "@/components/price-tag-view";
import { listingTagPath } from "@/lib/paths";
import { priceTagForId } from "@/lib/price-tag";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type TagPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { id } = await params;
  const tag = priceTagForId(id);

  if (tag.kind === "missing") {
    return shareMetadata({
      title: "No tag for that listing",
      description: "No SKU with that id. Nothing to tape to a table.",
      path: listingTagPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (tag.kind !== "physical") {
    return shareMetadata({
      title: "No tag for a file",
      description: tag.refuse,
      path: listingTagPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Driveway tag · ${tag.title}`,
    description: `${tag.priceLabel} at ${tag.stallName}. ${tag.refuse}`,
    path: listingTagPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingTagPage({ params }: TagPageProps) {
  const { id } = await params;
  const tag = priceTagForId(id);

  return <PriceTagView tag={tag} />;
}
