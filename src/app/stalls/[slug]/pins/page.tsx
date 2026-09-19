import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothPinsBoard } from "@/components/stalls/booth-pins-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_PINS_COOKIE_NAME,
  BOOTH_PINS_PAPER_LINE,
  boothPinsFor,
  parseBoothPins,
  stallPinsPath,
} from "@/lib/booth-pins";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallPinsPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallPinsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have pins · ${stall.boothName}`,
    description: `${BOOTH_PINS_PAPER_LINE} Tape the pins note on ${stall.boothName}. Hem stays.`,
    path: stallPinsPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallPinsPage({
  params,
  searchParams,
}: StallPinsPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothPins(jar.get(BOOTH_PINS_COOKIE_NAME)?.value);
  const current = boothPinsFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothPinsBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
