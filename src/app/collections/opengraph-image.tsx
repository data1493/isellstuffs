import { ogContentType, ogImage, ogSize } from "@/lib/og-image";
import { collectionRack, mallCollections } from "@/lib/collections";

export const alt = "Racks, not aisles — i sell stuffs";
export const size = ogSize;
export const contentType = ogContentType;

export default function CollectionsOpenGraphImage() {
  const counts = mallCollections.map((collection) => {
    const items = collectionRack(collection.slug);
    return `${collection.name} (${items.length})`;
  });

  return ogImage({
    kicker: "A rack, not a hub",
    title: "Racks, not aisles.",
    detail: counts.join(" · "),
    footer: "curated collections",
  });
}
