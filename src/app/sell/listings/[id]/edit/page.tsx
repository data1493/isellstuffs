import type { Metadata } from "next";
import Link from "next/link";

import { RetapeForm } from "@/components/sell/retape-form";
import { RetapeLookup } from "@/components/sell/retape-lookup";
import { RetapeRefuse } from "@/components/sell/retape-refuse";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallHero, MallWidth } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { sellDeskPath, sellListingEditPath, sellPath } from "@/lib/paths";
import {
  isFixtureListingId,
  retapeRefuseCopy,
} from "@/lib/seller-listing";
import { sellerListingById } from "@/lib/seller-overlay";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RetapePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: RetapePageProps): Promise<Metadata> {
  const { id } = await params;

  if (isFixtureListingId(id)) {
    const copy = retapeRefuseCopy("fixture");
    return shareMetadata({
      title: copy.title,
      description: copy.body,
      path: sellListingEditPath(id),
      robots: { index: false, follow: true },
    });
  }

  const listing = sellerListingById(id);
  if (!listing) {
    const copy = retapeRefuseCopy("missing");
    return shareMetadata({
      title: copy.title,
      description: copy.body,
      path: sellListingEditPath(id),
      robots: { index: false, follow: true },
    });
  }

  return shareMetadata({
    title: `Retape ${listing.title}`,
    description:
      "Fix a typo or a price on an overlay listing. The SKU stays put. Catalog fixtures stay taped down.",
    path: sellListingEditPath(listing.id),
    robots: { index: false, follow: true },
  });
}

export default async function RetapeListingPage({
  params,
  searchParams,
}: RetapePageProps) {
  const { id } = await params;
  const query = await searchParams;
  const error = Array.isArray(query.error) ? query.error[0] : query.error;

  if (isFixtureListingId(id)) {
    return <RetapeRefuse kind="fixture" />;
  }

  const listing = sellerListingById(id);

  return (
    <div>
      <MallHero>
        <MallCrumb label="Retape listing">
          <CrumbSep />
          <Link href={sellPath()} className="hover:text-foreground hover:underline">
            Sell
          </Link>
          <CrumbSep />
          <Link
            href={sellDeskPath()}
            className="hover:text-foreground hover:underline"
          >
            Desk
          </Link>
          <CrumbSep />
          <span className="text-foreground">Retape</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Overlay only
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Same SKU
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-5xl">
            Retape the tag.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Fix the typo or the price. The listing id stays put, so the booth
            and the tote still point here. Catalog fixtures — the lamp, the
            chair, the gift card — stay taped down.
          </p>
        </div>
      </MallHero>

      <MallWidth className="py-12 sm:py-16">
        {listing ? (
          <RetapeForm listing={listing} error={error} />
        ) : (
          <RetapeLookup listingId={id} error={error} />
        )}
      </MallWidth>
    </div>
  );
}
