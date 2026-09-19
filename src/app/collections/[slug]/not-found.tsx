import type { Metadata } from "next";
import Link from "next/link";

import { CollectionMissing } from "@/components/collections/collection-empty";
import { mallCollections } from "@/lib/collections";
import { collectionsPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const metadata: Metadata = shareMetadata({
  title: "Rack not on the map",
  description:
    "That collection was never taped. Under a ten, files tonight, and tested kinda are the racks we lined up.",
  path: collectionsPath(),
  robots: { index: false, follow: true },
});

export default function CollectionSlugNotFound() {
  return (
    <div>
      <CollectionMissing />
      <ul className="mx-auto flex w-full max-w-6xl flex-wrap justify-center gap-x-4 gap-y-2 px-4 pb-12 text-sm sm:px-6">
        {mallCollections.map((collection) => (
          <li key={collection.slug}>
            <Link
              href={collection.href}
              className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {collection.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
