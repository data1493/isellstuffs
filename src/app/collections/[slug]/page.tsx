import type { Metadata } from "next";
import Link from "next/link";

import {
  CollectionEmpty,
  CollectionMissing,
} from "@/components/collections/collection-empty";
import { RackCard } from "@/components/collections/rack-card";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/commerce";
import {
  collectionBySlug,
  collectionMix,
  collectionRack,
  collectionShareLine,
  collectionSlugs,
  otherCollections,
} from "@/lib/collections";
import { collectionsPath, listingPath } from "@/lib/paths";
import { collectionMetadata, missingCollectionMetadata } from "@/lib/seo";

export const dynamicParams = false;

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return collectionSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = collectionBySlug(slug);
  if (!collection) {
    return missingCollectionMetadata();
  }

  const items = collectionRack(collection.slug);
  return collectionMetadata({
    name: collection.name,
    description: collectionShareLine(collection, items),
    slug: collection.slug,
  });
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = collectionBySlug(slug);
  if (!collection) {
    return <CollectionMissing />;
  }

  const items = collectionRack(collection.slug);
  if (items.length === 0) {
    return <CollectionEmpty collection={collection} />;
  }

  const mix = collectionMix(items);
  const others = otherCollections(collection.slug);

  return (
    <div>
      <MallHero>
        <MallCrumb label={collection.name}>
          <CrumbSep />
          <Link
            href={collectionsPath()}
            className="hover:text-foreground hover:underline"
          >
            Collections
          </Link>
          <CrumbSep />
          <span className="text-foreground">{collection.name}</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            {collection.eyebrow}
          </Badge>
          <Badge variant="outline" className="rounded-full">
            A rack, not a hub
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            {collection.headline}
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {collection.blurb}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          {mix.physical}{" "}
          {mix.physical === 1 ? "thing you can hold" : "things you can hold"}
          {" · "}
          {mix.digital} {mix.digital === 1 ? "file" : "files"}
        </p>
      </MallHero>

      <MallSection>
        <div className="max-w-2xl">
          <MallEyebrow>The rack</MallEyebrow>
          <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
            {items.length} {items.length === 1 ? "tag" : "tags"}. One theme.
          </h2>
          <p className="mt-3 text-muted-foreground">{collection.rule}</p>
        </div>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.listing.id} className="min-w-0">
              <RackCard item={item} />
            </li>
          ))}
        </ol>
      </MallSection>

      <MallSection className="border-t border-border bg-card/60">
        <MallEyebrow>Take a tag</MallEyebrow>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <li key={`slip-${item.listing.id}`}>
              <Link
                href={listingPath(item.listing.id)}
                className="flex items-baseline justify-between gap-3 rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm hover:border-foreground/30"
              >
                <span className="min-w-0 truncate font-medium">
                  {item.listing.title}
                </span>
                <span className="shrink-0 font-heading">
                  {formatMoney(item.listing.price)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            className="rounded-full px-5"
            render={<Link href="/explore" />}
          >
            Walk the rest of the floor
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={collectionsPath()} />}
          >
            Other racks
          </Button>
        </div>

        {others.length > 0 ? (
          <aside className="mt-14 border-t border-border pt-10">
            <MallEyebrow>Other taped themes</MallEyebrow>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {others.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </MallSection>
    </div>
  );
}
