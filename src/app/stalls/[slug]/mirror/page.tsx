import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothMirrorBoard } from "@/components/stalls/booth-mirror-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_MIRROR_COOKIE_NAME,
  BOOTH_MIRROR_PAPER_LINE,
  boothMirrorFor,
  parseBoothMirror,
  stallMirrorPath,
} from "@/lib/booth-mirror";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallMirrorPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallMirrorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a mirror · ${stall.boothName}`,
    description: `${BOOTH_MIRROR_PAPER_LINE} Tape the mirror note on ${stall.boothName}. Still a rack.`,
    path: stallMirrorPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallMirrorPage({
  params,
  searchParams,
}: StallMirrorPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothMirror(jar.get(BOOTH_MIRROR_COOKIE_NAME)?.value);
  const current = boothMirrorFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothMirrorBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
