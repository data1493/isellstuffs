import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothSeatBoard } from "@/components/stalls/booth-seat-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_SEAT_COOKIE_NAME,
  BOOTH_SEAT_PAPER_LINE,
  boothSeatFor,
  parseBoothSeat,
  stallSeatPath,
} from "@/lib/booth-seat";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallSeatPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallSeatPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `Don't sit on the crate · ${stall.boothName}`,
    description: `${BOOTH_SEAT_PAPER_LINE} Tape the sit note on ${stall.boothName}. Stay is hangers.`,
    path: stallSeatPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallSeatPage({
  params,
  searchParams,
}: StallSeatPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothSeat(jar.get(BOOTH_SEAT_COOKIE_NAME)?.value);
  const current = boothSeatFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothSeatBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
