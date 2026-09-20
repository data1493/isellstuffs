import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothLifterBoard } from "@/components/stalls/booth-lifter-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_LIFTER_COOKIE_NAME,
  BOOTH_LIFTER_PAPER_LINE,
  boothLifterFor,
  parseBoothLifter,
  stallLifterPath,
} from "@/lib/booth-lifter";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallLifterPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallLifterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a lifter · ${stall.boothName}`,
    description: `${BOOTH_LIFTER_PAPER_LINE} Tape the lifter note on ${stall.boothName}. Still a crate. Still a skip.`,
    path: stallLifterPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallLifterPage({
  params,
  searchParams,
}: StallLifterPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothLifter(jar.get(BOOTH_LIFTER_COOKIE_NAME)?.value);
  const current = boothLifterFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothLifterBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
