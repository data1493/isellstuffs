import type { Metadata } from "next";
import Link from "next/link";

import { ListingForm } from "@/components/sell/listing-form";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallHero, MallWidth } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { sellNewPath, sellPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = shareMetadata({
  title: "New listing",
  description:
    "Add a physical find or a digital file to a stall already on the floor. One booth can list both.",
  path: sellNewPath(),
});

type NewListingPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

export default async function NewListingPage({
  searchParams,
}: NewListingPageProps) {
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <div>
      <MallHero>
        <MallCrumb label="New listing">
          <CrumbSep />
          <Link href={sellPath()} className="hover:text-foreground hover:underline">
            Sell
          </Link>
          <CrumbSep />
          <span className="text-foreground">New listing</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Local table
          </Badge>
          <Badge variant="outline" className="rounded-full">
            No account
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-5xl">
            Unfold the table.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Pick a stall the mall already has. List something you can hold or
            a file from under the same table. The catalog the shop already
            reads will pick it up.
          </p>
        </div>
      </MallHero>

      <MallWidth className="py-12 sm:py-16">
        <ListingForm error={error} />
      </MallWidth>
    </div>
  );
}
