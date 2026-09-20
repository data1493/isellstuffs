import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothSnipsBoard } from "@/components/stalls/booth-snips-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_SNIPS_COOKIE_NAME,
  BOOTH_SNIPS_PAPER_LINE,
  boothSnipsFor,
  parseBoothSnips,
  stallSnipsPath,
} from "@/lib/booth-snips";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallSnipsPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallSnipsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have snips · ${stall.boothName}`,
    description: `${BOOTH_SNIPS_PAPER_LINE} Tape the snips note on ${stall.boothName}. Still a driveway. Still a tangle.`,
    path: stallSnipsPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallSnipsPage({
  params,
  searchParams,
}: StallSnipsPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothSnips(jar.get(BOOTH_SNIPS_COOKIE_NAME)?.value);
  const current = boothSnipsFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothSnipsBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
