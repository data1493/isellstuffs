import type { Metadata } from "next";
import Link from "next/link";

import { CollectionTile } from "@/components/collections/collection-tile";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  collectionRack,
  mallCollections,
} from "@/lib/collections";
import { collectionsMetadata } from "@/lib/seo";

export const metadata: Metadata = collectionsMetadata();

export default function CollectionsPage() {
  return (
    <div>
      <MallHero>
        <MallCrumb label="Collections">
          <CrumbSep />
          <span className="text-foreground">Collections</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            A rack, not a hub
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a paid stamp
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Racks, not aisles.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Hubs have rules. These are opinions someone taped to a table —
            pocket money, files you can take tonight, and the pile that still
            does a thing. Same SKUs as the floor. No new aisle.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="max-w-2xl">
          <MallEyebrow>The racks</MallEyebrow>
          <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
            Three themes. One catalog.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Titles and prices stay on the stall. The tape is ours. Sold and
            file-gone do not sit here.
          </p>
        </div>

        <ul className="mt-8 grid gap-4 lg:grid-cols-3">
          {mallCollections.map((collection) => (
            <li key={collection.slug} className="min-w-0">
              <CollectionTile
                collection={collection}
                items={collectionRack(collection.slug)}
              />
            </li>
          ))}
        </ul>
      </MallSection>

      <MallSection className="border-t border-border bg-card/60">
        <MallEyebrow>Still want an aisle</MallEyebrow>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Collections do not replace hubs. If you want a floor with a rule,
          walk the map.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            className="rounded-full px-5"
            render={<Link href="/hubs" />}
          >
            Pick a hub
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/explore" />}
          >
            Walk the concourse
          </Button>
        </div>
      </MallSection>
    </div>
  );
}
