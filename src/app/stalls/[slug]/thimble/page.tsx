import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothThimbleBoard } from "@/components/stalls/booth-thimble-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_THIMBLE_COOKIE_NAME,
  BOOTH_THIMBLE_PAPER_LINE,
  boothThimbleFor,
  parseBoothThimble,
  stallThimblePath,
} from "@/lib/booth-thimble";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallThimblePageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallThimblePageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a thimble · ${stall.boothName}`,
    description: `${BOOTH_THIMBLE_PAPER_LINE} Tape the thimble note on ${stall.boothName}. Still a closet. Still worn twice.`,
    path: stallThimblePath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallThimblePage({
  params,
  searchParams,
}: StallThimblePageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothThimble(jar.get(BOOTH_THIMBLE_COOKIE_NAME)?.value);
  const current = boothThimbleFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothThimbleBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
