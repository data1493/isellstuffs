import { hubFloorList, listingsByHub, mallHubs } from "@/lib/commerce";
import { hubBySlug } from "@/lib/browse";
import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const alt = "Hub aisle on i sell stuffs";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return mallHubs.map((hub) => ({ slug: hub.slug }));
}

export default async function HubOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hub = hubBySlug(slug);

  if (!hub) {
    return ogImage({
      kicker: "Hub",
      title: "That aisle is not in this mall",
      detail: hubFloorList(),
    });
  }

  const count = listingsByHub(hub.id).length;

  return ogImage({
    kicker: "Hub aisle",
    title: hub.name,
    detail: `${hub.blurb} ${count} listings.`,
    footer: hub.rule,
  });
}
