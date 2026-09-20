import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothHeadshellBoard } from "@/components/stalls/booth-headshell-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_HEADSHELL_COOKIE_NAME,
  BOOTH_HEADSHELL_PAPER_LINE,
  boothHeadshellFor,
  parseBoothHeadshell,
  stallHeadshellPath,
} from "@/lib/booth-headshell";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallHeadshellPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallHeadshellPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a headshell · ${stall.boothName}`,
    description: `${BOOTH_HEADSHELL_PAPER_LINE} Tape the headshell note on ${stall.boothName}. Still a crate. Still a skip.`,
    path: stallHeadshellPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallHeadshellPage({
  params,
  searchParams,
}: StallHeadshellPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothHeadshell(jar.get(BOOTH_HEADSHELL_COOKIE_NAME)?.value);
  const current = boothHeadshellFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothHeadshellBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
