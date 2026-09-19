import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothMeterBoard } from "@/components/stalls/booth-meter-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_METER_COOKIE_NAME,
  BOOTH_METER_PAPER_LINE,
  boothMeterFor,
  parseBoothMeter,
  stallMeterPath,
} from "@/lib/booth-meter";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallMeterPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallMeterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a meter · ${stall.boothName}`,
    description: `${BOOTH_METER_PAPER_LINE} Tape the meter note on ${stall.boothName}. Sold as a pile.`,
    path: stallMeterPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallMeterPage({
  params,
  searchParams,
}: StallMeterPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothMeter(jar.get(BOOTH_METER_COOKIE_NAME)?.value);
  const current = boothMeterFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothMeterBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
