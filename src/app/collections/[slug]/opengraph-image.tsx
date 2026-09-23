import {
  collectionBySlug,
  collectionMix,
  collectionRack,
  collectionSlugs,
} from "@/lib/collections";
import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const alt = "A collection rack — i sell stuffs";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return collectionSlugs.map((slug) => ({ slug }));
}

export default async function CollectionOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = collectionBySlug(slug);
  if (!collection) {
    return ogImage({
      kicker: "Not on the map",
      title: "That rack was never taped.",
      detail: "Under a ten, files tonight, tested kinda.",
      footer: "collections",
    });
  }

  const items = collectionRack(collection.slug);
  const mix = collectionMix(items);

  return ogImage({
    kicker: `${collection.eyebrow} · not a hub`,
    title: collection.headline,
    detail:
      items.length === 0
        ? `${collection.name} is empty.`
        : `${mix.physical} you can hold, ${mix.digital} you can take as a file.`,
    footer: collection.name,
  });
}
