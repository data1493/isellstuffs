import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothDishesBoard } from "@/components/stalls/booth-dishes-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_DISHES_COOKIE_NAME,
  BOOTH_DISHES_PAPER_LINE,
  boothDishesFor,
  parseBoothDishes,
  stallDishesPath,
} from "@/lib/booth-dishes";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallDishesPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallDishesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't do dishes · ${stall.boothName}`,
    description: `${BOOTH_DISHES_PAPER_LINE} Tape the dishes note on ${stall.boothName}. Pour is I don't pour.`,
    path: stallDishesPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallDishesPage({
  params,
  searchParams,
}: StallDishesPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothDishes(jar.get(BOOTH_DISHES_COOKIE_NAME)?.value);
  const current = boothDishesFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothDishesBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
