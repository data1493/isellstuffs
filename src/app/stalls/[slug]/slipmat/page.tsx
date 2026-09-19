import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothSlipmatBoard } from "@/components/stalls/booth-slipmat-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_SLIPMAT_COOKIE_NAME,
  BOOTH_SLIPMAT_PAPER_LINE,
  boothSlipmatFor,
  parseBoothSlipmat,
  stallSlipmatPath,
} from "@/lib/booth-slipmat";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallSlipmatPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallSlipmatPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a slipmat · ${stall.boothName}`,
    description: `${BOOTH_SLIPMAT_PAPER_LINE} Tape the slipmat note on ${stall.boothName}. Still a crate. Still no deck.`,
    path: stallSlipmatPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallSlipmatPage({
  params,
  searchParams,
}: StallSlipmatPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothSlipmat(jar.get(BOOTH_SLIPMAT_COOKIE_NAME)?.value);
  const current = boothSlipmatFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothSlipmatBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
